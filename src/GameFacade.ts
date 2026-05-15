import { CardSRSState, UserProfile, VocabCard } from './types';
import { VOCABULARY, getCardsByRegion } from './data/vocabulary';
import { createInitialSRSState, buildReviewQueue, getMasteredCount, getStrugglingCards } from './engine/srs';
import { createNewProfile, getActiveCompanionBonuses } from './engine/gameEngine';
import {
  buildSession,
  processCardAnswer,
  finalizeSession,
  getSessionStats,
  DailyGoal,
  FinalizeSessionResult,
  CardAnswerResult,
  SessionSummary,
} from './engine/sessionManager';
import { Session, ReviewQuality } from './types';
import { StorageAdapter } from './storage/storageAdapter';
import {
  AppState,
  SessionRecord,
  createAppState,
  touchLastSaved,
  applySRSUpdates,
  appendSessionRecord,
} from './storage/appState';

// ─── Public surface ───────────────────────────────────────────────────────────

export interface DashboardStats {
  dueToday: number;
  newAvailable: number;
  masteredCards: number;
  totalCards: number;
  strugglingCards: number;
  currentStreak: number;
  totalXP: number;
  currentLevel: number;
  estimatedMinutes: number;
}

export interface GameFacadeOptions {
  dailyGoal?: DailyGoal;
  /** Override today's date (YYYY-MM-DD). Defaults to system date. */
  today?: string;
}

/**
 * GameFacade is the single entry-point for a UI.
 *
 * Lifecycle:
 *   const game = new GameFacade(storage);
 *   await game.init();           // load or create profile
 *   const session = await game.startSession();
 *   while (!session.isComplete) {
 *     const result = await game.answerCard(quality, timeTakenMs);
 *   }
 *   const summary = await game.endSession();
 */
export class GameFacade {
  private storage: StorageAdapter;
  private options: Required<GameFacadeOptions>;

  private _state: AppState | null = null;
  private _session: Session | null = null;
  /** SRS states touched during the current session (committed on endSession) */
  private _pendingSRSUpdates: Map<string, CardSRSState> = new Map();

  constructor(storage: StorageAdapter, options: GameFacadeOptions = {}) {
    this.storage = storage;
    this.options = {
      dailyGoal: options.dailyGoal ?? 'regular',
      today: options.today ?? todayISO(),
    };
  }

  // ─── Initialisation ─────────────────────────────────────────────────────────

  /**
   * Load saved state or create a fresh profile if none exists.
   * Must be called before any other method.
   */
  async init(newProfileName?: string, avatarId = 'avatar_1'): Promise<UserProfile> {
    const loaded = await this.storage.load();
    if (loaded) {
      this._state = loaded;
    } else {
      const name = newProfileName ?? 'Traveler';
      const profile = createNewProfile(name, avatarId, this.options.today);
      this._state = createAppState(profile);
      await this.storage.save(this._state);
    }
    return this._state.profile;
  }

  // ─── Read-only accessors ─────────────────────────────────────────────────────

  get profile(): UserProfile {
    return this.state.profile;
  }

  get srsMap(): Map<string, CardSRSState> {
    return new Map(Object.entries(this.state.srsStates));
  }

  getDashboardStats(): DashboardStats {
    const { today } = this.options;
    const allStates = Object.values(this.state.srsStates);
    const unlockedCards = this.unlockedCards();

    const dueStates = allStates.filter(s => s.nextReviewDate <= today && !s.isNew);
    const newAvailable = unlockedCards.filter(c => !this.state.srsStates[c.id]).length;

    const masteredCards = getMasteredCount(allStates);
    const strugglingCards = getStrugglingCards(allStates).length;

    const queueSize = buildReviewQueue(allStates, today).length + Math.min(newAvailable, 10);
    const estimatedMinutes = Math.ceil((queueSize * 25) / 60);

    return {
      dueToday: dueStates.length,
      newAvailable,
      masteredCards,
      totalCards: unlockedCards.length,
      strugglingCards,
      currentStreak: this.state.profile.currentStreak,
      totalXP: this.state.profile.totalXP,
      currentLevel: this.state.profile.currentLevel,
      estimatedMinutes,
    };
  }

  getSessionHistory(): SessionRecord[] {
    return [...this.state.sessionHistory];
  }

  // ─── Session management ──────────────────────────────────────────────────────

  startSession(): Session {
    const { today, dailyGoal } = this.options;
    const cards = this.unlockedCards();
    const srsMap = this.srsMap;

    // Seed initial SRS state for any card we've never seen
    for (const card of cards) {
      if (!srsMap.has(card.id)) {
        srsMap.set(card.id, createInitialSRSState(card.id, today));
      }
    }

    this._session = buildSession({ allCards: cards, srsMap, today, dailyGoal });
    this._pendingSRSUpdates.clear();
    return this._session;
  }

  /**
   * Answer the current card and advance the session.
   * Buffers the SRS update; nothing is written to storage until endSession().
   */
  answerCard(quality: ReviewQuality, timeTakenMs: number): CardAnswerResult {
    if (!this._session) throw new Error('No active session — call startSession() first');
    if (this._session.isComplete) throw new Error('Session already complete');

    const { today } = this.options;
    const currentCard = this._session.cards[this._session.currentIndex];
    const existingSRS =
      this._pendingSRSUpdates.get(currentCard.card.id) ??
      this.state.srsStates[currentCard.card.id] ??
      createInitialSRSState(currentCard.card.id, today);

    const companionBonuses = getActiveCompanionBonuses(this.state.profile);

    const result = processCardAnswer(
      this._session,
      quality,
      timeTakenMs,
      today,
      this.state.profile.currentStreak,
      companionBonuses,
      existingSRS,
    );

    this._session = result.updatedSession;
    this._pendingSRSUpdates.set(currentCard.card.id, result.updatedSRSState);

    return result;
  }

  /** Progress info for a progress bar while the session is active. */
  getProgress() {
    if (!this._session) return null;
    return getSessionStats(this._session);
  }

  /**
   * Finalize the session: apply XP, streak, missions, persist everything.
   * Returns null if no session is active.
   */
  async endSession(): Promise<FinalizeSessionResult | null> {
    if (!this._session) return null;

    const { today } = this.options;
    const finalized = finalizeSession(this._session, this.state.profile, today);

    // Build session record
    const record: SessionRecord = {
      id: this._session.id,
      date: today,
      summary: finalized.summary,
    };

    // Commit everything
    let next = this.state;
    next = { ...next, profile: finalized.updatedProfile };
    next = applySRSUpdates(next, Array.from(this._pendingSRSUpdates.values()));
    next = appendSessionRecord(next, record);
    next = touchLastSaved(next);

    this._state = next;
    await this.storage.save(next);

    this._session = null;
    this._pendingSRSUpdates.clear();

    return finalized;
  }

  // ─── Profile mutations ───────────────────────────────────────────────────────

  /** Persist any direct profile changes (e.g. selecting a companion). */
  async saveProfile(profile: UserProfile): Promise<void> {
    const next = touchLastSaved({ ...this.state, profile });
    this._state = next;
    await this.storage.save(next);
  }

  async resetProgress(): Promise<void> {
    await this.storage.clear();
    this._state = null;
    this._session = null;
    this._pendingSRSUpdates.clear();
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private get state(): AppState {
    if (!this._state) throw new Error('GameFacade not initialized — call init() first');
    return this._state;
  }

  private unlockedCards(): VocabCard[] {
    const { unlockedRegions } = this.state.profile;
    return VOCABULARY.filter(c => unlockedRegions.includes(c.region));
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
