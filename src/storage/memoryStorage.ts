import { AppState } from './appState';
import { StorageAdapter } from './storageAdapter';

/**
 * In-memory storage — no I/O.
 * Used for unit tests and as a browser placeholder until IndexedDB is wired.
 */
export class MemoryStorage implements StorageAdapter {
  private data: AppState | null = null;

  /** Seed the storage with an initial state (useful in tests). */
  constructor(initial?: AppState) {
    this.data = initial ?? null;
  }

  async load(): Promise<AppState | null> {
    return this.data ? structuredClone(this.data) : null;
  }

  async save(state: AppState): Promise<void> {
    this.data = structuredClone(state);
  }

  async clear(): Promise<void> {
    this.data = null;
  }

  /** Synchronous peek for tests — not part of the adapter interface. */
  peek(): AppState | null {
    return this.data;
  }
}
