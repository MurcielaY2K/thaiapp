import { CardSRSState, ReviewQuality, ReviewRecord } from '../types';

// SM-2 algorithm adapted for ThaiQuest:
// - Tonal vocabulary gets a faster decay rate
// - Speaking cards always reset to interval=1 on failure
// - "Passive" vs "Active" recall tracked separately via card type

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

// Tonal words are harder to retain — intervals grow more slowly
const TONAL_DECAY_FACTOR = 0.85;

/**
 * Create initial SRS state for a brand-new card.
 */
export function createInitialSRSState(cardId: string, today: string): CardSRSState {
  return {
    cardId,
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReviewDate: today,
    lastReviewDate: null,
    totalReviews: 0,
    correctReviews: 0,
    isNew: true,
    isMastered: false,
    reviewHistory: [],
  };
}

/**
 * Process a review and return the updated SRS state.
 * quality: 0=Blackout, 1=Hard, 2=Okay, 3=Good, 4=Perfect
 * isTonal: true for speaking cards and tonal vocabulary (applies decay)
 */
export function processReview(
  state: CardSRSState,
  quality: ReviewQuality,
  timeTakenMs: number,
  today: string,
  isTonal: boolean = false,
): CardSRSState {
  // Map our 5-point scale to SM-2's 0–5 quality scale
  const sm2Quality = mapToSM2Quality(quality);

  const record: ReviewRecord = {
    date: today,
    quality,
    timeTakenMs,
  };

  const totalReviews = state.totalReviews + 1;
  const correctReviews = sm2Quality >= 3 ? state.correctReviews + 1 : state.correctReviews;

  let { repetitions, interval, easeFactor } = state;

  if (sm2Quality >= 3) {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.min(365, Math.round(interval * easeFactor));
      if (isTonal) {
        interval = Math.min(365, Math.round(interval * TONAL_DECAY_FACTOR));
      }
    }
    repetitions += 1;
  } else {
    // Failed recall — reset
    repetitions = 0;
    interval = 1;
    // Speaking cards that fail get a penalized ease factor
    if (quality === 0) {
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.3);
    }
  }

  // Update ease factor (SM-2 formula)
  easeFactor = easeFactor + (0.1 - (5 - sm2Quality) * (0.08 + (5 - sm2Quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const nextReviewDate = addDays(today, interval);
  const isMastered = interval >= 30;

  return {
    ...state,
    repetitions,
    interval,
    easeFactor,
    nextReviewDate,
    lastReviewDate: today,
    totalReviews,
    correctReviews,
    isNew: false,
    isMastered,
    reviewHistory: [...state.reviewHistory, record].slice(-20),
  };
}

/**
 * Determine if a card is due for review today or earlier.
 */
export function isDue(state: CardSRSState, today: string): boolean {
  return state.nextReviewDate <= today;
}

/**
 * Get the retention rate for a card (correctReviews / totalReviews).
 */
export function getRetentionRate(state: CardSRSState): number {
  if (state.totalReviews === 0) return 0;
  return state.correctReviews / state.totalReviews;
}

/**
 * Get a priority score for queue ordering.
 * Cards overdue get higher priority. New cards get moderate priority.
 */
export function getQueuePriority(state: CardSRSState, today: string): number {
  if (state.isNew) return 50;
  const daysOverdue = daysBetween(state.nextReviewDate, today);
  if (daysOverdue < 0) return 0;                  // not due yet
  if (daysOverdue === 0) return 60;               // due today
  return Math.min(100, 60 + daysOverdue * 5);    // overdue — higher priority
}

/**
 * Build an ordered review queue from a collection of SRS states.
 * Caps at maxCards to prevent overwhelming sessions.
 */
export function buildReviewQueue(
  states: CardSRSState[],
  today: string,
  maxCards: number = 80,
): CardSRSState[] {
  return states
    .filter(s => isDue(s, today))
    .sort((a, b) => getQueuePriority(b, today) - getQueuePriority(a, today))
    .slice(0, maxCards);
}

/**
 * Estimate minutes needed for a given queue of cards.
 * Assumes ~25 seconds per card average.
 */
export function estimateSessionMinutes(cardCount: number): number {
  return Math.ceil((cardCount * 25) / 60);
}

/**
 * Get cards that are struggling (retention < threshold).
 * Useful for the AI personalization engine.
 */
export function getStrugglingCards(
  states: CardSRSState[],
  minReviews: number = 5,
  retentionThreshold: number = 0.6,
): CardSRSState[] {
  return states.filter(
    s => s.totalReviews >= minReviews && getRetentionRate(s) < retentionThreshold,
  );
}

/**
 * Get mastered cards count.
 */
export function getMasteredCount(states: CardSRSState[]): number {
  return states.filter(s => s.isMastered).length;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function mapToSM2Quality(quality: ReviewQuality): number {
  // Our 0–4 scale → SM-2's 0–5 scale
  const map: Record<ReviewQuality, number> = {
    0: 0, // Blackout → complete failure
    1: 2, // Hard → recalled with difficulty
    2: 3, // Okay → recalled with hesitation (passing)
    3: 4, // Good → clean recall
    4: 5, // Perfect → instant recall
  };
  return map[quality];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}
