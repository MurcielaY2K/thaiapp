// ─── Thai tone system ────────────────────────────────────────────────────────

export type ThaiTone = 'mid' | 'low' | 'falling' | 'high' | 'rising';

export type ThaiConsonantClass = 'low' | 'mid' | 'high';

export const TONE_COLORS: Record<ThaiTone, string> = {
  mid:     '#9E9E9E',
  low:     '#5B9FD4',
  falling: '#E85D3A',
  high:    '#F5C542',
  rising:  '#6BBF6E',
};

// ─── Card types ──────────────────────────────────────────────────────────────

export type CardType =
  | 'vocabulary'
  | 'sentence'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'grammar';

export type SemanticCategory =
  | 'greetings'
  | 'numbers'
  | 'food'
  | 'travel'
  | 'body'
  | 'emotion'
  | 'nature'
  | 'family'
  | 'time'
  | 'color'
  | 'direction'
  | 'shopping'
  | 'health'
  | 'work'
  | 'housing'
  | 'transport'
  | 'culture'
  | 'religion'
  | 'animal'
  | 'clothing'
  | 'weather'
  | 'verbs_core'
  | 'adjectives_core'
  | 'grammar';

// ─── Core vocabulary card ────────────────────────────────────────────────────

export interface ExampleSentence {
  thai: string;
  romanization: string;
  englishLiteral: string;
  englishNatural: string;
}

export interface VocabCard {
  id: string;
  type: CardType;
  category: SemanticCategory;
  region: GameRegion;              // which world region this belongs to

  // Thai language data
  thai: string;                    // Thai script
  romanization: string;            // RTGS romanization
  ipa: string;                     // IPA pronunciation
  tone: ThaiTone;
  consonantClass?: ThaiConsonantClass;

  // Translations
  englishMeaning: string;
  englishAlternatives?: string[];  // other valid meanings

  // Audio
  audioFile: string;               // relative path, e.g. "audio/gin.mp3"

  // Example
  exampleSentence: ExampleSentence;

  // Cultural context
  culturalNote?: string;

  // Metadata
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  relatedCardIds?: string[];
  tags?: string[];
}

// ─── SRS card state (persisted per user) ────────────────────────────────────

export type ReviewQuality = 0 | 1 | 2 | 3 | 4;
// 0 = Blackout | 1 = Hard | 2 = Okay | 3 = Good | 4 = Perfect

export const REVIEW_QUALITY_LABELS: Record<ReviewQuality, string> = {
  0: 'Again',
  1: 'Hard',
  2: 'Okay',
  3: 'Good',
  4: 'Perfect',
};

export interface CardSRSState {
  cardId: string;
  repetitions: number;        // how many times reviewed successfully in a row
  interval: number;           // days until next review
  easeFactor: number;         // SM-2 ease factor (starts at 2.5)
  nextReviewDate: string;     // ISO date string (YYYY-MM-DD)
  lastReviewDate: string | null;
  totalReviews: number;
  correctReviews: number;
  isNew: boolean;
  isMastered: boolean;        // interval > 30 days = mastered
  reviewHistory: ReviewRecord[];
}

export interface ReviewRecord {
  date: string;               // ISO date string
  quality: ReviewQuality;
  timeTakenMs: number;
}

// ─── Game / RPG types ────────────────────────────────────────────────────────

export type GameRegion =
  | 'krung_thon'        // Bangkok / port city — beginner
  | 'paa_isaan'         // Spirit forest — elementary
  | 'doi_nuea'          // Northern peaks — intermediate
  | 'talee_tong'        // Golden sea — intermediate
  | 'mueang_hin'        // Stone city — upper-intermediate
  | 'wang_loi_faa'      // Sky palace — advanced
  | 'daen_winyaan';     // Spirit realm — advanced

export interface RegionConfig {
  id: GameRegion;
  nameThai: string;
  nameEnglish: string;
  description: string;
  minLevelRequired: number;
  cardCount: number;
  questCount: number;
  bossName: string;
  unlockCost: number;           // XP required to unlock after reaching level
}

export const REGIONS: Record<GameRegion, RegionConfig> = {
  krung_thon: {
    id: 'krung_thon',
    nameThai: 'เมืองกรุงทอง',
    nameEnglish: 'The Golden Port',
    description: 'Your journey begins at the bustling port city.',
    minLevelRequired: 1,
    cardCount: 200,
    questCount: 10,
    bossName: 'The Harbor Master',
    unlockCost: 0,
  },
  paa_isaan: {
    id: 'paa_isaan',
    nameThai: 'ป่าอิสาน',
    nameEnglish: 'The Spirit Forest',
    description: 'Ancient spirits guard the secrets of the northeast.',
    minLevelRequired: 6,
    cardCount: 250,
    questCount: 12,
    bossName: 'The Forest Spirit',
    unlockCost: 1000,
  },
  doi_nuea: {
    id: 'doi_nuea',
    nameThai: 'ยอดดอยเหนือ',
    nameEnglish: 'The Northern Peaks',
    description: 'Mist-shrouded mountains hold ancient temple wisdom.',
    minLevelRequired: 11,
    cardCount: 300,
    questCount: 14,
    bossName: 'The Temple Guardian',
    unlockCost: 3000,
  },
  talee_tong: {
    id: 'talee_tong',
    nameThai: 'ทะเลทอง',
    nameEnglish: 'The Golden Sea',
    description: 'Turquoise waters and limestone karsts hide a dragon.',
    minLevelRequired: 16,
    cardCount: 300,
    questCount: 12,
    bossName: 'The Sea Dragon',
    unlockCost: 6000,
  },
  mueang_hin: {
    id: 'mueang_hin',
    nameThai: 'เมืองหิน',
    nameEnglish: 'The Stone City',
    description: 'Ruins of a forgotten empire speak in formal tongues.',
    minLevelRequired: 21,
    cardCount: 350,
    questCount: 16,
    bossName: 'The Stone Scholar',
    unlockCost: 12000,
  },
  wang_loi_faa: {
    id: 'wang_loi_faa',
    nameThai: 'พระราชวังลอยฟ้า',
    nameEnglish: 'The Sky Palace',
    description: 'The celestial court demands perfect honorifics.',
    minLevelRequired: 26,
    cardCount: 400,
    questCount: 18,
    bossName: 'The Royal Herald',
    unlockCost: 25000,
  },
  daen_winyaan: {
    id: 'daen_winyaan',
    nameThai: 'แดนวิญญาณ',
    nameEnglish: 'The Spirit Realm',
    description: 'The final frontier — pure classical Thai.',
    minLevelRequired: 30,
    cardCount: 500,
    questCount: 20,
    bossName: 'The Ancient One',
    unlockCost: 50000,
  },
};

// ─── Level system ─────────────────────────────────────────────────────────────

export interface LevelConfig {
  level: number;
  titleEnglish: string;
  titleThai: string;
  titleRomanized: string;
  xpRequired: number;          // total XP to reach this level
  xpToNext: number;            // XP needed from this level to next
}

// ─── Quests ───────────────────────────────────────────────────────────────────

export type QuestType = 'story' | 'side' | 'daily' | 'boss';

export interface Quest {
  id: string;
  type: QuestType;
  region: GameRegion;
  title: string;
  description: string;
  flavorText: string;          // in-world narrative
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisiteQuestIds?: string[];
  expiresInHours?: number;     // for daily/side quests
}

export interface QuestObjective {
  type: 'review_cards' | 'learn_words' | 'speaking_score' | 'boss_battle' | 'perfect_session';
  count: number;
  cardCategory?: SemanticCategory;
  minimumScore?: number;       // for speaking_score objectives (0–100)
  description: string;
}

export interface QuestReward {
  xp: number;
  gold: number;
  gems?: number;
  companionId?: string;
  cosmeticId?: string;
  cardUnlockIds?: string[];
}

// ─── Daily missions ───────────────────────────────────────────────────────────

export interface DailyMission {
  id: string;
  description: string;
  objective: QuestObjective;
  xpReward: number;
  goldReward: number;
  isCompleted: boolean;
  progress: number;
}

// ─── Spirit companions ────────────────────────────────────────────────────────

export type CompanionBonus =
  | 'double_listening_xp'
  | 'streak_protection'
  | 'reduced_interval_penalty'
  | 'bonus_gold'
  | 'speaking_score_boost'
  | 'double_new_word_xp';

export interface SpiritCompanion {
  id: string;
  nameThai: string;
  nameEnglish: string;
  folktaleOrigin: string;
  description: string;
  bonus: CompanionBonus;
  rarity: 'common' | 'rare' | 'legendary';
  unlockCondition: string;
}

// ─── User profile / game state ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  createdAt: string;

  // XP & levels
  totalXP: number;
  currentLevel: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  streakShields: number;

  // Currency
  gold: number;
  gems: number;

  // Collections
  unlockedRegions: GameRegion[];
  activeCompanionIds: string[];         // max 3 active
  collectedCompanionIds: string[];
  collectedCosmeticIds: string[];
  collectedArtifactIds: string[];

  // Progress
  completedQuestIds: string[];
  activeQuestIds: string[];
  dailyMissions: DailyMission[];
  lastMissionResetDate: string | null;

  // Stats
  totalCardsReviewed: number;
  totalWordsLearned: number;
  totalSpeakingCards: number;
  averageSpeakingScore: number;
  scriptMasteryPercent: number;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export type SessionPhase = 'warmup' | 'review' | 'new_words' | 'speaking' | 'daily_quest';

export interface SessionCard {
  card: VocabCard;
  srsState: CardSRSState;
  phase: SessionPhase;
  isNew: boolean;
}

export interface Session {
  id: string;
  startedAt: string;
  cards: SessionCard[];
  currentIndex: number;
  xpEarned: number;
  results: SessionResult[];
  isComplete: boolean;
}

export interface SessionResult {
  cardId: string;
  quality: ReviewQuality;
  timeTakenMs: number;
  xpEarned: number;
  wasNew: boolean;
}

// ─── XP config ────────────────────────────────────────────────────────────────

export const XP_CONFIG = {
  baseXP: {
    vocabulary: 10,
    sentence: 20,
    listening: 15,
    speaking: 25,
    reading: 15,
    grammar: 30,
  } as Record<CardType, number>,

  qualityMultiplier: {
    0: 0,     // Blackout — no XP
    1: 0.5,   // Hard
    2: 0.75,  // Okay
    3: 1.0,   // Good
    4: 1.5,   // Perfect
  } as Record<ReviewQuality, number>,

  newWordBonus: 15,
  perfectSessionBonus: 100,
  maxStreakMultiplier: 1.5,
  streakMultiplierPer10Days: 0.1,
} as const;
