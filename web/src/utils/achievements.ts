import { UserProfile } from '@engine/types';
import { DashboardStats } from '@engine/GameFacade';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  check: (profile: UserProfile, stats: DashboardStats) => boolean;
  /** Returns [current, goal] for progress display, or null if not applicable */
  progress?: (profile: UserProfile, stats: DashboardStats) => [number, number] | null;
}

const STORAGE_KEY = 'thaiquest:earned_achievements';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step',    icon: '👣', rarity: 'common',    title: 'First Step',       description: 'Review your first card',             check: (p) => p.totalCardsReviewed >= 1,     progress: (p) => [Math.min(p.totalCardsReviewed, 1), 1] },
  { id: 'words_10',      icon: '📖', rarity: 'common',    title: 'Beginner',         description: 'Learn 10 words',                     check: (p) => p.totalWordsLearned >= 10,     progress: (p) => [Math.min(p.totalWordsLearned, 10), 10] },
  { id: 'words_50',      icon: '📚', rarity: 'common',    title: 'Student',          description: 'Learn 50 words',                     check: (p) => p.totalWordsLearned >= 50,     progress: (p) => [Math.min(p.totalWordsLearned, 50), 50] },
  { id: 'words_100',     icon: '🎓', rarity: 'rare',      title: 'Scholar',          description: 'Learn 100 words',                    check: (p) => p.totalWordsLearned >= 100,    progress: (p) => [Math.min(p.totalWordsLearned, 100), 100] },
  { id: 'words_200',     icon: '🏛️', rarity: 'legendary', title: 'Master',           description: 'Learn 200 words',                    check: (p) => p.totalWordsLearned >= 200,    progress: (p) => [Math.min(p.totalWordsLearned, 200), 200] },
  { id: 'streak_3',      icon: '🔥', rarity: 'common',    title: 'On Fire',          description: '3-day streak',                       check: (p) => p.currentStreak >= 3,          progress: (p) => [Math.min(p.currentStreak, 3), 3] },
  { id: 'streak_7',      icon: '⚡', rarity: 'rare',      title: 'Week Warrior',     description: '7-day streak',                       check: (p) => p.currentStreak >= 7,          progress: (p) => [Math.min(p.currentStreak, 7), 7] },
  { id: 'streak_30',     icon: '💎', rarity: 'legendary', title: 'Unstoppable',      description: '30-day streak',                      check: (p) => p.currentStreak >= 30,         progress: (p) => [Math.min(p.currentStreak, 30), 30] },
  { id: 'mastered_10',   icon: '⭐', rarity: 'common',    title: 'First Stars',      description: 'Master 10 cards',                    check: (_, s) => s.masteredCards >= 10,      progress: (_, s) => [Math.min(s.masteredCards, 10), 10] },
  { id: 'mastered_50',   icon: '🌟', rarity: 'rare',      title: 'Star Collector',   description: 'Master 50 cards',                    check: (_, s) => s.masteredCards >= 50,      progress: (_, s) => [Math.min(s.masteredCards, 50), 50] },
  { id: 'reviews_100',   icon: '🔄', rarity: 'common',    title: 'Dedicated',        description: 'Review 100 cards total',             check: (p) => p.totalCardsReviewed >= 100,   progress: (p) => [Math.min(p.totalCardsReviewed, 100), 100] },
  { id: 'reviews_500',   icon: '💪', rarity: 'rare',      title: 'Relentless',       description: 'Review 500 cards total',             check: (p) => p.totalCardsReviewed >= 500,   progress: (p) => [Math.min(p.totalCardsReviewed, 500), 500] },
  { id: 'explorer',      icon: '🗺️', rarity: 'rare',      title: 'Explorer',         description: 'Unlock a second region',             check: (p) => p.unlockedRegions.length >= 2, progress: (p) => [Math.min(p.unlockedRegions.length, 2), 2] },
  { id: 'adventurer',    icon: '⚔️', rarity: 'legendary', title: 'Adventurer',       description: 'Unlock a third region',              check: (p) => p.unlockedRegions.length >= 3, progress: (p) => [Math.min(p.unlockedRegions.length, 3), 3] },
  { id: 'level_5',       icon: '🏅', rarity: 'common',    title: 'Level 5',          description: 'Reach level 5',                      check: (p) => p.currentLevel >= 5,           progress: (p) => [Math.min(p.currentLevel, 5), 5] },
  { id: 'level_10',      icon: '🥇', rarity: 'rare',      title: 'Level 10',         description: 'Reach level 10',                     check: (p) => p.currentLevel >= 10,          progress: (p) => [Math.min(p.currentLevel, 10), 10] },
  { id: 'gold_500',      icon: '🪙', rarity: 'common',    title: 'Coin Hoarder',     description: 'Accumulate 500 gold',                check: (p) => p.gold >= 500,                 progress: (p) => [Math.min(p.gold, 500), 500] },
  { id: 'gold_2000',     icon: '💰', rarity: 'rare',      title: 'Treasure Hunter',  description: 'Accumulate 2,000 gold',              check: (p) => p.gold >= 2000,                progress: (p) => [Math.min(p.gold, 2000), 2000] },
  { id: 'companion',     icon: '🐾', rarity: 'legendary', title: 'Beast Tamer',      description: 'Collect a companion',                check: (p) => p.collectedCompanionIds.length >= 1 },
  { id: 'words_300',     icon: '🌏', rarity: 'legendary', title: 'Polyglot',         description: 'Learn 300 words',                    check: (p) => p.totalWordsLearned >= 300,    progress: (p) => [Math.min(p.totalWordsLearned, 300), 300] },
  { id: 'mastered_100',  icon: '💫', rarity: 'legendary', title: 'Virtuoso',         description: 'Master 100 cards',                   check: (_, s) => s.masteredCards >= 100,     progress: (_, s) => [Math.min(s.masteredCards, 100), 100] },
  { id: 'reviews_1000',  icon: '🏋️', rarity: 'legendary', title: 'Iron Mind',        description: 'Review 1,000 cards total',           check: (p) => p.totalCardsReviewed >= 1000,  progress: (p) => [Math.min(p.totalCardsReviewed, 1000), 1000] },
  { id: 'streak_100',    icon: '🏆', rarity: 'legendary', title: 'Century',          description: '100-day learning streak',            check: (p) => p.currentStreak >= 100,        progress: (p) => [Math.min(p.currentStreak, 100), 100] },
  { id: 'level_15',      icon: '⚜️', rarity: 'rare',      title: 'Level 15',         description: 'Reach level 15',                     check: (p) => p.currentLevel >= 15,          progress: (p) => [Math.min(p.currentLevel, 15), 15] },
  { id: 'level_20',      icon: '👑', rarity: 'legendary', title: 'Grand Master',     description: 'Reach level 20',                     check: (p) => p.currentLevel >= 20,          progress: (p) => [Math.min(p.currentLevel, 20), 20] },
  { id: 'regions_5',     icon: '🌐', rarity: 'rare',      title: 'World Traveler',   description: 'Unlock 5 regions',                   check: (p) => p.unlockedRegions.length >= 5, progress: (p) => [Math.min(p.unlockedRegions.length, 5), 5] },
  { id: 'regions_7',     icon: '🗺️', rarity: 'legendary', title: 'Globe Trotter',    description: 'Unlock all 7 regions',               check: (p) => p.unlockedRegions.length >= 7, progress: (p) => [Math.min(p.unlockedRegions.length, 7), 7] },
  { id: 'xp_5000',       icon: '✨', rarity: 'rare',      title: 'XP Hunter',        description: 'Earn 5,000 total XP',                check: (p) => p.totalXP >= 5000,             progress: (p) => [Math.min(p.totalXP, 5000), 5000] },
  { id: 'xp_25000',      icon: '🌟', rarity: 'legendary', title: 'Legend',           description: 'Earn 25,000 total XP',               check: (p) => p.totalXP >= 25000,            progress: (p) => [Math.min(p.totalXP, 25000), 25000] },
  { id: 'streak_14',     icon: '🗓️', rarity: 'common',    title: 'Two Weeks',        description: '14-day learning streak',             check: (p) => p.currentStreak >= 14,         progress: (p) => [Math.min(p.currentStreak, 14), 14] },
  { id: 'streak_50',     icon: '🎖️', rarity: 'rare',      title: 'Fifty Days',       description: '50-day learning streak',             check: (p) => p.currentStreak >= 50,         progress: (p) => [Math.min(p.currentStreak, 50), 50] },
  { id: 'words_150',     icon: '📕', rarity: 'rare',      title: 'Intermediate',     description: 'Learn 150 words',                    check: (p) => p.totalWordsLearned >= 150,    progress: (p) => [Math.min(p.totalWordsLearned, 150), 150] },
  { id: 'words_400',     icon: '🌍', rarity: 'legendary', title: 'Near Fluent',      description: 'Learn 400 words',                    check: (p) => p.totalWordsLearned >= 400,    progress: (p) => [Math.min(p.totalWordsLearned, 400), 400] },
  { id: 'mastered_200',  icon: '🌠', rarity: 'legendary', title: 'Grandmaster',      description: 'Master 200 cards',                   check: (_, s) => s.masteredCards >= 200,     progress: (_, s) => [Math.min(s.masteredCards, 200), 200] },
  { id: 'xp_10000',      icon: '💡', rarity: 'rare',      title: 'XP Master',        description: 'Earn 10,000 total XP',               check: (p) => p.totalXP >= 10000,            progress: (p) => [Math.min(p.totalXP, 10000), 10000] },
  { id: 'reviews_2000',  icon: '🔁', rarity: 'legendary', title: 'Unstoppable Mind', description: 'Review 2,000 cards total',            check: (p) => p.totalCardsReviewed >= 2000,  progress: (p) => [Math.min(p.totalCardsReviewed, 2000), 2000] },
  { id: 'gold_5000',     icon: '🏅', rarity: 'rare',      title: 'Gold Baron',       description: 'Accumulate 5,000 gold',              check: (p) => p.gold >= 5000,                progress: (p) => [Math.min(p.gold, 5000), 5000] },
  { id: 'gems_25',       icon: '💍', rarity: 'rare',      title: 'Gem Collector',    description: 'Collect 25 gems',                    check: (p) => p.gems >= 25,                  progress: (p) => [Math.min(p.gems, 25), 25] },
];

export function getEarnedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveEarnedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/** Check all achievements, persist newly earned ones, return array of newly earned. */
export function checkAchievements(profile: UserProfile, stats: DashboardStats): Achievement[] {
  const earned = getEarnedIds();
  const newlyEarned: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!earned.has(a.id) && a.check(profile, stats)) {
      earned.add(a.id);
      newlyEarned.push(a);
    }
  }
  if (newlyEarned.length) saveEarnedIds(earned);
  return newlyEarned;
}
