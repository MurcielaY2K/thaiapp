import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'care' | 'games' | 'social' | 'evolution' | 'secret';
  condition: (stats: AchievementStats) => boolean;
  unlockedAt?: number;
}

export interface AchievementStats {
  totalCareActions: number;
  totalHugs: number;
  totalFeeds: number;
  totalGamesPlayed: number;
  bestTreatScore: number;
  bestRaceScore: number;
  bestFishCoins: number;
  bestDanceScore: number;
  bestRushScore: number;
  evolutionStage: string;
  daysActive: number;
  maxHappiness: number;
  neglectStreak: number;
  coinsEarned: number;
  gemsSpent: number;
  accessoriesOwned: number;
  friendsVisited: number;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  // Care
  { id: 'first_feed', title: 'First Meal', description: 'Feed your pet for the first time', emoji: '🍖', category: 'care', condition: s => s.totalFeeds >= 1 },
  { id: 'caregiver', title: 'Dedicated Caregiver', description: 'Perform 50 care actions', emoji: '💕', category: 'care', condition: s => s.totalCareActions >= 50 },
  { id: 'hugmaster', title: 'Hug Master', description: 'Give 100 hugs', emoji: '🤗', category: 'care', condition: s => s.totalHugs >= 100 },
  { id: 'max_happy', title: 'Pure Joy', description: 'Reach 100% happiness', emoji: '🌟', category: 'care', condition: s => s.maxHappiness >= 100 },
  { id: 'veteran', title: 'Pet Veteran', description: 'Perform 200 care actions', emoji: '🏅', category: 'care', condition: s => s.totalCareActions >= 200 },
  // Games
  { id: 'first_game', title: 'Player One', description: 'Play your first mini game', emoji: '🎮', category: 'games', condition: s => s.totalGamesPlayed >= 1 },
  { id: 'treat_10', title: 'Treat Hunter', description: 'Score 10 in Treat Catch', emoji: '🦴', category: 'games', condition: s => s.bestTreatScore >= 10 },
  { id: 'treat_30', title: 'Treat Legend', description: 'Score 30 in Treat Catch', emoji: '🏆', category: 'games', condition: s => s.bestTreatScore >= 30 },
  { id: 'racer', title: 'Speed Racer', description: 'Score 50 in Retro Race', emoji: '🏎️', category: 'games', condition: s => s.bestRaceScore >= 50 },
  { id: 'angler', title: 'Master Angler', description: 'Earn 300 coins in one fishing session', emoji: '🎣', category: 'games', condition: s => s.bestFishCoins >= 300 },
  { id: 'dancer', title: 'Dance King/Queen', description: 'Score 500 in Dance Battle', emoji: '💃', category: 'games', condition: s => s.bestDanceScore >= 500 },
  { id: 'rusher', title: 'Speed Demon', description: 'Run 100m in Pixel Rush', emoji: '⚡', category: 'games', condition: s => s.bestRushScore >= 100 },
  { id: 'gamer', title: 'Retro Gamer', description: 'Play 20 mini games', emoji: '🕹️', category: 'games', condition: s => s.totalGamesPlayed >= 20 },
  // Evolution
  { id: 'hatched', title: 'It Hatched!', description: 'Evolve from egg to baby', emoji: '🐣', category: 'evolution', condition: s => ['baby','child','teen','adult','legend'].includes(s.evolutionStage) },
  { id: 'teenager', title: 'Growing Up', description: 'Reach the teen stage', emoji: '🌱', category: 'evolution', condition: s => ['teen','adult','legend'].includes(s.evolutionStage) },
  { id: 'fully_grown', title: 'Fully Evolved', description: 'Reach adult stage', emoji: '💪', category: 'evolution', condition: s => ['adult','legend'].includes(s.evolutionStage) },
  { id: 'legend', title: 'Living Legend', description: 'Reach the legendary stage!', emoji: '👑', category: 'evolution', condition: s => s.evolutionStage === 'legend' },
  // Social
  { id: 'coins_100', title: 'Coin Collector', description: 'Earn 100 coins total', emoji: '🪙', category: 'social', condition: s => s.coinsEarned >= 100 },
  { id: 'coins_1000', title: 'Pixel Millionaire', description: 'Earn 1000 coins total', emoji: '💰', category: 'social', condition: s => s.coinsEarned >= 1000 },
  // Secret
  { id: 'gremlin', title: 'Gremlin Owner', description: 'Let your pet become a gremlin...', emoji: '👺', category: 'secret', condition: s => s.neglectStreak >= 1 },
  { id: 'week_active', title: 'Week Streak', description: 'Stay active for 7 days', emoji: '🔥', category: 'secret', condition: s => s.daysActive >= 7 },
];

const STORAGE_KEY = '@petagotchi_achievements';
const STATS_KEY = '@petagotchi_ach_stats';

interface AchievementStore {
  unlocked: string[];
  stats: AchievementStats;
  newUnlocks: Achievement[];
  isLoading: boolean;

  load: () => Promise<void>;
  updateStats: (partial: Partial<AchievementStats>) => void;
  checkAchievements: () => Achievement[];
  dismissNewUnlocks: () => void;
  getAllAchievements: () => (Achievement & { unlocked: boolean })[];
}

const DEFAULT_STATS: AchievementStats = {
  totalCareActions: 0,
  totalHugs: 0,
  totalFeeds: 0,
  totalGamesPlayed: 0,
  bestTreatScore: 0,
  bestRaceScore: 0,
  bestFishCoins: 0,
  bestDanceScore: 0,
  bestRushScore: 0,
  evolutionStage: 'egg',
  daysActive: 0,
  maxHappiness: 70,
  neglectStreak: 0,
  coinsEarned: 100,
  gemsSpent: 0,
  accessoriesOwned: 0,
  friendsVisited: 0,
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  unlocked: [],
  stats: DEFAULT_STATS,
  newUnlocks: [],
  isLoading: true,

  load: async () => {
    try {
      const [unlockedJson, statsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(STATS_KEY),
      ]);
      set({
        unlocked: unlockedJson ? JSON.parse(unlockedJson) : [],
        stats: statsJson ? { ...DEFAULT_STATS, ...JSON.parse(statsJson) } : DEFAULT_STATS,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateStats: (partial) => {
    const { stats } = get();
    const newStats = { ...stats, ...partial };
    set({ stats: newStats });
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    get().checkAchievements();
  },

  checkAchievements: () => {
    const { unlocked, stats } = get();
    const newlyUnlocked: Achievement[] = [];

    for (const ach of ALL_ACHIEVEMENTS) {
      if (!unlocked.includes(ach.id) && ach.condition(stats)) {
        newlyUnlocked.push({ ...ach, unlockedAt: Date.now() });
      }
    }

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id);
      const allUnlocked = [...unlocked, ...newIds];
      set({ unlocked: allUnlocked, newUnlocks: newlyUnlocked });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlocked));
    }

    return newlyUnlocked;
  },

  dismissNewUnlocks: () => set({ newUnlocks: [] }),

  getAllAchievements: () => {
    const { unlocked } = get();
    return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
  },
}));
