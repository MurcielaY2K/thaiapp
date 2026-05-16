import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from '@engine/storage/storageAdapter';
import { AppState, validateAppState } from '@engine/storage/appState';

const KEY = '@thaiquest:v2';

export class AsyncStorageAdapter implements StorageAdapter {
  async load(): Promise<AppState | null> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return null;
      return validateAppState(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async save(state: AppState): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  }
}
