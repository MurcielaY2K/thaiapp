import { GameFacade } from '../GameFacade';
import { MemoryStorage } from '../storage/memoryStorage';
import { createAppState } from '../storage/appState';
import { createNewProfile } from '../engine/gameEngine';

const TODAY = '2026-05-15';

function makeStorage(existing = false) {
  if (!existing) return new MemoryStorage();
  const profile = createNewProfile('Existing', 'avatar_1', TODAY);
  const state = createAppState(profile);
  return new MemoryStorage(state);
}

function makeFacade(storage?: MemoryStorage) {
  return new GameFacade(storage ?? makeStorage(), { today: TODAY });
}

// ─── init ─────────────────────────────────────────────────────────────────────

describe('GameFacade.init', () => {
  it('creates a new profile when storage is empty', async () => {
    const facade = makeFacade();
    const profile = await facade.init('Niran');
    expect(profile.name).toBe('Niran');
    expect(profile.totalXP).toBe(0);
    expect(profile.currentLevel).toBe(1);
  });

  it('loads existing profile from storage', async () => {
    const storage = makeStorage(true);
    const facade = makeFacade(storage);
    const profile = await facade.init();
    expect(profile.name).toBe('Existing');
  });

  it('persists the new profile to storage on first init', async () => {
    const storage = new MemoryStorage();
    const facade = makeFacade(storage);
    await facade.init('Niran');
    expect(storage.peek()).not.toBeNull();
  });

  it('starts with krung_thon unlocked', async () => {
    const facade = makeFacade();
    const profile = await facade.init();
    expect(profile.unlockedRegions).toContain('krung_thon');
  });

  it('throws if methods called before init', () => {
    const facade = new GameFacade(new MemoryStorage(), { today: TODAY });
    expect(() => facade.profile).toThrow(/init/);
  });
});

// ─── getDashboardStats ────────────────────────────────────────────────────────

describe('GameFacade.getDashboardStats', () => {
  it('reports new cards available from unlocked region', async () => {
    const facade = makeFacade();
    await facade.init();
    const stats = facade.getDashboardStats();
    expect(stats.newAvailable).toBeGreaterThan(0);
    expect(stats.totalCards).toBeGreaterThan(0);
    expect(stats.dueToday).toBe(0);   // fresh profile, no reviews yet
  });

  it('reports 0 mastered cards on a fresh profile', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(facade.getDashboardStats().masteredCards).toBe(0);
  });

  it('reports estimatedMinutes > 0 when new cards are available', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(facade.getDashboardStats().estimatedMinutes).toBeGreaterThan(0);
  });
});

// ─── startSession / answerCard / endSession ───────────────────────────────────

describe('GameFacade session lifecycle', () => {
  async function initAndStart() {
    const facade = makeFacade();
    await facade.init('Niran');
    const session = facade.startSession();
    return { facade, session };
  }

  it('startSession returns a session with cards', async () => {
    const { session } = await initAndStart();
    expect(session.cards.length).toBeGreaterThan(0);
    expect(session.isComplete).toBe(false);
  });

  it('answerCard advances the session', async () => {
    const { facade, session } = await initAndStart();
    const before = session.currentIndex;
    const result = facade.answerCard(3, 3000);
    expect(result.updatedSession.currentIndex).toBe(before + 1);
  });

  it('answerCard returns SRS state update', async () => {
    const { facade } = await initAndStart();
    const result = facade.answerCard(4, 2000);
    expect(result.updatedSRSState.totalReviews).toBe(1);
    expect(result.updatedSRSState.repetitions).toBe(1);
  });

  it('completes session after answering all cards', async () => {
    const { facade, session } = await initAndStart();
    for (let i = 0; i < session.cards.length; i++) {
      facade.answerCard(3, 2000);
    }
    expect(facade.getProgress()?.remaining).toBe(0);
  });

  it('endSession persists SRS updates to storage', async () => {
    const storage = new MemoryStorage();
    const facade = new GameFacade(storage, { today: TODAY });
    await facade.init('Niran');
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) {
      facade.answerCard(3, 2000);
    }
    await facade.endSession();
    const saved = storage.peek();
    expect(Object.keys(saved!.srsStates).length).toBeGreaterThan(0);
  });

  it('endSession updates profile XP', async () => {
    const facade = makeFacade();
    await facade.init('Niran');
    const initialXP = facade.profile.totalXP;
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) {
      facade.answerCard(3, 2000);
    }
    await facade.endSession();
    expect(facade.profile.totalXP).toBeGreaterThan(initialXP);
  });

  it('endSession records session in history', async () => {
    const facade = makeFacade();
    await facade.init('Niran');
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) {
      facade.answerCard(3, 2000);
    }
    await facade.endSession();
    expect(facade.getSessionHistory()).toHaveLength(1);
  });

  it('endSession returns null when no session active', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(await facade.endSession()).toBeNull();
  });

  it('throws if answerCard called with no session', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(() => facade.answerCard(3, 1000)).toThrow(/startSession/);
  });
});

// ─── getProgress ─────────────────────────────────────────────────────────────

describe('GameFacade.getProgress', () => {
  it('returns null when no session is active', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(facade.getProgress()).toBeNull();
  });

  it('returns progress stats during a session', async () => {
    const facade = makeFacade();
    await facade.init();
    const session = facade.startSession();
    facade.answerCard(3, 1000);
    const progress = facade.getProgress();
    expect(progress).not.toBeNull();
    expect(progress!.answered).toBe(1);
    expect(progress!.remaining).toBe(session.cards.length - 1);
  });
});

// ─── saveProfile ─────────────────────────────────────────────────────────────

describe('GameFacade.saveProfile', () => {
  it('persists profile changes to storage', async () => {
    const storage = new MemoryStorage();
    const facade = new GameFacade(storage, { today: TODAY });
    await facade.init('Niran');
    const modified = { ...facade.profile, name: 'Changed' };
    await facade.saveProfile(modified);
    expect(storage.peek()?.profile.name).toBe('Changed');
  });
});

// ─── resetProgress ───────────────────────────────────────────────────────────

describe('GameFacade.resetProgress', () => {
  it('clears storage and resets internal state', async () => {
    const storage = new MemoryStorage();
    const facade = new GameFacade(storage, { today: TODAY });
    await facade.init('Niran');
    await facade.resetProgress();
    expect(storage.peek()).toBeNull();
    // After reset, methods require re-init
    expect(() => facade.profile).toThrow(/init/);
  });
});

// ─── Quest integration ────────────────────────────────────────────────────────

describe('GameFacade quest integration', () => {
  it('auto-accepts available quests on init', async () => {
    const facade = makeFacade();
    await facade.init();
    // kt_01_first_steps has no prerequisites — should be active immediately
    expect(facade.profile.activeQuestIds).toContain('kt_01_first_steps');
    expect(facade.getQuestProgress('kt_01_first_steps')).not.toBeNull();
  });

  it('getQuestBoard returns entries for all region quests', async () => {
    const facade = makeFacade();
    await facade.init();
    const board = facade.getQuestBoard('krung_thon');
    expect(board.length).toBeGreaterThan(5);
    const statuses = board.map(e => e.status);
    expect(statuses).toContain('active');
    expect(statuses).toContain('locked');
  });

  it('getQuestBoard marks completed quests correctly', async () => {
    const facade = makeFacade();
    await facade.init();
    // Complete the session so kt_01 (learn 10 words) progresses
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) facade.answerCard(3, 2000);
    await facade.endSession();

    const board = facade.getQuestBoard('krung_thon');
    const kt01 = board.find(e => e.quest.id === 'kt_01_first_steps')!;
    // 10 new words were learned in this session → should be complete
    expect(kt01.status).toBe('completed');
  });

  it('acceptQuest throws for unknown quest', async () => {
    const facade = makeFacade();
    await facade.init();
    expect(() => facade.acceptQuest('does_not_exist')).toThrow();
  });

  it('acceptQuest throws for unavailable (locked) quest', async () => {
    const facade = makeFacade();
    await facade.init();
    // kt_10 requires completing quests 1–9 first
    expect(() => facade.acceptQuest('kt_10_harbor_master')).toThrow();
  });

  it('endSession returns completedQuestIds', async () => {
    const facade = makeFacade();
    await facade.init();
    // kt_07_flawless: perfect_session, count 1
    // Manually accept it by completing prerequisites would be complex,
    // so test via the session completing kt_01 (learn 10 words)
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) facade.answerCard(3, 2000);
    const result = await facade.endSession();
    expect(result?.completedQuestIds).toBeDefined();
    expect(Array.isArray(result?.completedQuestIds)).toBe(true);
  });

  it('endSession persists quest progress to storage', async () => {
    const storage = new MemoryStorage();
    const facade = new GameFacade(storage, { today: TODAY });
    await facade.init();
    const session = facade.startSession();
    for (let i = 0; i < session.cards.length; i++) facade.answerCard(3, 2000);
    await facade.endSession();
    const saved = storage.peek();
    expect(Object.keys(saved!.questProgress).length).toBeGreaterThan(0);
  });

  it('quest progress survives a storage round-trip', async () => {
    const storage = new MemoryStorage();

    const g1 = new GameFacade(storage, { today: TODAY });
    await g1.init('Niran');
    const session = g1.startSession();
    for (let i = 0; i < session.cards.length; i++) g1.answerCard(3, 2000);
    await g1.endSession();

    const g2 = new GameFacade(storage, { today: TODAY });
    await g2.init();
    // kt_01 should be completed (10 words learned)
    const board = g2.getQuestBoard('krung_thon');
    const kt01 = board.find(e => e.quest.id === 'kt_01_first_steps')!;
    expect(kt01.status).toBe('completed');
  });

  it('speakingScore passed to answerCard feeds quest evaluation', async () => {
    const facade = makeFacade();
    await facade.init();
    facade.startSession();
    // Answer with a speaking score — just verify it doesn't throw
    expect(() => facade.answerCard(4, 2000, 85)).not.toThrow();
  });
});

// ─── Persistence round-trip ───────────────────────────────────────────────────

describe('persistence round-trip', () => {
  it('second init loads progress from first session', async () => {
    const storage = new MemoryStorage();

    // First session
    const g1 = new GameFacade(storage, { today: TODAY });
    await g1.init('Niran');
    const session = g1.startSession();
    for (let i = 0; i < session.cards.length; i++) g1.answerCard(3, 2000);
    const result1 = await g1.endSession();
    const xpAfterSession1 = g1.profile.totalXP;

    // Second session — new GameFacade, same storage
    const g2 = new GameFacade(storage, { today: TODAY });
    await g2.init();
    expect(g2.profile.totalXP).toBe(xpAfterSession1);
    expect(g2.getSessionHistory()).toHaveLength(1);
    expect(result1?.summary.cardsReviewed).toBeGreaterThan(0);
  });
});
