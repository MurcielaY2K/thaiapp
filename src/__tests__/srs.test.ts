import {
  createInitialSRSState,
  processReview,
  isDue,
  buildReviewQueue,
  getMasteredCount,
  getStrugglingCards,
} from '../engine/srs';
import { CardSRSState } from '../types';

const TODAY = '2026-05-15';
const TOMORROW = '2026-05-16';
const YESTERDAY = '2026-05-14';

describe('createInitialSRSState', () => {
  it('creates a new card state due today', () => {
    const state = createInitialSRSState('card_001', TODAY);
    expect(state.cardId).toBe('card_001');
    expect(state.isNew).toBe(true);
    expect(state.nextReviewDate).toBe(TODAY);
    expect(state.repetitions).toBe(0);
    expect(state.easeFactor).toBe(2.5);
  });
});

describe('processReview', () => {
  it('schedules next review at 1 day for first successful review', () => {
    const state = createInitialSRSState('card_001', TODAY);
    const updated = processReview(state, 3, 5000, TODAY); // Good
    expect(updated.repetitions).toBe(1);
    expect(updated.interval).toBe(1);
    expect(updated.isNew).toBe(false);
    expect(updated.nextReviewDate).toBe(TOMORROW);
  });

  it('schedules next review at 6 days for second successful review', () => {
    let state = createInitialSRSState('card_001', TODAY);
    state = processReview(state, 3, 5000, TODAY); // rep 1
    state = processReview(state, 3, 4000, TOMORROW); // rep 2
    expect(state.repetitions).toBe(2);
    expect(state.interval).toBe(6);
  });

  it('grows interval beyond 6 days on third+ reviews', () => {
    let state = createInitialSRSState('card_001', TODAY);
    state = processReview(state, 3, 5000, '2026-01-01');
    state = processReview(state, 3, 4000, '2026-01-02');
    state = processReview(state, 3, 3000, '2026-01-08'); // interval was 6
    expect(state.interval).toBeGreaterThan(6);
  });

  it('resets on Blackout (quality=0)', () => {
    let state = createInitialSRSState('card_001', TODAY);
    state = processReview(state, 3, 5000, TODAY);
    state = processReview(state, 3, 4000, TOMORROW);
    // Now at rep 2, reset
    state = processReview(state, 0, 10000, '2026-05-20'); // Blackout
    expect(state.repetitions).toBe(0);
    expect(state.interval).toBe(1);
    // Ease factor should decrease
    expect(state.easeFactor).toBeLessThan(2.5);
  });

  it('awards 0 XP for Blackout', () => {
    const state = createInitialSRSState('card_001', TODAY);
    const updated = processReview(state, 0, 8000, TODAY);
    expect(updated.correctReviews).toBe(0);
    expect(updated.totalReviews).toBe(1);
  });

  it('marks card as mastered when interval >= 30', () => {
    let state = createInitialSRSState('card_001', TODAY);
    // Simulate many perfect reviews
    let date = '2026-01-01';
    for (let i = 0; i < 10; i++) {
      state = processReview(state, 4, 2000, date);
      const d = new Date(date);
      d.setDate(d.getDate() + state.interval);
      date = d.toISOString().split('T')[0];
    }
    expect(state.isMastered).toBe(true);
    expect(state.interval).toBeGreaterThanOrEqual(30);
  });

  it('applies tonal decay for tonal cards', () => {
    let normalState = createInitialSRSState('card_normal', TODAY);
    let tonalState = createInitialSRSState('card_tonal', TODAY);
    // Two reps each to get past first intervals
    normalState = processReview(normalState, 3, 3000, TODAY);
    normalState = processReview(normalState, 3, 3000, TOMORROW);
    tonalState = processReview(tonalState, 3, 3000, TODAY, true);
    tonalState = processReview(tonalState, 3, 3000, TOMORROW, true);
    // Third review where intervals diverge
    normalState = processReview(normalState, 3, 3000, '2026-05-22', false);
    tonalState = processReview(tonalState, 3, 3000, '2026-05-22', true);
    expect(tonalState.interval).toBeLessThan(normalState.interval);
  });

  it('keeps last 20 reviews in history', () => {
    let state = createInitialSRSState('card_001', TODAY);
    for (let i = 0; i < 25; i++) {
      state = processReview(state, 3, 1000, TODAY);
    }
    expect(state.reviewHistory.length).toBe(20);
  });
});

describe('isDue', () => {
  it('returns true for cards due today', () => {
    const state = createInitialSRSState('card_001', TODAY);
    expect(isDue(state, TODAY)).toBe(true);
  });

  it('returns true for overdue cards', () => {
    const state: CardSRSState = {
      ...createInitialSRSState('card_001', YESTERDAY),
      nextReviewDate: YESTERDAY,
    };
    expect(isDue(state, TODAY)).toBe(true);
  });

  it('returns false for future cards', () => {
    const state: CardSRSState = {
      ...createInitialSRSState('card_001', TODAY),
      nextReviewDate: TOMORROW,
    };
    expect(isDue(state, TODAY)).toBe(false);
  });
});

describe('buildReviewQueue', () => {
  it('returns only due cards sorted by priority', () => {
    const base = { isNew: false, repetitions: 3, interval: 10, easeFactor: 2.5 };
    const states: CardSRSState[] = [
      { ...createInitialSRSState('future', TODAY), ...base, nextReviewDate: '2026-12-01' },
      { ...createInitialSRSState('today', TODAY), ...base, nextReviewDate: TODAY },
      { ...createInitialSRSState('overdue', TODAY), ...base, nextReviewDate: '2026-01-01' },
    ];

    const queue = buildReviewQueue(states, TODAY);
    expect(queue.length).toBe(2);
    expect(queue[0].cardId).toBe('overdue'); // overdue first
    expect(queue[1].cardId).toBe('today');
  });

  it('caps at maxCards', () => {
    const states = Array.from({ length: 100 }, (_, i) => ({
      ...createInitialSRSState(`card_${i}`, TODAY),
      nextReviewDate: TODAY,
    }));
    const queue = buildReviewQueue(states, TODAY, 50);
    expect(queue.length).toBe(50);
  });
});

describe('getMasteredCount', () => {
  it('counts only mastered cards', () => {
    const states: CardSRSState[] = [
      { ...createInitialSRSState('a', TODAY), isMastered: true },
      { ...createInitialSRSState('b', TODAY), isMastered: true },
      { ...createInitialSRSState('c', TODAY), isMastered: false },
    ];
    expect(getMasteredCount(states)).toBe(2);
  });
});

describe('getStrugglingCards', () => {
  it('identifies cards with low retention', () => {
    const struggling: CardSRSState = {
      ...createInitialSRSState('bad', TODAY),
      totalReviews: 10,
      correctReviews: 3,
    };
    const good: CardSRSState = {
      ...createInitialSRSState('good', TODAY),
      totalReviews: 10,
      correctReviews: 9,
    };
    const result = getStrugglingCards([struggling, good], 5, 0.6);
    expect(result).toHaveLength(1);
    expect(result[0].cardId).toBe('bad');
  });
});
