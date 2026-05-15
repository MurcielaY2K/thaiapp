import fs from 'fs/promises';
import path from 'path';
import { AppState, validateAppState } from './appState';
import { StorageAdapter } from './storageAdapter';

/**
 * JSON file storage for Node.js environments (CLI, server, Electron).
 * Writes atomically: data → temp file → rename, so a crash mid-write
 * never corrupts the live save file.
 */
export class FileStorage implements StorageAdapter {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  async load(): Promise<AppState | null> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return validateAppState(JSON.parse(raw));
    } catch (err: unknown) {
      if (isNodeError(err) && err.code === 'ENOENT') return null;
      throw err;
    }
  }

  async save(state: AppState): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${this.filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(state, null, 2), 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch (err: unknown) {
      if (isNodeError(err) && err.code === 'ENOENT') return;
      throw err;
    }
  }
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === 'object' && err !== null && 'code' in err;
}
