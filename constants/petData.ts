import type { CareAction, MiniGame, Accessory, PetPersonality, PixelStyle, RoomTheme } from '../types';

export const CARE_ACTIONS: CareAction[] = [
  {
    type: 'feed',
    label: 'Feed',
    emoji: '🍖',
    statEffects: { hunger: -30, happiness: 10, energy: 5 },
    cooldownMs: 3 * 60 * 60 * 1000,
    xpReward: 10,
  },
  {
    type: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    statEffects: { energy: 50, hunger: 10, hygiene: -5 },
    cooldownMs: 8 * 60 * 60 * 1000,
    xpReward: 8,
  },
  {
    type: 'play',
    label: 'Play',
    emoji: '🎮',
    statEffects: { happiness: 25, energy: -15, hunger: 10 },
    cooldownMs: 2 * 60 * 60 * 1000,
    xpReward: 15,
  },
  {
    type: 'wash',
    label: 'Wash',
    emoji: '🛁',
    statEffects: { hygiene: 40, happiness: 5, energy: -5 },
    cooldownMs: 6 * 60 * 60 * 1000,
    xpReward: 8,
  },
  {
    type: 'walk',
    label: 'Walk',
    emoji: '🦮',
    statEffects: { happiness: 20, energy: -20, hunger: 15, hygiene: -10 },
    cooldownMs: 4 * 60 * 60 * 1000,
    xpReward: 20,
  },
  {
    type: 'train',
    label: 'Train',
    emoji: '🏋️',
    statEffects: { happiness: 15, energy: -25, hunger: 20 },
    cooldownMs: 6 * 60 * 60 * 1000,
    xpReward: 25,
  },
  {
    type: 'hug',
    label: 'Hug',
    emoji: '🤗',
    statEffects: { happiness: 15, affection: 20, energy: -2 },
    cooldownMs: 30 * 60 * 1000,
    xpReward: 5,
  },
];

export const MINI_GAMES: MiniGame[] = [
  { id: 'treat_catch', name: 'Treat Catch', emoji: '🦴', description: 'Catch falling treats!', unlockLevel: 1 },
  { id: 'retro_race', name: 'Retro Race', emoji: '🏎️', description: 'Race through pixel streets!', unlockLevel: 3 },
  { id: 'fishing', name: 'Pixel Fishing', emoji: '🎣', description: 'Reel in rare fish!', unlockLevel: 5 },
  { id: 'puzzle', name: 'Paw Puzzle', emoji: '🧩', description: 'Solve pixel puzzles!', unlockLevel: 7 },
  { id: 'dance', name: 'Dance Battle', emoji: '💃', description: 'Hit the beat!', unlockLevel: 10 },
  { id: 'obstacle', name: 'Pixel Rush', emoji: '⚡', description: 'Dodge obstacles!', unlockLevel: 12 },
];

export const ACCESSORIES: Accessory[] = [
  { id: 'party_hat', name: 'Party Hat', emoji: '🎩', category: 'hat', price: 50, currency: 'coins', rarity: 'common' },
  { id: 'crown', name: 'Pixel Crown', emoji: '👑', category: 'hat', price: 200, currency: 'coins', rarity: 'rare' },
  { id: 'star_hat', name: 'Star Hat', emoji: '⭐', category: 'hat', price: 5, currency: 'gems', rarity: 'legendary' },
  { id: 'bow', name: 'Cute Bow', emoji: '🎀', category: 'hat', price: 30, currency: 'coins', rarity: 'common' },
  { id: 'space_suit', name: 'Space Suit', emoji: '👨‍🚀', category: 'outfit', price: 300, currency: 'coins', rarity: 'rare' },
  { id: 'wizard_robe', name: 'Wizard Robe', emoji: '🧙', category: 'outfit', price: 10, currency: 'gems', rarity: 'legendary' },
  { id: 'cozy_bed', name: 'Cozy Bed', emoji: '🛏️', category: 'bed', price: 100, currency: 'coins', rarity: 'common' },
  { id: 'cloud_bed', name: 'Cloud Bed', emoji: '☁️', category: 'bed', price: 8, currency: 'gems', rarity: 'rare' },
];

export const PERSONALITY_TRAITS: Record<PetPersonality, { description: string; behaviors: string[]; emoji: string }> = {
  lazy: {
    emoji: '😪',
    description: 'Prefers naps over everything',
    behaviors: ['Falls asleep during play', 'Extra grumpy when woken', 'Loves cozy bed accessories'],
  },
  chaotic: {
    emoji: '🌪️',
    description: 'Pure unpredictable energy',
    behaviors: ['Random mood swings', 'Destroys accessories sometimes', 'Loves extreme games'],
  },
  affectionate: {
    emoji: '🥰',
    description: 'Just wants cuddles 24/7',
    behaviors: ['Happiness drops fast without hugs', 'Extra XP from affection actions', 'Loves heart accessories'],
  },
  jealous: {
    emoji: '😤',
    description: 'Gets moody when you visit friends',
    behaviors: ['Mood drops after social visits', 'Needs extra hugs after jealousy', 'Competitive in games'],
  },
  hyperactive: {
    emoji: '⚡',
    description: 'Never stops bouncing',
    behaviors: ['Energy depletes fast', 'Earns 2x XP from exercise', 'Bored quickly without play'],
  },
  dramatic: {
    emoji: '🎭',
    description: 'Every stat change is an event',
    behaviors: ['Exaggerated mood animations', 'Loud sound effects', 'Loves attention'],
  },
  intelligent: {
    emoji: '🧠',
    description: 'Solves puzzles, judges you',
    behaviors: ['Earns 2x XP from training', 'Bored by simple games', 'Unlocks secret evolutions'],
  },
  weird: {
    emoji: '👁️',
    description: 'Operates on a different plane',
    behaviors: ['Unpredictable stat effects', 'Unique evolution paths', 'Strange idle animations'],
  },
};

export const PIXEL_STYLES: Record<PixelStyle, { name: string; description: string; emoji: string }> = {
  classic: { name: 'Classic', description: 'Original Tamagotchi vibes', emoji: '🕹️' },
  cyber: { name: 'Cyber', description: 'Neon city dweller', emoji: '💻' },
  fantasy: { name: 'Fantasy', description: 'Magical creature form', emoji: '✨' },
  chibi: { name: 'Chibi', description: 'Super cute and round', emoji: '🥹' },
  ghost: { name: 'Ghost', description: 'Spooky transparent form', emoji: '👻' },
};

export const ROOM_THEMES: Record<RoomTheme, { name: string; emoji: string; bgColors: string[] }> = {
  bedroom: { name: 'Cozy Bedroom', emoji: '🛏️', bgColors: ['#1a0a2e', '#2d1b4e'] },
  park: { name: 'Pixel Park', emoji: '🌳', bgColors: ['#0a2e0a', '#1b4e1b'] },
  moon: { name: 'Moon Base', emoji: '🌙', bgColors: ['#0a0a1e', '#1b1b3e'] },
  cyber_city: { name: 'Cyber City', emoji: '🌆', bgColors: ['#001122', '#002244'] },
  fantasy: { name: 'Fantasy World', emoji: '🏰', bgColors: ['#2e0a1a', '#4e1b2d'] },
  underwater: { name: 'Deep Sea', emoji: '🌊', bgColors: ['#001a2e', '#002d4e'] },
};

export const EVOLUTION_STAGES = {
  egg: { name: 'Egg', minXp: 0, emoji: '🥚', description: 'Something is about to hatch...' },
  baby: { name: 'Baby', minXp: 50, emoji: '🐣', description: 'A tiny pixel creature!' },
  child: { name: 'Child', minXp: 200, emoji: '🐾', description: 'Growing fast!' },
  teen: { name: 'Teen', minXp: 600, emoji: '🌟', description: 'Finding their personality' },
  adult: { name: 'Adult', minXp: 1500, emoji: '💪', description: 'Fully evolved companion' },
  legend: { name: 'Legend', minXp: 5000, emoji: '👑', description: 'A truly legendary creature!' },
};

export const NEGLECT_THRESHOLDS = {
  warning: 6,   // hours without interaction
  critical: 12,
  gremlin: 24,
};
