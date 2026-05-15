import {
  getAvailableQuestIds,
  canStartQuest,
  createQuestProgress,
  evaluateQuestProgress,
  applyQuestRewards,
  startQuest,
  processSessionForQuests,
  getQuestProgressPercent,
  QuestEvaluationInput,
} from '../engine/questEngine';
import { createNewProfile } from '../engine/gameEngine';
import { ALL_QUESTS, getQuestById, getQuestsByRegion } from '../data/quests';
import { Quest, UserProfile } from '../types';
import { SessionSummary } from '../engine/sessionManager';

const TODAY = '2026-05-15';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...createNewProfile('Tester', 'avatar_1', TODAY), ...overrides };
}

const BASE_SUMMARY: SessionSummary = {
  cardsReviewed: 10,
  newWordsLearned: 5,
  xpEarned: 80,
  goldEarned: 4,
  accuracy: 0.8,
  perfectSession: false,
  averageTimeSec: 5,
  sessionDurationSec: 60,
};

const BASE_INPUT: QuestEvaluationInput = {
  sessionSummary: BASE_SUMMARY,
  reviewedCardCategories: ['food', 'food', 'greetings', 'greetings', 'food'],
  speakingScores: [80, 65, 90],
  totalWordsLearned: 15,
  totalCardsReviewed: 30,
};

// ─── Quest data integrity ─────────────────────────────────────────────────────

describe('quest data', () => {
  it('ALL_QUESTS has at least 10 entries', () => {
    expect(ALL_QUESTS.length).toBeGreaterThanOrEqual(10);
  });

  it('all quests have required fields', () => {
    ALL_QUESTS.forEach(q => {
      expect(q.id).toBeTruthy();
      expect(q.type).toBeTruthy();
      expect(q.region).toBeTruthy();
      expect(q.title).toBeTruthy();
      expect(q.objectives.length).toBeGreaterThan(0);
      expect(q.rewards.xp).toBeGreaterThan(0);
    });
  });

  it('all quest IDs are unique', () => {
    const ids = ALL_QUESTS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prerequisite quest IDs reference existing quests', () => {
    const allIds = new Set(ALL_QUESTS.map(q => q.id));
    ALL_QUESTS.forEach(q => {
      q.prerequisiteQuestIds?.forEach(prereq => {
        expect(allIds.has(prereq)).toBe(true);
      });
    });
  });

  it('getQuestsByRegion returns only quests for that region', () => {
    const quests = getQuestsByRegion('krung_thon');
    quests.forEach(q => expect(q.region).toBe('krung_thon'));
  });

  it('getQuestById returns correct quest', () => {
    const q = getQuestById('kt_01_first_steps');
    expect(q?.title).toBe('First Steps on the Dock');
  });

  it('getQuestById returns undefined for unknown id', () => {
    expect(getQuestById('nonexistent')).toBeUndefined();
  });
});

// ─── getAvailableQuestIds ─────────────────────────────────────────────────────

describe('getAvailableQuestIds', () => {
  const quests = getQuestsByRegion('krung_thon');

  it('returns starter quests when nothing completed', () => {
    const available = getAvailableQuestIds(quests, [], []);
    // kt_01 has no prerequisites — should be available
    expect(available).toContain('kt_01_first_steps');
  });

  it('does not include already-active quests', () => {
    const available = getAvailableQuestIds(quests, [], ['kt_01_first_steps']);
    expect(available).not.toContain('kt_01_first_steps');
  });

  it('does not include already-completed quests', () => {
    const available = getAvailableQuestIds(quests, ['kt_01_first_steps'], []);
    expect(available).not.toContain('kt_01_first_steps');
  });

  it('unlocks next quest after completing prerequisite', () => {
    // kt_02 requires kt_01
    const available = getAvailableQuestIds(quests, ['kt_01_first_steps'], []);
    expect(available).toContain('kt_02_market_greetings');
  });

  it('does not unlock quest if prerequisite not yet completed', () => {
    const available = getAvailableQuestIds(quests, [], []);
    expect(available).not.toContain('kt_02_market_greetings');
  });

  it('does not unlock boss quest until all preceding quests done', () => {
    // kt_10 requires kt_09
    const available = getAvailableQuestIds(quests, [], []);
    expect(available).not.toContain('kt_10_harbor_master');
  });
});

// ─── canStartQuest ────────────────────────────────────────────────────────────

describe('canStartQuest', () => {
  it('returns true for starter quest with fresh profile', () => {
    const profile = makeProfile();
    const quest = getQuestById('kt_01_first_steps')!;
    expect(canStartQuest(quest, profile)).toBe(true);
  });

  it('returns false if quest already active', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_01_first_steps'] });
    const quest = getQuestById('kt_01_first_steps')!;
    expect(canStartQuest(quest, profile)).toBe(false);
  });

  it('returns false if quest already completed', () => {
    const profile = makeProfile({ completedQuestIds: ['kt_01_first_steps'] });
    const quest = getQuestById('kt_01_first_steps')!;
    expect(canStartQuest(quest, profile)).toBe(false);
  });

  it('returns false if prerequisites unmet', () => {
    const profile = makeProfile();
    const quest = getQuestById('kt_02_market_greetings')!;
    expect(canStartQuest(quest, profile)).toBe(false);
  });
});

// ─── createQuestProgress ──────────────────────────────────────────────────────

describe('createQuestProgress', () => {
  it('creates progress with all objectives at 0', () => {
    const prog = createQuestProgress('kt_01_first_steps');
    expect(prog.questId).toBe('kt_01_first_steps');
    expect(prog.isComplete).toBe(false);
    prog.objectives.forEach(o => expect(o.current).toBe(0));
  });

  it('sets required count from quest definition', () => {
    const prog = createQuestProgress('kt_01_first_steps');
    expect(prog.objectives[0].required).toBe(10); // learn_words: 10
  });

  it('throws for unknown quest id', () => {
    expect(() => createQuestProgress('does_not_exist')).toThrow();
  });
});

// ─── evaluateQuestProgress ────────────────────────────────────────────────────

describe('evaluateQuestProgress', () => {
  it('increments learn_words objective from session', () => {
    const quest = getQuestById('kt_01_first_steps')!;
    const prog = createQuestProgress('kt_01_first_steps');
    const updated = evaluateQuestProgress(quest, prog, BASE_INPUT);
    expect(updated.objectives[0].current).toBe(5); // 5 new words in session
  });

  it('marks objective complete when count reaches required', () => {
    const quest = getQuestById('kt_01_first_steps')!;
    const prog = createQuestProgress('kt_01_first_steps');
    // Need 10 words; give 10 in one session
    const input: QuestEvaluationInput = {
      ...BASE_INPUT,
      sessionSummary: { ...BASE_SUMMARY, newWordsLearned: 10 },
    };
    const updated = evaluateQuestProgress(quest, prog, input);
    expect(updated.objectives[0].isComplete).toBe(true);
    expect(updated.isComplete).toBe(true);
  });

  it('does not exceed required count', () => {
    const quest = getQuestById('kt_01_first_steps')!;
    const prog = createQuestProgress('kt_01_first_steps');
    const input: QuestEvaluationInput = {
      ...BASE_INPUT,
      sessionSummary: { ...BASE_SUMMARY, newWordsLearned: 100 },
    };
    const updated = evaluateQuestProgress(quest, prog, input);
    expect(updated.objectives[0].current).toBe(10); // capped at required
  });

  it('returns same progress if already complete', () => {
    const quest = getQuestById('kt_01_first_steps')!;
    const prog = { ...createQuestProgress('kt_01_first_steps'), isComplete: true };
    const updated = evaluateQuestProgress(quest, prog, BASE_INPUT);
    expect(updated).toBe(prog); // same reference — no mutation
  });

  it('tracks category-specific learn_words', () => {
    const quest = getQuestById('kt_02_market_greetings')!; // category: greetings, count: 5
    const prog = createQuestProgress('kt_02_market_greetings');
    // input has 2 greeting cards
    const updated = evaluateQuestProgress(quest, prog, BASE_INPUT);
    expect(updated.objectives[0].current).toBe(2);
  });

  it('tracks perfect_session objective', () => {
    const quest = getQuestById('kt_07_flawless')!;
    const prog = createQuestProgress('kt_07_flawless');
    const input: QuestEvaluationInput = {
      ...BASE_INPUT,
      sessionSummary: { ...BASE_SUMMARY, perfectSession: true },
    };
    const updated = evaluateQuestProgress(quest, prog, input);
    expect(updated.objectives[0].current).toBe(1);
    expect(updated.isComplete).toBe(true);
  });

  it('does not count imperfect session toward perfect_session', () => {
    const quest = getQuestById('kt_07_flawless')!;
    const prog = createQuestProgress('kt_07_flawless');
    const updated = evaluateQuestProgress(quest, prog, BASE_INPUT); // perfectSession: false
    expect(updated.objectives[0].current).toBe(0);
  });

  it('tracks speaking_score objective', () => {
    const quest = getQuestById('kt_08_voice')!; // speaking_score count: 5, min: 70
    const prog = createQuestProgress('kt_08_voice');
    // BASE_INPUT has scores [80, 65, 90] → 2 pass (80 and 90 ≥ 70)
    const updated = evaluateQuestProgress(quest, prog, BASE_INPUT);
    expect(updated.objectives[0].current).toBe(2);
  });

  it('accumulates progress across multiple sessions', () => {
    const quest = getQuestById('kt_01_first_steps')!;
    let prog = createQuestProgress('kt_01_first_steps');
    const input3: QuestEvaluationInput = {
      ...BASE_INPUT,
      sessionSummary: { ...BASE_SUMMARY, newWordsLearned: 3 },
    };
    prog = evaluateQuestProgress(quest, prog, input3);  // +3
    prog = evaluateQuestProgress(quest, prog, input3);  // +3 = 6
    prog = evaluateQuestProgress(quest, prog, input3);  // +3 = 9
    expect(prog.objectives[0].current).toBe(9);
    expect(prog.isComplete).toBe(false);
    prog = evaluateQuestProgress(quest, prog, input3);  // +3 but capped at 10
    expect(prog.objectives[0].current).toBe(10);
    expect(prog.isComplete).toBe(true);
  });
});

// ─── applyQuestRewards ────────────────────────────────────────────────────────

describe('applyQuestRewards', () => {
  it('adds XP and gold to profile', () => {
    const profile = makeProfile({ totalXP: 0, gold: 0 });
    const quest = getQuestById('kt_01_first_steps')!;
    const result = applyQuestRewards(profile, quest);
    expect(result.updatedProfile.totalXP).toBe(quest.rewards.xp);
    expect(result.updatedProfile.gold).toBe(quest.rewards.gold);
  });

  it('adds gems when reward includes them', () => {
    const profile = makeProfile({ gems: 0 });
    const quest = getQuestById('kt_06_daily_discipline')!; // has gems: 1
    const result = applyQuestRewards(profile, quest);
    expect(result.updatedProfile.gems).toBe(1);
  });

  it('unlocks companion when reward includes one', () => {
    const profile = makeProfile({ collectedCompanionIds: [] });
    const quest = getQuestById('kt_08_voice')!; // companionId: 'phi_lok'
    const result = applyQuestRewards(profile, quest);
    expect(result.companionUnlocked).toBe('phi_lok');
    expect(result.updatedProfile.collectedCompanionIds).toContain('phi_lok');
  });

  it('does not duplicate companion if already collected', () => {
    const profile = makeProfile({ collectedCompanionIds: ['phi_lok'] });
    const quest = getQuestById('kt_08_voice')!;
    const result = applyQuestRewards(profile, quest);
    const count = result.updatedProfile.collectedCompanionIds.filter(c => c === 'phi_lok').length;
    expect(count).toBe(1);
  });

  it('moves quest from active to completed', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_01_first_steps'] });
    const quest = getQuestById('kt_01_first_steps')!;
    const result = applyQuestRewards(profile, quest);
    expect(result.updatedProfile.completedQuestIds).toContain('kt_01_first_steps');
    expect(result.updatedProfile.activeQuestIds).not.toContain('kt_01_first_steps');
  });
});

// ─── startQuest ──────────────────────────────────────────────────────────────

describe('startQuest', () => {
  it('adds quest to activeQuestIds', () => {
    const profile = makeProfile();
    const updated = startQuest(profile, 'kt_01_first_steps');
    expect(updated.activeQuestIds).toContain('kt_01_first_steps');
  });

  it('is idempotent — does not duplicate', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_01_first_steps'] });
    const updated = startQuest(profile, 'kt_01_first_steps');
    const count = updated.activeQuestIds.filter(id => id === 'kt_01_first_steps').length;
    expect(count).toBe(1);
  });
});

// ─── processSessionForQuests ──────────────────────────────────────────────────

describe('processSessionForQuests', () => {
  it('completes quest and returns rewards when objectives met', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_07_flawless'] });
    const progressMap = { kt_07_flawless: createQuestProgress('kt_07_flawless') };
    const input: QuestEvaluationInput = {
      ...BASE_INPUT,
      sessionSummary: { ...BASE_SUMMARY, perfectSession: true },
    };

    const { completedQuestIds, rewards } = processSessionForQuests(profile, progressMap, input);
    expect(completedQuestIds).toContain('kt_07_flawless');
    expect(rewards[0].xpGained).toBeGreaterThan(0);
  });

  it('does not complete quest if not yet all objectives met', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_01_first_steps'] });
    const progressMap = { kt_01_first_steps: createQuestProgress('kt_01_first_steps') };
    // Only 5 words — need 10
    const { completedQuestIds } = processSessionForQuests(profile, progressMap, BASE_INPUT);
    expect(completedQuestIds).toHaveLength(0);
  });

  it('updates progressMap with new counts', () => {
    const profile = makeProfile({ activeQuestIds: ['kt_01_first_steps'] });
    const progressMap = { kt_01_first_steps: createQuestProgress('kt_01_first_steps') };
    const { updatedProgressMap } = processSessionForQuests(profile, progressMap, BASE_INPUT);
    expect(updatedProgressMap['kt_01_first_steps'].objectives[0].current).toBe(5);
  });
});

// ─── getQuestProgressPercent ──────────────────────────────────────────────────

describe('getQuestProgressPercent', () => {
  it('returns 0 for fresh progress', () => {
    const prog = createQuestProgress('kt_01_first_steps');
    expect(getQuestProgressPercent(prog)).toBe(0);
  });

  it('returns 100 for complete progress', () => {
    const prog = { ...createQuestProgress('kt_01_first_steps'), isComplete: true };
    expect(getQuestProgressPercent(prog)).toBe(100);
  });

  it('returns 50 at halfway', () => {
    const prog = createQuestProgress('kt_01_first_steps');
    prog.objectives[0].current = 5; // halfway to 10
    expect(getQuestProgressPercent(prog)).toBe(50);
  });
});
