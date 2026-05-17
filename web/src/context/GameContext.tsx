import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GameFacade, DashboardStats } from '@engine/GameFacade';
import { UserProfile, VocabCard } from '@engine/types';
import { VOCABULARY } from '@engine/data/vocabulary';
import { DailyGoal } from '@engine/engine/sessionManager';
import { LocalStorageAdapter } from '../storage/localStorageAdapter';
import { Achievement, checkAchievements, getEarnedIds, ACHIEVEMENTS } from '../utils/achievements';
import { DailyChallenge, getDailyChallenge } from '../utils/dailyChallenge';

const DAILY_GOAL_KEY = 'thaiquest:daily_goal';
function getSavedDailyGoal(): DailyGoal {
  return (localStorage.getItem(DAILY_GOAL_KEY) as DailyGoal) ?? 'regular';
}

interface GameContextValue {
  facade: GameFacade | null;
  profile: UserProfile | null;
  stats: DashboardStats | null;
  isLoading: boolean;
  hasProfile: boolean;
  createProfile: (name: string, avatarId?: string) => Promise<void>;
  refreshStats: () => void;
  refreshDailyChallenge: () => void;
  resetProgress: () => Promise<void>;
  awardChallengeXP: (xp: number) => Promise<void>;
  heatmap: Record<string, number>;
  achievements: Achievement[];
  earnedAchievementIds: Set<string>;
  newAchievements: Achievement[];
  levelUp: number | null;
  dailyChallenge: DailyChallenge | null;
  wordOfDay: VocabCard | null;
  dailyGoal: DailyGoal;
  setDailyGoal: (goal: DailyGoal) => void;
  dismissNewAchievements: () => void;
  dismissLevelUp: () => void;
  refreshAchievements: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const facadeRef = useRef<GameFacade | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [earnedAchievementIds, setEarnedAchievementIds] = useState<Set<string>>(new Set());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prevLevelRef = useRef<number>(1);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [wordOfDay, setWordOfDay] = useState<VocabCard | null>(null);
  const [dailyGoal, setDailyGoalState] = useState<DailyGoal>(getSavedDailyGoal);

  const refreshDailyChallenge = useCallback(() => {
    setDailyChallenge(getDailyChallenge());
  }, []);

  const setDailyGoal = useCallback((goal: DailyGoal) => {
    localStorage.setItem(DAILY_GOAL_KEY, goal);
    setDailyGoalState(goal);
    // Update the facade options so the next session picks it up
    if (facadeRef.current) {
      (facadeRef.current as unknown as { options: { dailyGoal: DailyGoal } }).options.dailyGoal = goal;
    }
  }, []);

  const refreshAchievements = useCallback(() => {
    const f = facadeRef.current;
    if (!f) return;
    try {
      const currentProfile = f.profile;
      const currentStats = f.getDashboardStats();
      const newly = checkAchievements(currentProfile, currentStats);
      const earned = getEarnedIds();
      setEarnedAchievementIds(new Set(earned));
      if (newly.length) {
        setNewAchievements(prev => [...prev, ...newly]);
      }
    } catch { /* not initialized */ }
  }, []);

  const refreshStats = useCallback(() => {
    const f = facadeRef.current;
    if (!f) return;
    try {
      const currentStats = f.getDashboardStats();
      const currentProfile = f.profile;
      setStats(currentStats);
      setProfile(currentProfile);
      setHeatmap(f.getReviewHeatmap());
      if (currentProfile.currentLevel > prevLevelRef.current) {
        setLevelUp(currentProfile.currentLevel);
      }
      prevLevelRef.current = currentProfile.currentLevel;
      // Check achievements whenever stats are refreshed
      const newly = checkAchievements(currentProfile, currentStats);
      const earned = getEarnedIds();
      setEarnedAchievementIds(new Set(earned));
      if (newly.length) {
        setNewAchievements(prev => [...prev, ...newly]);
      }
    } catch { /* not initialized */ }
  }, []);

  const dismissNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUp(null);
  }, []);

  useEffect(() => {
    // Compute word of day once on mount
    const dayIndex = Math.floor(Date.now() / 86400000);
    setWordOfDay(VOCABULARY[dayIndex % VOCABULARY.length]);
    setDailyChallenge(getDailyChallenge());

    const boot = async () => {
      const storage = new LocalStorageAdapter();
      const facade = new GameFacade(storage, { dailyGoal: getSavedDailyGoal() });
      facadeRef.current = facade;
      const saved = await storage.load();
      if (saved) {
        await facade.init();
        const currentProfile = facade.profile;
        const currentStats = facade.getDashboardStats();
        setProfile(currentProfile);
        setStats(currentStats);
        setHeatmap(facade.getReviewHeatmap());
        prevLevelRef.current = currentProfile.currentLevel;
        const newly = checkAchievements(currentProfile, currentStats);
        const earned = getEarnedIds();
        setEarnedAchievementIds(new Set(earned));
        if (newly.length) {
          setNewAchievements(newly);
        }
      }
      setIsLoading(false);
    };
    boot();
  }, []);

  const createProfile = useCallback(async (name: string, avatarId?: string) => {
    if (!facadeRef.current) return;
    await facadeRef.current.init(name, avatarId);
    const currentProfile = facadeRef.current.profile;
    const currentStats = facadeRef.current.getDashboardStats();
    setProfile(currentProfile);
    setStats(currentStats);
    setHeatmap(facadeRef.current.getReviewHeatmap());
    const newly = checkAchievements(currentProfile, currentStats);
    const earned = getEarnedIds();
    setEarnedAchievementIds(new Set(earned));
    if (newly.length) {
      setNewAchievements(prev => [...prev, ...newly]);
    }
  }, []);

  const awardChallengeXP = useCallback(async (xp: number) => {
    const f = facadeRef.current;
    if (!f) return;
    const p = f.profile;
    await f.saveProfile({ ...p, totalXP: p.totalXP + xp });
    refreshStats();
  }, [refreshStats]);

  const resetProgress = useCallback(async () => {
    if (!facadeRef.current) return;
    await facadeRef.current.resetProgress();
    setProfile(null);
    setStats(null);
    setHeatmap({});
    setNewAchievements([]);
    setEarnedAchievementIds(new Set());
    const storage = new LocalStorageAdapter();
    facadeRef.current = new GameFacade(storage);
  }, []);

  return (
    <GameContext.Provider value={{
      facade: facadeRef.current,
      profile, stats, isLoading,
      hasProfile: profile !== null,
      createProfile, refreshStats, refreshDailyChallenge, resetProgress, awardChallengeXP,
      heatmap,
      achievements,
      earnedAchievementIds,
      newAchievements,
      levelUp,
      dailyChallenge,
      wordOfDay,
      dailyGoal,
      setDailyGoal,
      dismissNewAchievements,
      dismissLevelUp,
      refreshAchievements,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
