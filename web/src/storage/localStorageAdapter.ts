import { StorageAdapter } from '@engine/storage/storageAdapter';
import { AppState, validateAppState } from '@engine/storage/appState';

const KEY = 'thaiquest:v2';

export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<AppState | null> {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return validateAppState(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async save(state: AppState): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(KEY);
  }
}
