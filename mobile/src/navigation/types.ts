import { SessionSummary } from '@engine/engine/sessionManager';
import { GameRegion } from '@engine/types';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Study: undefined;
  SessionComplete: {
    summary: SessionSummary;
    xpGained: number;
    completedQuestIds: string[];
  };

  QuestDetail: { region: GameRegion };
};

export type TabParamList = {
  Home: undefined;
  Quests: undefined;
  Profile: undefined;
};
