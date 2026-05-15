import { Quest, QuestObjective, UserProfile, CardSRSState, SemanticCategory } from '../types';
import { SessionSummary } from './sessionManager';
import { getQuestById } from '../data/quests';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestObjectiveProgress {
  objectiveIndex: number;
  current: number;
  required: number;
  isComplete: boolean;
}

export interface QuestProgress {
  questId: string;
  objectives: QuestObjectiveProgress[];
  isComplete: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface QuestEvaluationInput {
  sessionSummary: SessionSummary;
  /** Cards reviewed this session, mapped to their category */
  reviewedCardCategories: SemanticCategory[];
  /** Overall speaking scores from this session (0–100 each) */
  speakingScores: number[];
  /** Total words learned ever (from profile.totalWordsLearned + session) */
  totalWordsLearned: number;
  /** Total cards reviewed ever (from profile.totalCardsReviewed + session) */
  totalCardsReviewed: number;
}

export interface QuestRewardResult {
  updatedProfile: UserProfile;
  xpGained: number;
  goldGained: number;
  gemsGained: number;
  companionUnlocked: string | null;
}

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * Returns quest IDs from `candidates` that are available for the player to start.
 * A quest is available when:
 *   - It is not already active or completed
 *   - All prerequisite quests are completed
 */
export function getAvailableQuestIds(
  candidates: Quest[],
  completedQuestIds: string[],
  activeQuestIds: string[],
): string[] {
  const completedSet = new Set(completedQuestIds);
  const activeSet = new Set(activeQuestIds);

  return candidates
    .filter(q => {
      if (completedSet.has(q.id) || activeSet.has(q.id)) return false;
      if (!q.prerequisiteQuestIds || q.prerequisiteQuestIds.length === 0) return true;
      return q.prerequisiteQuestIds.every(prereq => completedSet.has(prereq));
    })
    .map(q => q.id);
}

/**
 * Check if the player meets the requirements to unlock a specific quest.
 */
export function canStartQuest(
  quest: Quest,
  profile: UserProfile,
): boolean {
  const available = getAvailableQuestIds([quest], profile.completedQuestIds, profile.activeQuestIds);
  return available.includes(quest.id);
}

// ─── Progress tracking ────────────────────────────────────────────────────────

/** Create a fresh progress tracker for a quest. */
export function createQuestProgress(questId: string): QuestProgress {
  const quest = getQuestById(questId);
  if (!quest) throw new Error(`Unknown quest id: ${questId}`);

  return {
    questId,
    objectives: quest.objectives.map((obj, i) => ({
      objectiveIndex: i,
      current: 0,
      required: obj.count,
      isComplete: false,
    })),
    isComplete: false,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

/**
 * Evaluate session results against a quest's objectives and return
 * the updated progress. Objectives accumulate across sessions.
 */
export function evaluateQuestProgress(
  quest: Quest,
  current: QuestProgress,
  input: QuestEvaluationInput,
): QuestProgress {
  if (current.isComplete) return current;

  const updatedObjectives = current.objectives.map((prog, i) => {
    if (prog.isComplete) return prog;
    const obj = quest.objectives[i];
    const gained = measureObjectiveGain(obj, input);
    const next = Math.min(prog.current + gained, prog.required);
    return {
      ...prog,
      current: next,
      isComplete: next >= prog.required,
    };
  });

  const allComplete = updatedObjectives.every(o => o.isComplete);
  return {
    ...current,
    objectives: updatedObjectives,
    isComplete: allComplete,
    completedAt: allComplete ? new Date().toISOString() : null,
  };
}

/** How much did this session contribute toward a single objective? */
function measureObjectiveGain(obj: QuestObjective, input: QuestEvaluationInput): number {
  switch (obj.type) {
    case 'review_cards':
      return input.sessionSummary.cardsReviewed;

    case 'learn_words':
      if (obj.cardCategory) {
        return input.reviewedCardCategories.filter(c => c === obj.cardCategory).length;
      }
      return input.sessionSummary.newWordsLearned;

    case 'perfect_session':
      return input.sessionSummary.perfectSession ? 1 : 0;

    case 'speaking_score': {
      const minScore = obj.minimumScore ?? 70;
      return input.speakingScores.filter(s => s >= minScore).length;
    }

    case 'boss_battle':
      // Boss battles are triggered explicitly, not via normal sessions
      return 0;

    default:
      return 0;
  }
}

// ─── Reward application ───────────────────────────────────────────────────────

/**
 * Apply a completed quest's rewards to a user profile.
 */
export function applyQuestRewards(
  profile: UserProfile,
  quest: Quest,
): QuestRewardResult {
  const { rewards } = quest;

  const xpGained = rewards.xp;
  const goldGained = rewards.gold;
  const gemsGained = rewards.gems ?? 0;
  const companionUnlocked = rewards.companionId ?? null;

  let updated: UserProfile = {
    ...profile,
    totalXP: profile.totalXP + xpGained,
    gold: profile.gold + goldGained,
    gems: profile.gems + gemsGained,
    completedQuestIds: [...profile.completedQuestIds, quest.id],
    activeQuestIds: profile.activeQuestIds.filter(id => id !== quest.id),
  };

  if (companionUnlocked && !updated.collectedCompanionIds.includes(companionUnlocked)) {
    updated = {
      ...updated,
      collectedCompanionIds: [...updated.collectedCompanionIds, companionUnlocked],
    };
  }

  return { updatedProfile: updated, xpGained, goldGained, gemsGained, companionUnlocked };
}

// ─── Profile mutations ────────────────────────────────────────────────────────

/** Add a quest to the player's active list. */
export function startQuest(profile: UserProfile, questId: string): UserProfile {
  if (profile.activeQuestIds.includes(questId)) return profile;
  return { ...profile, activeQuestIds: [...profile.activeQuestIds, questId] };
}

// ─── Bulk evaluation (run after every session) ────────────────────────────────

/**
 * Evaluate all active quests and collect any that became complete.
 * Returns updated profile (with rewards applied) and completed quest IDs.
 */
export function processSessionForQuests(
  profile: UserProfile,
  progressMap: Record<string, QuestProgress>,
  input: QuestEvaluationInput,
): {
  updatedProfile: UserProfile;
  updatedProgressMap: Record<string, QuestProgress>;
  completedQuestIds: string[];
  rewards: QuestRewardResult[];
} {
  let updatedProfile = profile;
  const updatedProgressMap = { ...progressMap };
  const completedQuestIds: string[] = [];
  const rewards: QuestRewardResult[] = [];

  for (const questId of profile.activeQuestIds) {
    const quest = getQuestById(questId);
    if (!quest) continue;

    const current = progressMap[questId] ?? createQuestProgress(questId);
    const next = evaluateQuestProgress(quest, current, input);
    updatedProgressMap[questId] = next;

    if (next.isComplete && !current.isComplete) {
      const rewardResult = applyQuestRewards(updatedProfile, quest);
      updatedProfile = rewardResult.updatedProfile;
      completedQuestIds.push(questId);
      rewards.push(rewardResult);
    }
  }

  return { updatedProfile, updatedProgressMap, completedQuestIds, rewards };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Get a progress percentage (0–100) across all objectives. */
export function getQuestProgressPercent(progress: QuestProgress): number {
  if (progress.isComplete) return 100;
  const total = progress.objectives.reduce((s, o) => s + o.required, 0);
  const done = progress.objectives.reduce((s, o) => s + o.current, 0);
  if (total === 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}
