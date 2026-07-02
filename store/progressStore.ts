import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_ON_HOLD } from '../constants/features';

const XP_KEY      = '@thaiapp_xp';
const HEARTS_KEY  = '@thaiapp_hearts';
const GEMS_KEY    = '@thaiapp_gems';
const PREMIUM_KEY = '@thaiapp_premium';
const PROGRESS_KEY = '@thaiapp_lesson_progress';
const DAILY_KEY   = '@thaiapp_daily_xp';

const HEART_REFILL_MS = 30 * 60 * 1000; // 30 min per heart
const MAX_HEARTS = 5;

export type LessonState = 'available' | 'locked' | 'complete' | 'premium-locked';

interface DailyXP { date: string; earned: number; }

interface ProgressStore {
  xp: number;
  level: number;
  hearts: number;
  lastHeartRefill: number;
  gems: number;
  isPremium: boolean;
  lessonProgress: Record<string, LessonState>;
  dailyXp: DailyXP;
  dailyGoal: number;
  badges: string[];
  isLoaded: boolean;

  load: () => Promise<void>;
  earnXP: (amount: number) => void;
  loseHeart: () => void;
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;
  completeLesson: (lessonId: string, nextLessonId?: string, nextIsPremium?: boolean) => void;
  unlockPremium: () => void;
  seedProgress: (firstLessonId: string) => void;
}

function computeLevel(xp: number) { return Math.floor(xp / 100) + 1; }

function refillHearts(current: number, lastRefill: number): { hearts: number; lastRefill: number } {
  if (current >= MAX_HEARTS) return { hearts: current, lastRefill };
  const elapsed = Date.now() - lastRefill;
  const toAdd = Math.floor(elapsed / HEART_REFILL_MS);
  if (toAdd === 0) return { hearts: current, lastRefill };
  const hearts = Math.min(MAX_HEARTS, current + toAdd);
  const newRefill = lastRefill + toAdd * HEART_REFILL_MS;
  return { hearts, lastRefill: newRefill };
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function checkBadges(xp: number, gems: number, streak: number, mastered: number): string[] {
  const badges: string[] = [];
  if (xp >= 100) badges.push('first-100xp');
  if (xp >= 1000) badges.push('1000xp');
  if (streak >= 7) badges.push('streak-7');
  if (streak >= 30) badges.push('streak-30');
  if (mastered >= 10) badges.push('words-10');
  if (mastered >= 50) badges.push('words-50');
  if (mastered >= 100) badges.push('words-100');
  return badges;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  xp: 0,
  level: 1,
  hearts: MAX_HEARTS,
  lastHeartRefill: Date.now(),
  gems: 30,
  isPremium: PREMIUM_ON_HOLD,
  lessonProgress: {},
  dailyXp: { date: todayStr(), earned: 0 },
  dailyGoal: 50,
  badges: [],
  isLoaded: false,

  load: async () => {
    try {
      const [xpJ, hJ, gJ, premJ, progJ, dailyJ] = await Promise.all([
        AsyncStorage.getItem(XP_KEY),
        AsyncStorage.getItem(HEARTS_KEY),
        AsyncStorage.getItem(GEMS_KEY),
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(DAILY_KEY),
      ]);
      const xp = xpJ ? Number(xpJ) : 0;
      const rawHearts = hJ ? JSON.parse(hJ) : { hearts: MAX_HEARTS, lastRefill: Date.now() };
      const { hearts, lastRefill } = refillHearts(rawHearts.hearts, rawHearts.lastRefill);
      const gems = gJ ? Number(gJ) : 30;
      const isPremium = PREMIUM_ON_HOLD || premJ === 'true';
      const lessonProgress: Record<string, LessonState> = progJ ? JSON.parse(progJ) : {};
      // While the Premium hold is active, open premium-locked lessons in
      // memory only — stored state is untouched so flipping the flag back
      // restores the paywall.
      if (PREMIUM_ON_HOLD) {
        for (const [id, state] of Object.entries(lessonProgress)) {
          if (state === 'premium-locked') lessonProgress[id] = 'available';
        }
      }
      let daily: DailyXP = dailyJ ? JSON.parse(dailyJ) : { date: todayStr(), earned: 0 };
      if (daily.date !== todayStr()) daily = { date: todayStr(), earned: 0 };
      set({ xp, level: computeLevel(xp), hearts, lastHeartRefill: lastRefill, gems, isPremium, lessonProgress, dailyXp: daily, isLoaded: true });
      // Persist updated heart count (may have refilled)
      AsyncStorage.setItem(HEARTS_KEY, JSON.stringify({ hearts, lastRefill }));
    } catch {
      set({ isLoaded: true });
    }
  },

  seedProgress: (firstLessonId: string) => {
    const { lessonProgress } = get();
    if (Object.keys(lessonProgress).length > 0) return; // already seeded
    const next = { ...lessonProgress, [firstLessonId]: 'available' as LessonState };
    set({ lessonProgress: next });
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  },

  earnXP: (amount: number) => {
    const { xp, dailyXp, badges } = get();
    const newXp = xp + amount;
    const today = todayStr();
    const newDaily: DailyXP = dailyXp.date === today
      ? { date: today, earned: dailyXp.earned + amount }
      : { date: today, earned: amount };
    const newBadges = [...new Set([...badges, ...checkBadges(newXp, get().gems, 0, 0)])];
    set({ xp: newXp, level: computeLevel(newXp), dailyXp: newDaily, badges: newBadges });
    AsyncStorage.setItem(XP_KEY, String(newXp));
    AsyncStorage.setItem(DAILY_KEY, JSON.stringify(newDaily));
  },

  loseHeart: () => {
    const { hearts, isPremium, lastHeartRefill } = get();
    if (isPremium) return;
    const newHearts = Math.max(0, hearts - 1);
    const now = Date.now();
    const newRefill = hearts === MAX_HEARTS ? now : lastHeartRefill;
    set({ hearts: newHearts, lastHeartRefill: newRefill });
    AsyncStorage.setItem(HEARTS_KEY, JSON.stringify({ hearts: newHearts, lastRefill: newRefill }));
  },

  addGems: (n: number) => {
    const gems = get().gems + n;
    set({ gems });
    AsyncStorage.setItem(GEMS_KEY, String(gems));
  },

  spendGems: (n: number) => {
    const { gems } = get();
    if (gems < n) return false;
    const newGems = gems - n;
    set({ gems: newGems });
    AsyncStorage.setItem(GEMS_KEY, String(newGems));
    return true;
  },

  completeLesson: (lessonId: string, nextLessonId?: string, nextIsPremium?: boolean) => {
    const { lessonProgress, isPremium } = get();
    const next = { ...lessonProgress, [lessonId]: 'complete' as LessonState };
    if (nextLessonId) {
      next[nextLessonId] = (nextIsPremium && !isPremium) ? 'premium-locked' : 'available';
    }
    set({ lessonProgress: next });
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  },

  unlockPremium: () => {
    const { lessonProgress } = get();
    // Unlock all premium-locked lessons
    const next = { ...lessonProgress };
    for (const [id, state] of Object.entries(next)) {
      if (state === 'premium-locked') next[id] = 'available';
    }
    set({ isPremium: true, hearts: MAX_HEARTS, lessonProgress: next });
    AsyncStorage.setItem(PREMIUM_KEY, 'true');
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  },
}));
