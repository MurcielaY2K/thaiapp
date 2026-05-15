import { AppState } from './appState';

/**
 * Minimal async key-value storage interface.
 * Implementations: FileStorage (Node.js), MemoryStorage (tests / browser).
 */
export interface StorageAdapter {
  /** Load app state. Returns null when no saved state exists. */
  load(): Promise<AppState | null>;

  /** Persist the full app state atomically. */
  save(state: AppState): Promise<void>;

  /** Delete all saved data (for "reset progress" flows). */
  clear(): Promise<void>;
}
