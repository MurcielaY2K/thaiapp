import { CardSRSState, UserProfile, VocabCard } from './types';
import { VOCABULARY } from './data/vocabulary';
import { getQuestsByRegion, getQuestById } from './data/quests';
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
} from './engine/sessionManager';
import {
  QuestProgress,
  QuestEvaluationInput,
  canStartQuest,
  createQuestProgress,
  startQuest,
  processSessionForQuests,
  getAvailableQuestIds,
  getQuestProgressPercent,
} from './engine/questEngine';
import { Session, ReviewQuality, GameRegion, Quest } from './types';
import { StorageAdapter } from './storage/storageAdapter';
import {
  AppState,
  SessionRecord,
  createAppState,
  touchLastSaved,
  applySRSUpdates,
  applyQuestProgressUpdates,
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

export interface QuestBoardEntry {
  quest: Quest;
  status: 'locked' | 'available' | 'active' | 'completed';
  progress: QuestProgress | null;
  progressPercent: number;
}

export interface EndSessionResult extends FinalizeSessionResult {
  completedQuestIds: string[];
  questRewards: Array<{ questId: string; xp: number; gold: number; gems: number; companionId: string | null }>;
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
 *   await game.init();                     // load or create profile
 *   game.acceptQuest('kt_01_first_steps'); // optional: UI-driven quest accept
 *   const session = game.startSession();
 *   while (!session.isComplete) {
 *     game.answerCard(quality, timeTakenMs);
 *   }
 *   const result = await game.endSession(); // persists everything
 */
export class GameFacade {
  private storage: StorageAdapter;
  private options: Required<GameFacadeOptions>;

  private _state: AppState | null = null;
  private _session: Session | null = null;
  /** SRS states touched during the current session — committed on endSession */
  private _pendingSRSUpdates: Map<string, CardSRSState> = new Map();
  /** Speaking scores collected this session for quest evaluation */
  private _sessionSpeakingScores: number[] = [];
  /** Card categories answered this session for quest evaluation */
  private _sessionCardCategories: string[] = [];

  constructor(storage: StorageAdapter, options: GameFacadeOptions = {}) {
    this.storage = storage;
    this.options = {
      dailyGoal: options.dailyGoal ?? 'regular',
      today: options.today ?? todayISO(),
    };
  }

  // ─── Initialisation ──────────────────────────────────────────────────────────

  /**
   * Load saved state or create a fresh profile.
   * Auto-accepts all currently available starter quests after load.
   */
  async init(newProfileName?: string, avatarId = 'avatar_1'): Promise<UserProfile> {
    const loaded = await this.storage.load();
    if (loaded) {
      this._state = loaded;
    } else {
      const profile = createNewProfile(newProfileName ?? 'Traveler', avatarId, this.options.today);
      this._state = createAppState(profile);
    }

    // Auto-accept available quests from every unlocked region
    this._autoAcceptAvailableQuests();
    await this.storage.save(this._state);

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

  // ─── Quest methods ────────────────────────────────────────────────────────────

  /**
   * Get all quests for a region with their current status and progress.
   * Useful for rendering a quest board screen.
   */
  getQuestBoard(region: GameRegion): QuestBoardEntry[] {
    const quests = getQuestsByRegion(region);
    const { completedQuestIds, activeQuestIds } = this.state.profile;
    const completedSet = new Set(completedQuestIds);
    const availableIds = new Set(
      getAvailableQuestIds(quests, completedQuestIds, activeQuestIds),
    );

    return quests.map(quest => {
      let status: QuestBoardEntry['status'];
      if (completedSet.has(quest.id)) {
        status = 'completed';
      } else if (activeQuestIds.includes(quest.id)) {
        status = 'active';
      } else if (availableIds.has(quest.id)) {
        status = 'available';
      } else {
        status = 'locked';
      }

      const progress = this.state.questProgress[quest.id] ?? null;
      return {
        quest,
        status,
        progress,
        progressPercent: progress ? getQuestProgressPercent(progress) : 0,
      };
    });
  }

  /** Accept a quest (moves it from available → active). */
  acceptQuest(questId: string): void {
    const quest = getQuestById(questId);
    if (!quest) throw new Error(`Unknown quest: ${questId}`);
    if (!canStartQuest(quest, this.state.profile)) {
      throw new Error(`Quest ${questId} is not available to start`);
    }

    const updatedProfile = startQuest(this.state.profile, questId);
    const progress = createQuestProgress(questId);

    this._state = applyQuestProgressUpdates(
      { ...this.state, profile: updatedProfile },
      { [questId]: progress },
    );
  }

  getQuestProgress(questId: string): QuestProgress | null {
    return this.state.questProgress[questId] ?? null;
  }

  // ─── Session management ───────────────────────────────────────────────────────

  startSession(): Session {
    const { today, dailyGoal } = this.options;
    const cards = this.unlockedCards();
    const srsMap = this.srsMap;

    for (const card of cards) {
      if (!srsMap.has(card.id)) {
        srsMap.set(card.id, createInitialSRSState(card.id, today));
      }
    }

    this._session = buildSession({ allCards: cards, srsMap, today, dailyGoal });
    this._pendingSRSUpdates.clear();
    this._sessionSpeakingScores = [];
    this._sessionCardCategories = [];
    return this._session;
  }

  answerCard(quality: ReviewQuality, timeTakenMs: number, speakingScore?: number): CardAnswerResult {
    if (!this._session) throw new Error('No active session — call startSession() first');
    if (this._session.isComplete) throw new Error('Session already complete');

    const { today } = this.options;
    const currentCard = this._session.cards[this._session.currentIndex];
    const card = currentCard.card;

    const existingSRS =
      this._pendingSRSUpdates.get(card.id) ??
      this.state.srsStates[card.id] ??
      createInitialSRSState(card.id, today);

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
    this._pendingSRSUpdates.set(card.id, result.updatedSRSState);
    this._sessionCardCategories.push(card.category);

    if (card.type === 'speaking' && speakingScore !== undefined) {
      this._sessionSpeakingScores.push(speakingScore);
    }

    return result;
  }

  getProgress() {
    if (!this._session) return null;
    return getSessionStats(this._session);
  }

  /**
   * Finalize: apply XP/streak/missions, evaluate quest progress, persist all.
   */
  async endSession(): Promise<EndSessionResult | null> {
    if (!this._session) return null;

    const { today } = this.options;
    const finalized = finalizeSession(this._session, this.state.profile, today);

    // Build quest evaluation input from session data
    const questInput: QuestEvaluationInput = {
      sessionSummary: finalized.summary,
      reviewedCardCategories: this._sessionCardCategories as any,
      speakingScores: this._sessionSpeakingScores,
      totalWordsLearned:
        finalized.updatedProfile.totalWordsLearned,
      totalCardsReviewed:
        finalized.updatedProfile.totalCardsReviewed,
    };

    // Evaluate active quests
    const { updatedProfile, updatedProgressMap, completedQuestIds, rewards } =
      processSessionForQuests(
        finalized.updatedProfile,
        this.state.questProgress,
        questInput,
      );

    // Auto-accept any newly unlocked quests (prerequisites now met)
    const profileAfterAutoAccept = this._autoAcceptForProfile(
      updatedProfile,
      updatedProgressMap,
    );

    // Session record
    const record: SessionRecord = {
      id: this._session.id,
      date: today,
      summary: finalized.summary,
    };

    // Commit everything atomically
    let next = this.state;
    next = { ...next, profile: profileAfterAutoAccept };
    next = applySRSUpdates(next, Array.from(this._pendingSRSUpdates.values()));
    next = applyQuestProgressUpdates(next, updatedProgressMap);
    next = appendSessionRecord(next, record);
    next = touchLastSaved(next);

    this._state = next;
    await this.storage.save(next);

    this._session = null;
    this._pendingSRSUpdates.clear();
    this._sessionSpeakingScores = [];
    this._sessionCardCategories = [];

    return {
      ...finalized,
      updatedProfile: profileAfterAutoAccept,
      completedQuestIds,
      questRewards: rewards.map(r => ({
        questId: completedQuestIds[rewards.indexOf(r)],
        xp: r.xpGained,
        gold: r.goldGained,
        gems: r.gemsGained,
        companionId: r.companionUnlocked,
      })),
    };
  }

  // ─── Profile mutations ────────────────────────────────────────────────────────

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
    this._sessionSpeakingScores = [];
    this._sessionCardCategories = [];
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

  /** Auto-accept all currently available quests from unlocked regions. */
  private _autoAcceptAvailableQuests(): void {
    const regions = this.state.profile.unlockedRegions;
    const updatedProgress = { ...this.state.questProgress };
    let updatedProfile = this.state.profile;

    for (const region of regions) {
      const quests = getQuestsByRegion(region);
      const available = getAvailableQuestIds(
        quests,
        updatedProfile.completedQuestIds,
        updatedProfile.activeQuestIds,
      );
      for (const questId of available) {
        updatedProfile = startQuest(updatedProfile, questId);
        if (!updatedProgress[questId]) {
          updatedProgress[questId] = createQuestProgress(questId);
        }
      }
    }

    this._state = applyQuestProgressUpdates(
      { ...this.state, profile: updatedProfile },
      updatedProgress,
    );
  }

  /** Same as _autoAcceptAvailableQuests but operates on provided profile/progress. */
  private _autoAcceptForProfile(
    profile: UserProfile,
    progressMap: Record<string, QuestProgress>,
  ): UserProfile {
    const regions = profile.unlockedRegions;
    let updatedProfile = profile;
    const updatedProgress = { ...progressMap };

    for (const region of regions) {
      const quests = getQuestsByRegion(region);
      const available = getAvailableQuestIds(
        quests,
        updatedProfile.completedQuestIds,
        updatedProfile.activeQuestIds,
      );
      for (const questId of available) {
        updatedProfile = startQuest(updatedProfile, questId);
        if (!updatedProgress[questId]) {
          updatedProgress[questId] = createQuestProgress(questId);
        }
      }
    }

    // Persist the new progress entries too
    this._state = applyQuestProgressUpdates(this.state, updatedProgress);
    return updatedProfile;
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
