import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_ON_HOLD } from '../constants/features';
import { supabase } from '../lib/supabase';

import { StorageKeys } from '../constants/storageKeys';

const XP_KEY      = StorageKeys.xp;
const HEARTS_KEY  = StorageKeys.hearts;
const GEMS_KEY    = StorageKeys.gems;
// Cache of the last server-verified entitlement verdict. The old
// '@thaiapp_premium' key (self-granted on redirect) is deliberately ignored:
// Premium is now granted only by the Stripe webhook → entitlements table.
const PREMIUM_KEY = StorageKeys.premium;
const PROGRESS_KEY = StorageKeys.lessonProgress;
const STARS_KEY   = StorageKeys.lessonStars;
const SKILL_KEY   = StorageKeys.skillLevel;
const DAILY_KEY   = StorageKeys.dailyXp;

const HEART_REFILL_MS = 30 * 60 * 1000; // 30 min per heart
const MAX_HEARTS = 5;

export type LessonState = 'available' | 'locked' | 'complete' | 'premium-locked';
// Self-reported skill chosen at onboarding; drives lesson adaptivity.
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface DailyXP { date: string; earned: number; }

interface ProgressStore {
  xp: number;
  level: number;
  hearts: number;
  lastHeartRefill: number;
  gems: number;
  isPremium: boolean;
  lessonProgress: Record<string, LessonState>;
  lessonStars: Record<string, number>;   // best 1-3 star result per lesson
  skillLevel: SkillLevel | null;         // null until picked at onboarding
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
  setLessonStars: (lessonId: string, stars: number) => void;
  setSkillLevel: (level: SkillLevel) => void;
  applyPremium: (active: boolean) => void;
  refreshEntitlement: () => Promise<void>;
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
  lessonStars: {},
  skillLevel: null,
  dailyXp: { date: todayStr(), earned: 0 },
  dailyGoal: 50,
  badges: [],
  isLoaded: false,

  load: async () => {
    try {
      const [xpJ, hJ, gJ, premJ, progJ, dailyJ, starsJ, skillJ] = await Promise.all([
        AsyncStorage.getItem(XP_KEY),
        AsyncStorage.getItem(HEARTS_KEY),
        AsyncStorage.getItem(GEMS_KEY),
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(DAILY_KEY),
        AsyncStorage.getItem(STARS_KEY),
        AsyncStorage.getItem(SKILL_KEY),
      ]);
      const lessonStars: Record<string, number> = starsJ ? JSON.parse(starsJ) : {};
      // Stored values can be stale or hand-edited; coerce instead of trusting.
      const skillLevel: SkillLevel | null =
        skillJ === 'beginner' || skillJ === 'intermediate' || skillJ === 'advanced' ? skillJ : null;
      const xp = Number.isFinite(Number(xpJ)) ? Math.max(0, Number(xpJ)) : 0;
      const rawHearts = hJ ? JSON.parse(hJ) : { hearts: MAX_HEARTS, lastRefill: Date.now() };
      const storedHearts = Number.isFinite(rawHearts?.hearts)
        ? Math.min(Math.max(rawHearts.hearts, 0), MAX_HEARTS) : MAX_HEARTS;
      const storedRefill = Number.isFinite(rawHearts?.lastRefill) ? rawHearts.lastRefill : Date.now();
      const { hearts, lastRefill } = refillHearts(storedHearts, storedRefill);
      const gems = gJ !== null && Number.isFinite(Number(gJ)) ? Math.max(0, Number(gJ)) : 30;
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
      set({ xp, level: computeLevel(xp), hearts, lastHeartRefill: lastRefill, gems, isPremium, lessonProgress, lessonStars, skillLevel, dailyXp: daily, isLoaded: true });
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

  setLessonStars: (lessonId: string, stars: number) => {
    const { lessonStars } = get();
    if ((lessonStars[lessonId] ?? 0) >= stars) return;   // keep the best run
    const next = { ...lessonStars, [lessonId]: stars };
    set({ lessonStars: next });
    AsyncStorage.setItem(STARS_KEY, JSON.stringify(next));
  },

  setSkillLevel: (level: SkillLevel) => {
    set({ skillLevel: level });
    AsyncStorage.setItem(SKILL_KEY, level);
  },

  applyPremium: (active: boolean) => {
    const { lessonProgress } = get();
    const next = { ...lessonProgress };
    if (active) {
      // Unlock all premium-locked lessons
      for (const [id, state] of Object.entries(next)) {
        if (state === 'premium-locked') next[id] = 'available';
      }
    }
    set({
      isPremium: PREMIUM_ON_HOLD || active,
      lessonProgress: next,
      ...(active ? { hearts: MAX_HEARTS } : {}),
    });
    AsyncStorage.setItem(PREMIUM_KEY, active ? 'true' : 'false');
    if (active) AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  },

  refreshEntitlement: async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('entitlements')
        .select('status, current_period_end')
        .eq('auth_id', session.user.id)
        .maybeSingle();
      if (error) return; // table missing or request failed: keep cached verdict
      // past_due keeps access until the period end + 1 day grace, giving
      // Stripe's dunning emails a chance before we lock the account out.
      const GRACE_MS = 24 * 60 * 60 * 1000;
      const active = !!data
        && (data.status === 'active' || data.status === 'past_due')
        && (!data.current_period_end
            || new Date(data.current_period_end).getTime() + GRACE_MS > Date.now());
      get().applyPremium(active);
    } catch {
      // Offline: keep the cached verdict from the last successful check.
    }
  },
}));
