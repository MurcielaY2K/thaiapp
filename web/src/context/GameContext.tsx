import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GameFacade, DashboardStats } from '@engine/GameFacade';
import { UserProfile } from '@engine/types';
import { LocalStorageAdapter } from '../storage/localStorageAdapter';

interface GameContextValue {
  facade: GameFacade | null;
  profile: UserProfile | null;
  stats: DashboardStats | null;
  isLoading: boolean;
  hasProfile: boolean;
  createProfile: (name: string) => Promise<void>;
  refreshStats: () => void;
  resetProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const facadeRef = useRef<GameFacade | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = useCallback(() => {
    const f = facadeRef.current;
    if (!f) return;
    try {
      setStats(f.getDashboardStats());
      setProfile(f.profile);
    } catch { /* not initialized */ }
  }, []);

  useEffect(() => {
    const boot = async () => {
      const storage = new LocalStorageAdapter();
      const facade = new GameFacade(storage);
      facadeRef.current = facade;
      const saved = await storage.load();
      if (saved) {
        await facade.init();
        setProfile(facade.profile);
        setStats(facade.getDashboardStats());
      }
      setIsLoading(false);
    };
    boot();
  }, []);

  const createProfile = useCallback(async (name: string) => {
    if (!facadeRef.current) return;
    await facadeRef.current.init(name);
    setProfile(facadeRef.current.profile);
    setStats(facadeRef.current.getDashboardStats());
  }, []);

  const resetProgress = useCallback(async () => {
    if (!facadeRef.current) return;
    await facadeRef.current.resetProgress();
    setProfile(null);
    setStats(null);
    const storage = new LocalStorageAdapter();
    facadeRef.current = new GameFacade(storage);
  }, []);

  return (
    <GameContext.Provider value={{
      facade: facadeRef.current,
      profile, stats, isLoading,
      hasProfile: profile !== null,
      createProfile, refreshStats, resetProgress,
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
