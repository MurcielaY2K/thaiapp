import {
  Session,
  SessionCard,
  SessionResult,
  SessionPhase,
  CardSRSState,
  VocabCard,
  ReviewQuality,
  UserProfile,
} from '../types';
import { buildReviewQueue, processReview, createInitialSRSState } from './srs';
import {
  calculateXP,
  updateStreak,
  applyXPGain,
  awardGold,
  getActiveCompanionBonuses,
  generateDailyMissions,
  shouldResetMissions,
  updateMissionProgress,
} from './gameEngine';

// Max new cards introduced per session (respects user's daily goal setting)
const NEW_CARDS_PER_SESSION: Record<'casual' | 'regular' | 'serious', number> = {
  casual:  5,
  regular: 10,
  serious: 20,
};

export type DailyGoal = keyof typeof NEW_CARDS_PER_SESSION;

// ─── Build a session ──────────────────────────────────────────────────────────

export interface SessionBuildOptions {
  allCards: VocabCard[];
  srsMap: Map<string, CardSRSState>;   // cardId → SRS state
  today: string;
  dailyGoal: DailyGoal;
  includeWarmup?: boolean;
  includeSpeaking?: boolean;
}

/**
 * Builds an ordered session from due reviews + new cards.
 * Order: warmup (listening, low pressure) → due reviews → new words → speaking sprint.
 */
export function buildSession(options: SessionBuildOptions): Session {
  const { allCards, srsMap, today, dailyGoal, includeWarmup = true, includeSpeaking = true } = options;

  const cardMap = new Map(allCards.map(c => [c.id, c]));

  // Separate cards into categories
  const newCards = allCards.filter(c => !srsMap.has(c.id) || srsMap.get(c.id)!.isNew);
  const existingStates = Array.from(srsMap.values());
  const dueQueue = buildReviewQueue(existingStates, today);

  const sessionCards: SessionCard[] = [];

  // Phase 1: Warmup — 5 listening/vocabulary cards from due queue (easy ones first)
  if (includeWarmup) {
    const warmupCards = dueQueue
      .filter(s => {
        const card = cardMap.get(s.cardId);
        return card && (card.type === 'listening' || card.type === 'vocabulary');
      })
      .slice(0, 5)
      .map(s => makeSessionCard(cardMap.get(s.cardId)!, s, 'warmup', false));
    sessionCards.push(...warmupCards);
  }

  // Phase 2: Due reviews (excluding ones already used in warmup)
  const warmupIds = new Set(sessionCards.map(sc => sc.card.id));
  const reviewCards = dueQueue
    .filter(s => !warmupIds.has(s.cardId))
    .map(s => makeSessionCard(cardMap.get(s.cardId)!, s, 'review', false));
  sessionCards.push(...reviewCards);

  // Phase 3: New words (capped by daily goal)
  const maxNewCards = NEW_CARDS_PER_SESSION[dailyGoal];
  const newSessionCards = newCards
    .slice(0, maxNewCards)
    .map(card => {
      const state = srsMap.get(card.id) ?? createInitialSRSState(card.id, today);
      return makeSessionCard(card, state, 'new_words', true);
    });
  sessionCards.push(...newSessionCards);

  // Phase 4: Speaking sprint — 5 speaking cards from due queue
  if (includeSpeaking) {
    const speakingCards = dueQueue
      .filter(s => {
        const card = cardMap.get(s.cardId);
        return card && card.type === 'speaking' && !warmupIds.has(s.cardId);
      })
      .slice(0, 5)
      .map(s => makeSessionCard(cardMap.get(s.cardId)!, s, 'speaking', false));
    sessionCards.push(...speakingCards);
  }

  return {
    id: generateId(),
    startedAt: new Date().toISOString(),
    cards: sessionCards,
    currentIndex: 0,
    xpEarned: 0,
    results: [],
    isComplete: false,
  };
}

// ─── Process a single card answer ─────────────────────────────────────────────

export interface CardAnswerResult {
  updatedSession: Session;
  updatedSRSState: CardSRSState;
  xpEarned: number;
  isSessionComplete: boolean;
}

export function processCardAnswer(
  session: Session,
  quality: ReviewQuality,
  timeTakenMs: number,
  today: string,
  currentStreak: number,
  activeCompanionBonuses: string[],
  existingSRSState?: CardSRSState,
): CardAnswerResult {
  const currentCard = session.cards[session.currentIndex];
  const card = currentCard.card;
  const isTonal = card.type === 'speaking' || card.tone !== undefined;

  const srsState = existingSRSState ?? createInitialSRSState(card.id, today);
  const updatedSRSState = processReview(srsState, quality, timeTakenMs, today, isTonal);

  const { xp } = calculateXP(
    card.type,
    quality,
    currentCard.isNew,
    currentStreak,
    activeCompanionBonuses as any,
  );

  const result: SessionResult = {
    cardId: card.id,
    quality,
    timeTakenMs,
    xpEarned: xp,
    wasNew: currentCard.isNew,
  };

  const nextIndex = session.currentIndex + 1;
  const isSessionComplete = nextIndex >= session.cards.length;

  const updatedSession: Session = {
    ...session,
    currentIndex: nextIndex,
    xpEarned: session.xpEarned + xp,
    results: [...session.results, result],
    isComplete: isSessionComplete,
  };

  return { updatedSession, updatedSRSState, xpEarned: xp, isSessionComplete };
}

// ─── Finalize a completed session ─────────────────────────────────────────────

export interface SessionSummary {
  cardsReviewed: number;
  newWordsLearned: number;
  xpEarned: number;
  goldEarned: number;
  accuracy: number;            // 0–1
  perfectSession: boolean;     // no Blackout answers
  averageTimeSec: number;
  sessionDurationSec: number;
}

export interface FinalizeSessionResult {
  updatedProfile: UserProfile;
  summary: SessionSummary;
  levelUpEvent: { didLevelUp: boolean; oldLevel: number; newLevel: number; newRegionsUnlocked: string[] };
  streakUpdate: { streakLost: boolean; shieldUsed: boolean; streakMilestone: number | null };
}

export function finalizeSession(
  session: Session,
  profile: UserProfile,
  today: string,
): FinalizeSessionResult {
  const results = session.results;

  const cardsReviewed = results.length;
  const newWordsLearned = results.filter(r => r.wasNew).length;
  const xpEarned = session.xpEarned;

  const perfectSession = results.every(r => r.quality > 0);
  const bonusXP = perfectSession ? 100 : 0;
  const totalXP = xpEarned + bonusXP;

  const correctAnswers = results.filter(r => r.quality >= 3).length;
  const accuracy = cardsReviewed > 0 ? correctAnswers / cardsReviewed : 0;

  const totalTimeMs = results.reduce((sum, r) => sum + r.timeTakenMs, 0);
  const averageTimeSec = cardsReviewed > 0 ? totalTimeMs / cardsReviewed / 1000 : 0;
  const sessionDurationSec = (Date.now() - new Date(session.startedAt).getTime()) / 1000;

  // Gold: 1 gold per 3 cards reviewed + quality bonus
  const goldEarned = Math.round(cardsReviewed / 3 + correctAnswers * 0.5);

  // Reset daily missions if needed
  let updatedProfile = profile;
  if (shouldResetMissions(profile, today)) {
    updatedProfile = { ...updatedProfile, dailyMissions: generateDailyMissions(today), lastMissionResetDate: today };
  }

  // Update mission progress
  updatedProfile = {
    ...updatedProfile,
    dailyMissions: updatedProfile.dailyMissions.map(m => {
      if (m.objective.type === 'review_cards') {
        return updateMissionProgress(m, cardsReviewed);
      }
      if (m.objective.type === 'learn_words') {
        return updateMissionProgress(m, newWordsLearned);
      }
      if (m.objective.type === 'perfect_session' && perfectSession) {
        return updateMissionProgress(m, 1);
      }
      return m;
    }),
  };

  // Update stats
  updatedProfile = {
    ...updatedProfile,
    totalCardsReviewed: updatedProfile.totalCardsReviewed + cardsReviewed,
    totalWordsLearned: updatedProfile.totalWordsLearned + newWordsLearned,
    gold: updatedProfile.gold + goldEarned,
  };

  // Apply XP & level up check
  const { profile: profileAfterXP, event: levelUpEvent } = applyXPGain(updatedProfile, totalXP);
  updatedProfile = profileAfterXP;

  // Update streak
  const streakResult = updateStreak(updatedProfile, today);
  updatedProfile = streakResult.profile;

  const summary: SessionSummary = {
    cardsReviewed,
    newWordsLearned,
    xpEarned: totalXP,
    goldEarned,
    accuracy,
    perfectSession,
    averageTimeSec,
    sessionDurationSec,
  };

  return {
    updatedProfile,
    summary,
    levelUpEvent,
    streakUpdate: {
      streakLost: streakResult.streakLost,
      shieldUsed: streakResult.shieldUsed,
      streakMilestone: streakResult.streakMilestone,
    },
  };
}

// ─── Session statistics ───────────────────────────────────────────────────────

export function getSessionStats(session: Session) {
  const total = session.cards.length;
  const answered = session.results.length;
  const remaining = total - answered;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  return { total, answered, remaining, percent };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSessionCard(
  card: VocabCard,
  srsState: CardSRSState,
  phase: SessionPhase,
  isNew: boolean,
): SessionCard {
  return { card, srsState, phase, isNew };
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
