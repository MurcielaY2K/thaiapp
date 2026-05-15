import {
  UserProfile,
  ReviewQuality,
  CardType,
  LevelConfig,
  DailyMission,
  QuestObjective,
  GameRegion,
  SemanticCategory,
  XP_CONFIG,
  REGIONS,
  SpiritCompanion,
  CompanionBonus,
} from '../types';

// ─── Level table ──────────────────────────────────────────────────────────────

export const LEVELS: LevelConfig[] = [
  { level: 1,  titleEnglish: 'Traveler',      titleThai: 'นักเดินทาง',  titleRomanized: 'Nák Dəən Taang', xpRequired: 0,     xpToNext: 500   },
  { level: 2,  titleEnglish: 'Traveler II',   titleThai: 'นักเดินทาง',  titleRomanized: 'Nák Dəən Taang', xpRequired: 500,   xpToNext: 500   },
  { level: 3,  titleEnglish: 'Traveler III',  titleThai: 'นักเดินทาง',  titleRomanized: 'Nák Dəən Taang', xpRequired: 1000,  xpToNext: 500   },
  { level: 4,  titleEnglish: 'Traveler IV',   titleThai: 'นักเดินทาง',  titleRomanized: 'Nák Dəən Taang', xpRequired: 1500,  xpToNext: 500   },
  { level: 5,  titleEnglish: 'Traveler V',    titleThai: 'นักเดินทาง',  titleRomanized: 'Nák Dəən Taang', xpRequired: 2000,  xpToNext: 1000  },
  { level: 6,  titleEnglish: 'Explorer',      titleThai: 'นักสำรวจ',    titleRomanized: 'Nák Sǎmrùat',   xpRequired: 3000,  xpToNext: 1000  },
  { level: 7,  titleEnglish: 'Explorer II',   titleThai: 'นักสำรวจ',    titleRomanized: 'Nák Sǎmrùat',   xpRequired: 4000,  xpToNext: 1000  },
  { level: 8,  titleEnglish: 'Explorer III',  titleThai: 'นักสำรวจ',    titleRomanized: 'Nák Sǎmrùat',   xpRequired: 5000,  xpToNext: 1500  },
  { level: 9,  titleEnglish: 'Explorer IV',   titleThai: 'นักสำรวจ',    titleRomanized: 'Nák Sǎmrùat',   xpRequired: 6500,  xpToNext: 1500  },
  { level: 10, titleEnglish: 'Explorer V',    titleThai: 'นักสำรวจ',    titleRomanized: 'Nák Sǎmrùat',   xpRequired: 8000,  xpToNext: 2000  },
  { level: 11, titleEnglish: 'Warrior',       titleThai: 'นักรบ',       titleRomanized: 'Nák Róp',        xpRequired: 10000, xpToNext: 2000  },
  { level: 12, titleEnglish: 'Warrior II',    titleThai: 'นักรบ',       titleRomanized: 'Nák Róp',        xpRequired: 12000, xpToNext: 2000  },
  { level: 13, titleEnglish: 'Warrior III',   titleThai: 'นักรบ',       titleRomanized: 'Nák Róp',        xpRequired: 14000, xpToNext: 2500  },
  { level: 14, titleEnglish: 'Warrior IV',    titleThai: 'นักรบ',       titleRomanized: 'Nák Róp',        xpRequired: 16500, xpToNext: 2500  },
  { level: 15, titleEnglish: 'Warrior V',     titleThai: 'นักรบ',       titleRomanized: 'Nák Róp',        xpRequired: 19000, xpToNext: 3000  },
  { level: 16, titleEnglish: 'Scholar',       titleThai: 'นักปราชญ์',   titleRomanized: 'Nák Prâat',      xpRequired: 22000, xpToNext: 3000  },
  { level: 17, titleEnglish: 'Scholar II',    titleThai: 'นักปราชญ์',   titleRomanized: 'Nák Prâat',      xpRequired: 25000, xpToNext: 3500  },
  { level: 18, titleEnglish: 'Scholar III',   titleThai: 'นักปราชญ์',   titleRomanized: 'Nák Prâat',      xpRequired: 28500, xpToNext: 3500  },
  { level: 19, titleEnglish: 'Scholar IV',    titleThai: 'นักปราชญ์',   titleRomanized: 'Nák Prâat',      xpRequired: 32000, xpToNext: 4000  },
  { level: 20, titleEnglish: 'Scholar V',     titleThai: 'นักปราชญ์',   titleRomanized: 'Nák Prâat',      xpRequired: 36000, xpToNext: 5000  },
  { level: 21, titleEnglish: 'City Lord',     titleThai: 'เจ้าเมือง',   titleRomanized: 'Jâo Mʉang',      xpRequired: 41000, xpToNext: 5000  },
  { level: 22, titleEnglish: 'City Lord II',  titleThai: 'เจ้าเมือง',   titleRomanized: 'Jâo Mʉang',      xpRequired: 46000, xpToNext: 6000  },
  { level: 23, titleEnglish: 'City Lord III', titleThai: 'เจ้าเมือง',   titleRomanized: 'Jâo Mʉang',      xpRequired: 52000, xpToNext: 6000  },
  { level: 24, titleEnglish: 'City Lord IV',  titleThai: 'เจ้าเมือง',   titleRomanized: 'Jâo Mʉang',      xpRequired: 58000, xpToNext: 7000  },
  { level: 25, titleEnglish: 'City Lord V',   titleThai: 'เจ้าเมือง',   titleRomanized: 'Jâo Mʉang',      xpRequired: 65000, xpToNext: 8000  },
  { level: 26, titleEnglish: 'King/Queen',    titleThai: 'ราชา',         titleRomanized: 'Raaçaa',          xpRequired: 73000, xpToNext: 9000  },
  { level: 27, titleEnglish: 'King/Queen II', titleThai: 'ราชา',         titleRomanized: 'Raaçaa',          xpRequired: 82000, xpToNext: 10000 },
  { level: 28, titleEnglish: 'King/Queen III',titleThai: 'ราชา',         titleRomanized: 'Raaçaa',          xpRequired: 92000, xpToNext: 11000 },
  { level: 29, titleEnglish: 'King/Queen IV', titleThai: 'ราชา',         titleRomanized: 'Raaçaa',          xpRequired: 103000, xpToNext: 12000 },
  { level: 30, titleEnglish: 'King/Queen V',  titleThai: 'ราชา',         titleRomanized: 'Raaçaa',          xpRequired: 115000, xpToNext: 15000 },
  { level: 31, titleEnglish: 'Divine',        titleThai: 'เทพ',          titleRomanized: 'Thêep',           xpRequired: 130000, xpToNext: 20000 },
];

const MAX_DEFINED_LEVEL = LEVELS.length;

// ─── XP calculation ───────────────────────────────────────────────────────────

export interface XPResult {
  xp: number;
  breakdown: {
    base: number;
    qualityBonus: number;
    newWordBonus: number;
    streakMultiplier: number;
    companionBonus: number;
  };
}

export function calculateXP(
  cardType: CardType,
  quality: ReviewQuality,
  isNew: boolean,
  currentStreak: number,
  activeCompanionBonuses: CompanionBonus[] = [],
): XPResult {
  const base = XP_CONFIG.baseXP[cardType];
  const qualityMult = XP_CONFIG.qualityMultiplier[quality];

  // No XP for complete failure
  if (qualityMult === 0) {
    return { xp: 0, breakdown: { base, qualityBonus: 0, newWordBonus: 0, streakMultiplier: 1, companionBonus: 0 } };
  }

  const baseWithQuality = Math.round(base * qualityMult);
  const newWordBonus = isNew ? XP_CONFIG.newWordBonus : 0;

  // Streak multiplier: +10% per 10 days, capped at +50%
  const streakMultiplier = Math.min(
    XP_CONFIG.maxStreakMultiplier,
    1 + Math.floor(currentStreak / 10) * XP_CONFIG.streakMultiplierPer10Days,
  );

  // Companion bonuses
  let companionBonus = 0;
  if (cardType === 'listening' && activeCompanionBonuses.includes('double_listening_xp')) {
    companionBonus += baseWithQuality;
  }
  if (isNew && activeCompanionBonuses.includes('double_new_word_xp')) {
    companionBonus += newWordBonus;
  }

  const total = Math.round((baseWithQuality + newWordBonus) * streakMultiplier) + companionBonus;

  return {
    xp: total,
    breakdown: {
      base: baseWithQuality,
      qualityBonus: baseWithQuality - base,
      newWordBonus,
      streakMultiplier,
      companionBonus,
    },
  };
}

// ─── Level system ─────────────────────────────────────────────────────────────

export function getLevelConfig(level: number): LevelConfig {
  if (level <= MAX_DEFINED_LEVEL) {
    return LEVELS[level - 1];
  }
  // Beyond defined levels — generate dynamically
  const lastDefined = LEVELS[MAX_DEFINED_LEVEL - 1];
  const extraLevels = level - MAX_DEFINED_LEVEL;
  const xpToNext = lastDefined.xpToNext + extraLevels * 5000;
  return {
    level,
    titleEnglish: 'Divine',
    titleThai: 'เทพ',
    titleRomanized: 'Thêep',
    xpRequired: lastDefined.xpRequired + lastDefined.xpToNext + extraLevels * 20000,
    xpToNext,
  };
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  for (const config of LEVELS) {
    if (totalXP >= config.xpRequired) {
      level = config.level;
    } else {
      break;
    }
  }
  return level;
}

export function getXPProgressInCurrentLevel(totalXP: number): { current: number; required: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  const config = getLevelConfig(level);
  const xpIntoLevel = totalXP - config.xpRequired;
  const percent = Math.min(100, Math.round((xpIntoLevel / config.xpToNext) * 100));
  return { current: xpIntoLevel, required: config.xpToNext, percent };
}

export interface LevelUpEvent {
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  newRegionsUnlocked: GameRegion[];
}

export function applyXPGain(profile: UserProfile, xpGained: number): { profile: UserProfile; event: LevelUpEvent } {
  const oldLevel = profile.currentLevel;
  const newTotalXP = profile.totalXP + xpGained;
  const newLevel = getLevelFromXP(newTotalXP);

  const newRegionsUnlocked: GameRegion[] = [];
  if (newLevel > oldLevel) {
    for (const [regionId, config] of Object.entries(REGIONS) as [GameRegion, typeof REGIONS[GameRegion]][]) {
      if (
        config.minLevelRequired > oldLevel &&
        config.minLevelRequired <= newLevel &&
        !profile.unlockedRegions.includes(regionId)
      ) {
        newRegionsUnlocked.push(regionId);
      }
    }
  }

  return {
    profile: {
      ...profile,
      totalXP: newTotalXP,
      currentLevel: newLevel,
      unlockedRegions: [...profile.unlockedRegions, ...newRegionsUnlocked],
    },
    event: {
      didLevelUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      newRegionsUnlocked,
    },
  };
}

// ─── Streak system ────────────────────────────────────────────────────────────

export interface StreakUpdateResult {
  profile: UserProfile;
  streakLost: boolean;
  shieldUsed: boolean;
  streakMilestone: number | null;  // non-null when a milestone was hit
}

const STREAK_MILESTONES = [7, 30, 60, 100, 365];

export function updateStreak(profile: UserProfile, today: string): StreakUpdateResult {
  const last = profile.lastPracticeDate;

  if (!last) {
    // First ever practice
    return {
      profile: { ...profile, currentStreak: 1, lastPracticeDate: today },
      streakLost: false,
      shieldUsed: false,
      streakMilestone: null,
    };
  }

  const daysSinceLast = daysBetween(last, today);

  if (daysSinceLast === 0) {
    // Already practiced today — no change
    return { profile, streakLost: false, shieldUsed: false, streakMilestone: null };
  }

  let shieldUsed = false;
  let streakLost = false;
  let newStreak = profile.currentStreak;

  if (daysSinceLast === 1) {
    // Consecutive day — increment
    newStreak += 1;
  } else if (daysSinceLast === 2 && profile.streakShields > 0) {
    // Missed one day but has a shield — use it
    newStreak += 1;
    shieldUsed = true;
  } else {
    // Streak broken
    newStreak = 1;
    streakLost = true;
  }

  const longestStreak = Math.max(profile.longestStreak, newStreak);
  const streakMilestone = STREAK_MILESTONES.includes(newStreak) ? newStreak : null;

  return {
    profile: {
      ...profile,
      currentStreak: newStreak,
      longestStreak,
      lastPracticeDate: today,
      streakShields: shieldUsed ? profile.streakShields - 1 : profile.streakShields,
    },
    streakLost,
    shieldUsed,
    streakMilestone,
  };
}

export function getStreakMultiplier(streak: number): number {
  return Math.min(XP_CONFIG.maxStreakMultiplier, 1 + Math.floor(streak / 10) * 0.1);
}

export function shouldSuggestRestDay(profile: UserProfile): boolean {
  return profile.currentStreak > 0 && profile.currentStreak % 7 === 0;
}

// ─── Daily missions ───────────────────────────────────────────────────────────

const MISSION_POOL: Omit<DailyMission, 'isCompleted' | 'progress'>[] = [
  {
    id: 'review_20',
    description: 'Review 20 cards without any Blackout',
    objective: { type: 'review_cards', count: 20, description: 'Review 20 cards without Blackout' },
    xpReward: 75,
    goldReward: 50,
  },
  {
    id: 'learn_5_new',
    description: 'Learn 5 new vocabulary words',
    objective: { type: 'learn_words', count: 5, description: 'Learn 5 new words' },
    xpReward: 50,
    goldReward: 30,
  },
  {
    id: 'speaking_score_3',
    description: 'Score above 75% on 3 speaking cards',
    objective: { type: 'speaking_score', count: 3, minimumScore: 75, description: 'Score 75%+ on 3 speaking cards' },
    xpReward: 100,
    goldReward: 60,
  },
  {
    id: 'perfect_session',
    description: 'Complete a full session without Blackout',
    objective: { type: 'perfect_session', count: 1, description: 'Perfect session' },
    xpReward: 150,
    goldReward: 80,
  },
  {
    id: 'learn_10_new',
    description: 'Learn 10 new vocabulary words',
    objective: { type: 'learn_words', count: 10, description: 'Learn 10 new words' },
    xpReward: 80,
    goldReward: 50,
  },
  {
    id: 'review_food_words',
    description: 'Review 10 food vocabulary cards',
    objective: { type: 'review_cards', count: 10, cardCategory: 'food', description: 'Review 10 food cards' },
    xpReward: 60,
    goldReward: 40,
  },
  {
    id: 'review_50',
    description: 'Review 50 cards today',
    objective: { type: 'review_cards', count: 50, description: 'Review 50 cards' },
    xpReward: 120,
    goldReward: 70,
  },
  {
    id: 'speaking_score_5',
    description: 'Score above 80% on 5 speaking cards',
    objective: { type: 'speaking_score', count: 5, minimumScore: 80, description: 'Score 80%+ on 5 speaking cards' },
    xpReward: 130,
    goldReward: 75,
  },
  {
    id: 'learn_greetings',
    description: 'Review 5 greeting cards',
    objective: { type: 'review_cards', count: 5, cardCategory: 'greetings', description: 'Review 5 greeting cards' },
    xpReward: 40,
    goldReward: 25,
  },
  {
    id: 'learn_numbers',
    description: 'Review all number cards in your deck',
    objective: { type: 'review_cards', count: 10, cardCategory: 'numbers', description: 'Review 10 number cards' },
    xpReward: 50,
    goldReward: 30,
  },
];

/**
 * Generate 3 daily missions from the pool, seeded by today's date
 * so every user gets the same missions each day.
 */
export function generateDailyMissions(today: string): DailyMission[] {
  const seed = dateToSeed(today);
  const shuffled = seededShuffle([...MISSION_POOL], seed);
  return shuffled.slice(0, 3).map(m => ({ ...m, isCompleted: false, progress: 0 }));
}

export function shouldResetMissions(profile: UserProfile, today: string): boolean {
  return profile.lastMissionResetDate !== today;
}

/**
 * Update progress on a mission objective. Returns updated mission.
 */
export function updateMissionProgress(
  mission: DailyMission,
  increment: number,
): DailyMission {
  if (mission.isCompleted) return mission;
  const newProgress = Math.min(mission.objective.count, mission.progress + increment);
  const isCompleted = newProgress >= mission.objective.count;
  return { ...mission, progress: newProgress, isCompleted };
}

// ─── Gold & currency ──────────────────────────────────────────────────────────

export function awardGold(profile: UserProfile, amount: number): UserProfile {
  return { ...profile, gold: profile.gold + amount };
}

export function spendGold(profile: UserProfile, amount: number): UserProfile | null {
  if (profile.gold < amount) return null;
  return { ...profile, gold: profile.gold - amount };
}

export function awardGems(profile: UserProfile, amount: number): UserProfile {
  return { ...profile, gems: profile.gems + amount };
}

export function spendGems(profile: UserProfile, amount: number): UserProfile | null {
  if (profile.gems < amount) return null;
  return { ...profile, gems: profile.gems - amount };
}

// ─── Companion bonuses ────────────────────────────────────────────────────────

export const SPIRIT_COMPANIONS: SpiritCompanion[] = [
  {
    id: 'phi_krasue',
    nameThai: 'ผีกระสือ',
    nameEnglish: 'Phi Krasue',
    folktaleOrigin: 'A floating head that roams at night seeking knowledge.',
    description: 'Doubles XP earned from listening cards.',
    bonus: 'double_listening_xp',
    rarity: 'common',
    unlockCondition: 'Complete the Spirit Forest boss battle',
  },
  {
    id: 'phi_pret',
    nameThai: 'ผีเปรต',
    nameEnglish: 'Phi Pret',
    folktaleOrigin: 'A tall hungry spirit, eternally seeking to be satisfied.',
    description: 'Protects your streak on missed days (extra shield).',
    bonus: 'streak_protection',
    rarity: 'rare',
    unlockCondition: 'Maintain a 30-day streak',
  },
  {
    id: 'nang_tani',
    nameThai: 'นางตานี',
    nameEnglish: 'Nang Tani',
    folktaleOrigin: 'A gentle female spirit that dwells in banana trees.',
    description: 'Reduces interval penalty when you fail a card.',
    bonus: 'reduced_interval_penalty',
    rarity: 'common',
    unlockCondition: 'Learn 100 vocabulary words',
  },
  {
    id: 'mae_nak',
    nameThai: 'แม่นาก',
    nameEnglish: 'Mae Nak',
    folktaleOrigin: 'The most famous Thai ghost — devoted wife, formidable spirit.',
    description: 'Earn 20% more gold from all activities.',
    bonus: 'bonus_gold',
    rarity: 'rare',
    unlockCondition: 'Complete 10 story quests',
  },
  {
    id: 'garuda',
    nameThai: 'ครุฑ',
    nameEnglish: 'Garuda',
    folktaleOrigin: 'Divine eagle, vehicle of Vishnu, protector of kings.',
    description: '+10 bonus to all speaking card AI scores.',
    bonus: 'speaking_score_boost',
    rarity: 'legendary',
    unlockCondition: 'Defeat the Sky Palace boss',
  },
  {
    id: 'phi_lok',
    nameThai: 'ผีโลก',
    nameEnglish: 'Phi Lok',
    folktaleOrigin: 'An earth spirit that collects and remembers all words.',
    description: 'Doubles XP earned from learning new words.',
    bonus: 'double_new_word_xp',
    rarity: 'common',
    unlockCondition: 'Start your journey (default companion)',
  },
];

export function getActiveCompanionBonuses(profile: UserProfile): CompanionBonus[] {
  return profile.activeCompanionIds
    .map(id => SPIRIT_COMPANIONS.find(c => c.id === id))
    .filter((c): c is SpiritCompanion => c !== undefined)
    .map(c => c.bonus);
}

// ─── Profile factory ──────────────────────────────────────────────────────────

export function createNewProfile(name: string, avatarId: string, today: string): UserProfile {
  return {
    id: generateId(),
    name,
    avatarId,
    createdAt: today,
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    streakShields: 1,
    gold: 100,
    gems: 5,
    unlockedRegions: ['krung_thon'],
    activeCompanionIds: ['phi_lok'],
    collectedCompanionIds: ['phi_lok'],
    collectedCosmeticIds: [],
    collectedArtifactIds: [],
    completedQuestIds: [],
    activeQuestIds: [],
    dailyMissions: generateDailyMissions(today),
    lastMissionResetDate: today,
    totalCardsReviewed: 0,
    totalWordsLearned: 0,
    totalSpeakingCards: 0,
    averageSpeakingScore: 0,
    scriptMasteryPercent: 0,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function dateToSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + parseInt(part, 10), 0);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
