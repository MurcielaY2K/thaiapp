export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird' | 'reptile' | 'other';

export type EvolutionStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'legend';

export type PetPersonality =
  | 'lazy'
  | 'chaotic'
  | 'affectionate'
  | 'jealous'
  | 'hyperactive'
  | 'dramatic'
  | 'intelligent'
  | 'weird';

export type PetMood = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'angry' | 'sleepy' | 'hungry';

export type PixelStyle = 'classic' | 'cyber' | 'fantasy' | 'chibi' | 'ghost';

export type RoomTheme = 'bedroom' | 'park' | 'moon' | 'cyber_city' | 'fantasy' | 'underwater';

export interface PetStats {
  happiness: number;   // 0-100
  energy: number;      // 0-100
  hunger: number;      // 0-100
  hygiene: number;     // 0-100
  affection: number;   // 0-100
  xp: number;
  level: number;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  personality: PetPersonality;
  mood: PetMood;
  evolutionStage: EvolutionStage;
  pixelStyle: PixelStyle;
  stats: PetStats;
  photoUri: string | null;
  pixelColors: PixelPalette;
  accessories: string[];
  roomTheme: RoomTheme;
  createdAt: number;
  lastInteraction: number;
  lastDecayAt?: number;
  totalCareActions: number;
  neglectStreak: number;
}

export interface PixelPalette {
  primary: string;
  secondary: string;
  accent: string;
  eyes: string;
  outline: string;
}

export interface CareAction {
  type: 'feed' | 'sleep' | 'play' | 'wash' | 'walk' | 'train' | 'hug';
  label: string;
  emoji: string;
  statEffects: Partial<PetStats>;
  cooldownMs: number;
  xpReward: number;
}

export interface MiniGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockLevel: number;
}

export interface Accessory {
  id: string;
  name: string;
  emoji: string;
  category: 'hat' | 'outfit' | 'background' | 'bed' | 'toy';
  price: number;
  currency: 'coins' | 'gems';
  rarity: 'common' | 'rare' | 'legendary';
  seasonal?: string;
}

export interface Friend {
  id: string;
  username: string;
  petName: string;
  petSpecies: PetSpecies;
  evolutionStage: EvolutionStage;
  level: number;
  lastSeen: number;
}
