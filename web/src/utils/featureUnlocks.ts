import { UserProfile } from '@engine/types';

export interface FeatureUnlocks {
  // Learn tab activities
  quiz: boolean;
  phrasebook: boolean;
  memoryMatch: boolean;
  toneTrainer: boolean;
  alphabetDrill: boolean;
  sentenceBuilder: boolean;

  // Tabs
  vocabBrowser: boolean;

  // Home sections
  dailyChallenge: boolean;
  statsRow: boolean;
  srsCharts: boolean;
  strugglingWords: boolean;

  // Profile
  shop: boolean;
  achievements: boolean;
  categoryBreakdown: boolean;
}

export interface UnlockThresholds {
  quiz: number;
  phrasebook: number;
  memoryMatch: number;
  toneTrainer: number;
  alphabetDrill: number;
  sentenceBuilder: number;
  vocabBrowser: number;
}

export const UNLOCK_AT: UnlockThresholds = {
  quiz:            5,
  phrasebook:      10,
  memoryMatch:     15,
  toneTrainer:     20,
  alphabetDrill:   25,
  sentenceBuilder: 35,
  vocabBrowser:    10,
};

export function getFeatureUnlocks(profile: UserProfile): FeatureUnlocks {
  const w = profile.totalWordsLearned;
  const r = profile.totalCardsReviewed;
  return {
    quiz:            w >= UNLOCK_AT.quiz,
    phrasebook:      w >= UNLOCK_AT.phrasebook,
    memoryMatch:     w >= UNLOCK_AT.memoryMatch,
    toneTrainer:     w >= UNLOCK_AT.toneTrainer,
    alphabetDrill:   w >= UNLOCK_AT.alphabetDrill,
    sentenceBuilder: w >= UNLOCK_AT.sentenceBuilder,
    vocabBrowser:    w >= UNLOCK_AT.vocabBrowser,
    dailyChallenge:  w >= UNLOCK_AT.quiz,
    statsRow:        r >= 3,
    srsCharts:       r >= 15,
    strugglingWords: r >= 10,
    shop:            profile.gold > 0 || profile.gems > 0,
    achievements:    r >= 5,
    categoryBreakdown: w >= 20,
  };
}
