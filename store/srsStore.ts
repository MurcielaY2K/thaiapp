import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VOCABULARY, type Word } from '../data/vocabulary';

const SESSION_SIZE = 20;
const STORAGE_KEY = '@thaiapp_progress';
const WRITING_KEY = '@thaiapp_writing';
const MIN_EASE = 1.3;

export interface WordProgress {
  interval: number;  // days until next review
  dueDate: number;   // unix ms
  ease: number;      // multiplier, default 2.5
  reviews: number;
}

interface Stats {
  total: number;
  mastered: number;
  dueToday: number;
  newWords: number;
}

interface SrsStore {
  progress: Record<string, WordProgress>;
  writing: Record<string, number>; // char id -> times practiced
  currentSession: Word[];
  isLoading: boolean;

  load: () => Promise<void>;
  startSession: () => void;
  recordAnswer: (wordId: string, correct: boolean) => void;
  markWritten: (charId: string) => void;
  getStats: () => Stats;
}

export const useSrsStore = create<SrsStore>((set, get) => ({
  progress: {},
  writing: {},
  currentSession: [],
  isLoading: true,

  load: async () => {
    try {
      const [json, wjson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(WRITING_KEY),
      ]);
      set({
        progress: json ? JSON.parse(json) : {},
        writing: wjson ? JSON.parse(wjson) : {},
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  startSession: () => {
    const { progress } = get();
    const now = Date.now();

    const due = VOCABULARY
      .filter(w => { const p = progress[w.id]; return p && p.dueDate <= now; })
      .sort(() => Math.random() - 0.5);

    const unseen = VOCABULARY
      .filter(w => !progress[w.id]);

    const session: Word[] = [...due.slice(0, SESSION_SIZE)];
    if (session.length < SESSION_SIZE) {
      session.push(...unseen.slice(0, SESSION_SIZE - session.length));
    }

    set({ currentSession: session.sort(() => Math.random() - 0.5) });
  },

  recordAnswer: (wordId, correct) => {
    const { progress } = get();
    const now = Date.now();
    const p = progress[wordId] ?? { interval: 0, dueDate: 0, ease: 2.5, reviews: 0 };

    const newInterval = correct
      ? (p.interval === 0 ? 1 : Math.round(p.interval * p.ease))
      : 1;
    const newEase = correct
      ? Math.min(2.5, p.ease + 0.1)
      : Math.max(MIN_EASE, p.ease - 0.2);

    const updated = {
      ...progress,
      [wordId]: {
        interval: newInterval,
        dueDate: now + newInterval * 86_400_000,
        ease: newEase,
        reviews: p.reviews + 1,
      },
    };
    set({ progress: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  markWritten: (charId) => {
    const { writing } = get();
    const updated = { ...writing, [charId]: (writing[charId] ?? 0) + 1 };
    set({ writing: updated });
    AsyncStorage.setItem(WRITING_KEY, JSON.stringify(updated));
  },

  getStats: () => {
    const { progress } = get();
    const now = Date.now();
    const total = VOCABULARY.length;
    const newWords = VOCABULARY.filter(w => !progress[w.id]).length;
    const dueToday = VOCABULARY.filter(w => {
      const p = progress[w.id];
      return p && p.dueDate <= now;
    }).length;
    const mastered = Object.values(progress).filter(
      p => p.reviews >= 3 && p.interval >= 7
    ).length;
    return { total, mastered, dueToday, newWords };
  },
}));
