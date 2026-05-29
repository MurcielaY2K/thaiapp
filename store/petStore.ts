import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Pet, PetStats, PetMood, EvolutionStage, CareAction } from '../types';
import { EVOLUTION_STAGES, NEGLECT_THRESHOLDS } from '../constants/petData';

const STORAGE_KEY = '@petagotchi_pet';

function calcMood(stats: PetStats): PetMood {
  if (stats.hunger > 80) return 'hungry';
  if (stats.energy < 10) return 'sleepy';
  if (stats.happiness > 80 && stats.affection > 60) return 'ecstatic';
  if (stats.happiness > 60) return 'happy';
  if (stats.happiness < 20) return 'angry';
  if (stats.happiness < 40) return 'sad';
  return 'neutral';
}

function calcEvolution(xp: number): EvolutionStage {
  const stages = Object.entries(EVOLUTION_STAGES).reverse();
  for (const [stage, data] of stages) {
    if (xp >= data.minXp) return stage as EvolutionStage;
  }
  return 'egg';
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function applyDecay(stats: PetStats, hoursPassed: number): PetStats {
  return {
    ...stats,
    happiness: clamp(stats.happiness - hoursPassed * 2),
    energy: clamp(stats.energy - hoursPassed * 1.5),
    hunger: clamp(stats.hunger + hoursPassed * 3),
    hygiene: clamp(stats.hygiene - hoursPassed * 1),
    affection: clamp(stats.affection - hoursPassed * 1.5),
  };
}

interface PetStore {
  pet: Pet | null;
  isLoading: boolean;
  cooldowns: Record<string, number>;
  coins: number;
  gems: number;

  createPet: (name: string, species: Pet['species'], photoUri: string | null) => void;
  loadPet: () => Promise<void>;
  savePet: () => Promise<void>;
  performCareAction: (action: CareAction) => void;
  updateDecay: () => void;
  equipAccessory: (accessoryId: string) => void;
  removeAccessory: (accessoryId: string) => void;
  setRoomTheme: (theme: Pet['roomTheme']) => void;
  setPixelStyle: (style: Pet['pixelStyle']) => void;
  purchaseItem: (price: number, currency: 'coins' | 'gems') => boolean;
  earnCoins: (amount: number) => void;
  resetPet: () => void;
}

const DEFAULT_STATS: PetStats = {
  happiness: 70,
  energy: 80,
  hunger: 30,
  hygiene: 90,
  affection: 60,
  xp: 0,
  level: 1,
};

export const usePetStore = create<PetStore>((set, get) => ({
  pet: null,
  isLoading: true,
  cooldowns: {},
  coins: 100,
  gems: 5,

  createPet: (name, species, photoUri) => {
    const personalities: Pet['personality'][] = [
      'lazy', 'chaotic', 'affectionate', 'jealous',
      'hyperactive', 'dramatic', 'intelligent', 'weird',
    ];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    const colorPalettes: Pet['pixelColors'][] = [
      { primary: '#c8a06e', secondary: '#f5d5a0', accent: '#ff6b9d', eyes: '#1a0a2e', outline: '#5c3d1e' },
      { primary: '#808080', secondary: '#c0c0c0', accent: '#00e5ff', eyes: '#1a0a2e', outline: '#404040' },
      { primary: '#d4a0c8', secondary: '#f0d0e8', accent: '#bf5fff', eyes: '#1a0a2e', outline: '#8060a0' },
      { primary: '#f0c040', secondary: '#ffe090', accent: '#ffe066', eyes: '#1a0a2e', outline: '#a08020' },
      { primary: '#60c080', secondary: '#a0e0b0', accent: '#39ff14', eyes: '#1a0a2e', outline: '#208040' },
    ];
    const pixelColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

    const now = Date.now();
    const newPet: Pet = {
      id: now.toString(),
      name,
      species,
      personality,
      mood: 'happy',
      evolutionStage: 'egg',
      pixelStyle: 'classic',
      stats: { ...DEFAULT_STATS },
      photoUri,
      pixelColors,
      accessories: [],
      roomTheme: 'bedroom',
      createdAt: now,
      lastInteraction: now,
      lastDecayAt: now,
      totalCareActions: 0,
      neglectStreak: 0,
    };

    set({ pet: newPet });
    get().savePet();
  },

  loadPet: async () => {
    try {
      const [petJson, coinsStr, gemsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem('@petagotchi_coins'),
        AsyncStorage.getItem('@petagotchi_gems'),
      ]);

      if (petJson) {
        const pet: Pet = JSON.parse(petJson);
        const now = Date.now();
        // Use lastDecayAt to track time since stats were last computed, preventing
        // double-decay across sessions. Fall back to lastInteraction for old saves.
        const decayFrom = pet.lastDecayAt ?? pet.lastInteraction;
        const hoursPassed = (now - decayFrom) / (1000 * 60 * 60);
        const hoursSinceInteraction = (now - pet.lastInteraction) / (1000 * 60 * 60);
        const neglectStreak = hoursSinceInteraction >= NEGLECT_THRESHOLDS.gremlin ? pet.neglectStreak + 1 : 0;
        const decayedStats = applyDecay(pet.stats, Math.min(hoursPassed, 12));
        const updatedPet: Pet = {
          ...pet,
          stats: decayedStats,
          mood: calcMood(decayedStats),
          evolutionStage: calcEvolution(decayedStats.xp),
          neglectStreak,
          lastDecayAt: now,
        };
        set({
          pet: updatedPet,
          coins: coinsStr ? parseInt(coinsStr) : 100,
          gems: gemsStr ? parseInt(gemsStr) : 5,
        });
        // Persist immediately so next load doesn't re-apply this session's decay
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPet));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  savePet: async () => {
    const { pet, coins, gems } = get();
    if (!pet) return;
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pet)),
      AsyncStorage.setItem('@petagotchi_coins', coins.toString()),
      AsyncStorage.setItem('@petagotchi_gems', gems.toString()),
    ]);
  },

  performCareAction: (action) => {
    const { pet, cooldowns } = get();
    if (!pet) return;

    const now = Date.now();
    const lastUsed = cooldowns[action.type] || 0;
    if (now - lastUsed < action.cooldownMs) return;

    const newStats = { ...pet.stats };
    for (const [key, delta] of Object.entries(action.statEffects)) {
      if (key in newStats && key !== 'xp' && key !== 'level') {
        (newStats as any)[key] = clamp((newStats as any)[key] + (delta as number));
      }
    }
    newStats.xp += action.xpReward;
    const newLevel = Math.floor(newStats.xp / 100) + 1;
    newStats.level = newLevel;

    const updatedPet: Pet = {
      ...pet,
      stats: newStats,
      mood: calcMood(newStats),
      evolutionStage: calcEvolution(newStats.xp),
      lastInteraction: now,
      lastDecayAt: now,
      totalCareActions: pet.totalCareActions + 1,
      neglectStreak: 0,
    };

    set({
      pet: updatedPet,
      cooldowns: { ...cooldowns, [action.type]: now },
    });
    get().savePet();
  },

  updateDecay: () => {
    const { pet } = get();
    if (!pet) return;
    const now = Date.now();
    const lastDecay = pet.lastDecayAt ?? pet.lastInteraction;
    const hoursPassed = (now - lastDecay) / (1000 * 60 * 60);
    if (hoursPassed < 0.1) return;

    const decayed = applyDecay(pet.stats, 0.1);
    const updatedPet: Pet = {
      ...pet,
      stats: decayed,
      mood: calcMood(decayed),
      lastDecayAt: now,
    };
    set({ pet: updatedPet });
  },

  equipAccessory: (accessoryId) => {
    const { pet } = get();
    if (!pet || pet.accessories.includes(accessoryId)) return;
    const updated = { ...pet, accessories: [...pet.accessories, accessoryId] };
    set({ pet: updated });
    get().savePet();
  },

  removeAccessory: (accessoryId) => {
    const { pet } = get();
    if (!pet) return;
    const updated = { ...pet, accessories: pet.accessories.filter(a => a !== accessoryId) };
    set({ pet: updated });
    get().savePet();
  },

  setRoomTheme: (theme) => {
    const { pet } = get();
    if (!pet) return;
    set({ pet: { ...pet, roomTheme: theme } });
    get().savePet();
  },

  setPixelStyle: (style) => {
    const { pet } = get();
    if (!pet) return;
    set({ pet: { ...pet, pixelStyle: style } });
    get().savePet();
  },

  purchaseItem: (price, currency) => {
    const { coins, gems } = get();
    if (currency === 'coins' && coins >= price) {
      set({ coins: coins - price });
      AsyncStorage.setItem('@petagotchi_coins', (coins - price).toString());
      return true;
    }
    if (currency === 'gems' && gems >= price) {
      set({ gems: gems - price });
      AsyncStorage.setItem('@petagotchi_gems', (gems - price).toString());
      return true;
    }
    return false;
  },

  earnCoins: (amount) => {
    const { coins } = get();
    const newCoins = coins + amount;
    set({ coins: newCoins });
    AsyncStorage.setItem('@petagotchi_coins', newCoins.toString());
  },

  resetPet: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ pet: null, cooldowns: {} });
  },
}));
