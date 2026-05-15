import { UserProfile, CardSRSState } from '../types';
import { SessionSummary } from '../engine/sessionManager';
import { QuestProgress } from '../engine/questEngine';

// ─── Persisted app state ──────────────────────────────────────────────────────

export const APP_STATE_VERSION = 2;

export interface SessionRecord {
  id: string;
  date: string;              // YYYY-MM-DD
  summary: SessionSummary;
}

export interface AppState {
  version: number;
  profile: UserProfile;
  /** cardId → SRS state for every card the player has ever seen */
  srsStates: Record<string, CardSRSState>;
  /** questId → live objective progress for active quests */
  questProgress: Record<string, QuestProgress>;
  /** Chronological log of completed sessions (most recent last) */
  sessionHistory: SessionRecord[];
  lastSaved: string;         // ISO timestamp
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAppState(profile: UserProfile): AppState {
  return {
    version: APP_STATE_VERSION,
    profile,
    srsStates: {},
    questProgress: {},
    sessionHistory: [],
    lastSaved: new Date().toISOString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function touchLastSaved(state: AppState): AppState {
  return { ...state, lastSaved: new Date().toISOString() };
}

export function applySRSUpdates(
  state: AppState,
  updates: CardSRSState[],
): AppState {
  const next = { ...state.srsStates };
  for (const s of updates) {
    next[s.cardId] = s;
  }
  return { ...state, srsStates: next };
}

export function applyQuestProgressUpdates(
  state: AppState,
  updates: Record<string, QuestProgress>,
): AppState {
  return { ...state, questProgress: { ...state.questProgress, ...updates } };
}

export function appendSessionRecord(
  state: AppState,
  record: SessionRecord,
  maxHistory = 500,
): AppState {
  const history = [...state.sessionHistory, record].slice(-maxHistory);
  return { ...state, sessionHistory: history };
}

// ─── Validation / migration ───────────────────────────────────────────────────

export function validateAppState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AppState: invalid root object');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj['version'] !== 'number') {
    throw new Error('AppState: missing version field');
  }
  if (!obj['profile'] || typeof obj['profile'] !== 'object') {
    throw new Error('AppState: missing profile');
  }
  if (!obj['srsStates'] || typeof obj['srsStates'] !== 'object') {
    throw new Error('AppState: missing srsStates');
  }
  if (!Array.isArray(obj['sessionHistory'])) {
    throw new Error('AppState: sessionHistory must be an array');
  }

  // v1 → v2: add questProgress field if missing
  if (!obj['questProgress'] || typeof obj['questProgress'] !== 'object') {
    obj['questProgress'] = {};
    obj['version'] = APP_STATE_VERSION;
  }

  return obj as unknown as AppState;
}
