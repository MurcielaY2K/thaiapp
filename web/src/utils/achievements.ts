import { UserProfile } from '@engine/types';
import { DashboardStats } from '@engine/GameFacade';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  check: (profile: UserProfile, stats: DashboardStats) => boolean;
}

const STORAGE_KEY = 'thaiquest:earned_achievements';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step',    icon: '👣', rarity: 'common',    title: 'First Step',       description: 'Review your first card',             check: (p) => p.totalCardsReviewed >= 1 },
  { id: 'words_10',      icon: '📖', rarity: 'common',    title: 'Beginner',         description: 'Learn 10 words',                     check: (p) => p.totalWordsLearned >= 10 },
  { id: 'words_50',      icon: '📚', rarity: 'common',    title: 'Student',          description: 'Learn 50 words',                     check: (p) => p.totalWordsLearned >= 50 },
  { id: 'words_100',     icon: '🎓', rarity: 'rare',      title: 'Scholar',          description: 'Learn 100 words',                    check: (p) => p.totalWordsLearned >= 100 },
  { id: 'words_200',     icon: '🏛️', rarity: 'legendary', title: 'Master',           description: 'Learn 200 words',                    check: (p) => p.totalWordsLearned >= 200 },
  { id: 'streak_3',      icon: '🔥', rarity: 'common',    title: 'On Fire',          description: '3-day streak',                       check: (p) => p.currentStreak >= 3 },
  { id: 'streak_7',      icon: '⚡', rarity: 'rare',      title: 'Week Warrior',     description: '7-day streak',                       check: (p) => p.currentStreak >= 7 },
  { id: 'streak_30',     icon: '💎', rarity: 'legendary', title: 'Unstoppable',      description: '30-day streak',                      check: (p) => p.currentStreak >= 30 },
  { id: 'mastered_10',   icon: '⭐', rarity: 'common',    title: 'First Stars',      description: 'Master 10 cards',                    check: (_, s) => s.masteredCards >= 10 },
  { id: 'mastered_50',   icon: '🌟', rarity: 'rare',      title: 'Star Collector',   description: 'Master 50 cards',                    check: (_, s) => s.masteredCards >= 50 },
  { id: 'reviews_100',   icon: '🔄', rarity: 'common',    title: 'Dedicated',        description: 'Review 100 cards total',             check: (p) => p.totalCardsReviewed >= 100 },
  { id: 'reviews_500',   icon: '💪', rarity: 'rare',      title: 'Relentless',       description: 'Review 500 cards total',             check: (p) => p.totalCardsReviewed >= 500 },
  { id: 'explorer',      icon: '🗺️', rarity: 'rare',      title: 'Explorer',         description: 'Unlock a second region',             check: (p) => p.unlockedRegions.length >= 2 },
  { id: 'adventurer',    icon: '⚔️', rarity: 'legendary', title: 'Adventurer',       description: 'Unlock a third region',              check: (p) => p.unlockedRegions.length >= 3 },
  { id: 'level_5',       icon: '🏅', rarity: 'common',    title: 'Level 5',          description: 'Reach level 5',                      check: (p) => p.currentLevel >= 5 },
  { id: 'level_10',      icon: '🥇', rarity: 'rare',      title: 'Level 10',         description: 'Reach level 10',                     check: (p) => p.currentLevel >= 10 },
  { id: 'gold_500',      icon: '🪙', rarity: 'common',    title: 'Coin Hoarder',     description: 'Accumulate 500 gold',                check: (p) => p.gold >= 500 },
  { id: 'companion',     icon: '🐾', rarity: 'legendary', title: 'Beast Tamer',      description: 'Collect a companion',                check: (p) => p.collectedCompanionIds.length >= 1 },
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
