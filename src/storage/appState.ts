import { UserProfile, CardSRSState } from '../types';
import { SessionSummary } from '../engine/sessionManager';

// ─── Persisted app state ──────────────────────────────────────────────────────
// One JSON document holds everything for a single player.
// Games using a server backend would split this across tables;
// for the core engine we keep it flat and portable.

export const APP_STATE_VERSION = 1;

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

  // Future: run per-version migrations here when APP_STATE_VERSION bumps
  return obj as unknown as AppState;
}
