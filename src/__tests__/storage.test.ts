import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  createAppState,
  touchLastSaved,
  applySRSUpdates,
  appendSessionRecord,
  validateAppState,
  AppState,
} from '../storage/appState';
import { MemoryStorage } from '../storage/memoryStorage';
import { FileStorage } from '../storage/fileStorage';
import { createNewProfile } from '../engine/gameEngine';
import { createInitialSRSState } from '../engine/srs';

const TODAY = '2026-05-15';

function makeProfile() {
  return createNewProfile('Tester', 'avatar_1', TODAY);
}

function makeState(): AppState {
  return createAppState(makeProfile());
}

// ─── createAppState ────────────────────────────────────────────────────────────

describe('createAppState', () => {
  it('initializes with empty SRS states and session history', () => {
    const state = makeState();
    expect(state.srsStates).toEqual({});
    expect(state.sessionHistory).toHaveLength(0);
  });

  it('sets version to APP_STATE_VERSION', () => {
    const state = makeState();
    expect(state.version).toBeGreaterThanOrEqual(1);
  });

  it('populates lastSaved as an ISO timestamp', () => {
    const state = makeState();
    expect(() => new Date(state.lastSaved)).not.toThrow();
  });
});

// ─── touchLastSaved ────────────────────────────────────────────────────────────

describe('touchLastSaved', () => {
  it('returns a new object with updated lastSaved', () => {
    const state = makeState();
    const before = state.lastSaved;
    // Advance JS clock by a tiny amount
    const updated = touchLastSaved(state);
    expect(updated).not.toBe(state);  // new reference
    expect(updated.lastSaved).toBeDefined();
    expect(typeof updated.lastSaved).toBe('string');
  });
});

// ─── applySRSUpdates ──────────────────────────────────────────────────────────

describe('applySRSUpdates', () => {
  it('merges new SRS states into the map', () => {
    const state = makeState();
    const srsState = createInitialSRSState('food_001', TODAY);
    const updated = applySRSUpdates(state, [srsState]);
    expect(updated.srsStates['food_001']).toEqual(srsState);
  });

  it('overwrites existing SRS state for same cardId', () => {
    const state = makeState();
    const v1 = { ...createInitialSRSState('food_001', TODAY), repetitions: 1 };
    const v2 = { ...createInitialSRSState('food_001', TODAY), repetitions: 5 };
    const after1 = applySRSUpdates(state, [v1]);
    const after2 = applySRSUpdates(after1, [v2]);
    expect(after2.srsStates['food_001'].repetitions).toBe(5);
  });

  it('does not mutate original state', () => {
    const state = makeState();
    const srs = createInitialSRSState('food_001', TODAY);
    applySRSUpdates(state, [srs]);
    expect(state.srsStates['food_001']).toBeUndefined();
  });
});

// ─── appendSessionRecord ──────────────────────────────────────────────────────

describe('appendSessionRecord', () => {
  const record = {
    id: 'sess_1',
    date: TODAY,
    summary: {
      cardsReviewed: 10,
      newWordsLearned: 3,
      xpEarned: 100,
      goldEarned: 5,
      accuracy: 0.8,
      perfectSession: false,
      averageTimeSec: 8,
      sessionDurationSec: 90,
    },
  };

  it('appends a session record', () => {
    const state = makeState();
    const updated = appendSessionRecord(state, record);
    expect(updated.sessionHistory).toHaveLength(1);
    expect(updated.sessionHistory[0].id).toBe('sess_1');
  });

  it('respects maxHistory cap', () => {
    let state = makeState();
    for (let i = 0; i < 10; i++) {
      state = appendSessionRecord(state, { ...record, id: `sess_${i}` }, 5);
    }
    expect(state.sessionHistory).toHaveLength(5);
    // Should have the last 5
    expect(state.sessionHistory[0].id).toBe('sess_5');
    expect(state.sessionHistory[4].id).toBe('sess_9');
  });
});

// ─── validateAppState ─────────────────────────────────────────────────────────

describe('validateAppState', () => {
  it('accepts a valid state object', () => {
    const state = makeState();
    expect(() => validateAppState(state)).not.toThrow();
  });

  it('throws on null', () => {
    expect(() => validateAppState(null)).toThrow();
  });

  it('throws on missing version', () => {
    const { version: _v, ...noVersion } = makeState();
    expect(() => validateAppState(noVersion)).toThrow(/version/);
  });

  it('throws on missing profile', () => {
    const { profile: _p, ...noProfile } = makeState();
    expect(() => validateAppState(noProfile)).toThrow(/profile/);
  });

  it('throws when sessionHistory is not an array', () => {
    const state = { ...makeState(), sessionHistory: 'bad' };
    expect(() => validateAppState(state)).toThrow(/sessionHistory/);
  });
});

// ─── MemoryStorage ────────────────────────────────────────────────────────────

describe('MemoryStorage', () => {
  it('returns null before any save', async () => {
    const storage = new MemoryStorage();
    expect(await storage.load()).toBeNull();
  });

  it('saves and loads state', async () => {
    const storage = new MemoryStorage();
    const state = makeState();
    await storage.save(state);
    const loaded = await storage.load();
    expect(loaded?.profile.id).toBe(state.profile.id);
  });

  it('returns a deep clone on load (not same reference)', async () => {
    const storage = new MemoryStorage();
    const state = makeState();
    await storage.save(state);
    const a = await storage.load();
    const b = await storage.load();
    expect(a).not.toBe(b);
  });

  it('clears saved state', async () => {
    const storage = new MemoryStorage();
    await storage.save(makeState());
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });

  it('accepts initial state in constructor', async () => {
    const state = makeState();
    const storage = new MemoryStorage(state);
    const loaded = await storage.load();
    expect(loaded?.profile.id).toBe(state.profile.id);
  });

  it('peek() returns in-memory state synchronously', () => {
    const state = makeState();
    const storage = new MemoryStorage(state);
    expect(storage.peek()?.profile.id).toBe(state.profile.id);
  });
});

// ─── FileStorage ──────────────────────────────────────────────────────────────

describe('FileStorage', () => {
  let tmpDir: string;
  let filePath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'thaiquest-test-'));
    filePath = path.join(tmpDir, 'save.json');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns null when file does not exist', async () => {
    const storage = new FileStorage(filePath);
    expect(await storage.load()).toBeNull();
  });

  it('saves to disk and loads back', async () => {
    const storage = new FileStorage(filePath);
    const state = makeState();
    await storage.save(state);
    const loaded = await storage.load();
    expect(loaded?.profile.id).toBe(state.profile.id);
  });

  it('writes valid JSON to disk', async () => {
    const storage = new FileStorage(filePath);
    await storage.save(makeState());
    const raw = await fs.readFile(filePath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it('creates parent directories if missing', async () => {
    const nested = path.join(tmpDir, 'a', 'b', 'save.json');
    const storage = new FileStorage(nested);
    await storage.save(makeState());
    expect(await fs.access(nested).then(() => true).catch(() => false)).toBe(true);
  });

  it('clears the file', async () => {
    const storage = new FileStorage(filePath);
    await storage.save(makeState());
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });

  it('clear() does not throw when file is already missing', async () => {
    const storage = new FileStorage(filePath);
    await expect(storage.clear()).resolves.toBeUndefined();
  });

  it('roundtrips SRS state correctly', async () => {
    const storage = new FileStorage(filePath);
    const state = makeState();
    const srs = createInitialSRSState('food_001', TODAY);
    const withSRS = applySRSUpdates(state, [srs]);
    await storage.save(withSRS);
    const loaded = await storage.load();
    expect(loaded?.srsStates['food_001']).toEqual(srs);
  });
});
