import {
  calculateXP,
  getLevelFromXP,
  getLevelConfig,
  getXPProgressInCurrentLevel,
  applyXPGain,
  updateStreak,
  generateDailyMissions,
  updateMissionProgress,
  createNewProfile,
  shouldSuggestRestDay,
  SPIRIT_COMPANIONS,
} from '../engine/gameEngine';
import { UserProfile } from '../types';

const TODAY = '2026-05-15';
const YESTERDAY = '2026-05-14';
const TWO_DAYS_AGO = '2026-05-13';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...createNewProfile('Test', 'avatar_1', TODAY), ...overrides };
}

// ─── XP calculation ───────────────────────────────────────────────────────────

describe('calculateXP', () => {
  it('returns 0 XP for Blackout', () => {
    const result = calculateXP('vocabulary', 0, false, 0);
    expect(result.xp).toBe(0);
  });

  it('awards base XP for Good on vocabulary', () => {
    const result = calculateXP('vocabulary', 3, false, 0);
    expect(result.xp).toBe(10); // base=10, multiplier=1.0, no streak, no new
  });

  it('awards 1.5x XP for Perfect', () => {
    const result = calculateXP('vocabulary', 4, false, 0);
    expect(result.xp).toBe(15); // 10 * 1.5
  });

  it('awards new word bonus', () => {
    const result = calculateXP('vocabulary', 3, true, 0);
    expect(result.xp).toBe(25); // 10 (base) + 15 (new word bonus)
  });

  it('applies streak multiplier at 10 days', () => {
    const result = calculateXP('vocabulary', 3, false, 10);
    expect(result.xp).toBe(11); // 10 * 1.1 = 11
  });

  it('caps streak multiplier at 1.5x', () => {
    const result = calculateXP('vocabulary', 3, false, 999);
    expect(result.xp).toBe(15); // 10 * 1.5 = 15
  });

  it('applies companion double_listening_xp bonus', () => {
    const result = calculateXP('listening', 3, false, 0, ['double_listening_xp']);
    expect(result.xp).toBe(30); // 15 base * 2
  });

  it('awards more XP for speaking than vocabulary', () => {
    const speaking = calculateXP('speaking', 3, false, 0);
    const vocab = calculateXP('vocabulary', 3, false, 0);
    expect(speaking.xp).toBeGreaterThan(vocab.xp);
  });
});

// ─── Level system ─────────────────────────────────────────────────────────────

describe('getLevelFromXP', () => {
  it('returns level 1 at 0 XP', () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it('returns level 2 at 500 XP', () => {
    expect(getLevelFromXP(500)).toBe(2);
  });

  it('returns level 6 (Explorer) at 3000 XP', () => {
    expect(getLevelFromXP(3000)).toBe(6);
  });

  it('does not exceed level from XP below threshold', () => {
    expect(getLevelFromXP(499)).toBe(1);
  });
});

describe('getXPProgressInCurrentLevel', () => {
  it('returns 0% at level start', () => {
    const result = getXPProgressInCurrentLevel(500); // exactly at level 2
    expect(result.current).toBe(0);
    expect(result.percent).toBe(0);
  });

  it('returns 50% at midpoint', () => {
    const result = getXPProgressInCurrentLevel(750); // 500 into level 2 (requires 500)
    expect(result.percent).toBe(50);
  });
});

describe('applyXPGain', () => {
  it('increments totalXP', () => {
    const profile = makeProfile({ totalXP: 400 });
    const { profile: updated } = applyXPGain(profile, 200);
    expect(updated.totalXP).toBe(600);
  });

  it('fires level up event when crossing threshold', () => {
    const profile = makeProfile({ totalXP: 490, currentLevel: 1 });
    const { event } = applyXPGain(profile, 20); // crosses 500
    expect(event.didLevelUp).toBe(true);
    expect(event.newLevel).toBe(2);
  });

  it('unlocks region when level requirement is met', () => {
    // Region paa_isaan requires level 6
    const profile = makeProfile({
      totalXP: 2900,
      currentLevel: 5,
      unlockedRegions: ['krung_thon'],
    });
    const { profile: updated, event } = applyXPGain(profile, 200); // crosses 3000 → level 6
    expect(event.newRegionsUnlocked).toContain('paa_isaan');
    expect(updated.unlockedRegions).toContain('paa_isaan');
  });

  it('does not fire level up event when staying same level', () => {
    const profile = makeProfile({ totalXP: 100, currentLevel: 1 });
    const { event } = applyXPGain(profile, 50);
    expect(event.didLevelUp).toBe(false);
  });
});

// ─── Streak system ────────────────────────────────────────────────────────────

describe('updateStreak', () => {
  it('starts streak at 1 on first ever practice', () => {
    const profile = makeProfile({ lastPracticeDate: null, currentStreak: 0 });
    const { profile: updated } = updateStreak(profile, TODAY);
    expect(updated.currentStreak).toBe(1);
  });

  it('increments streak on consecutive day', () => {
    const profile = makeProfile({ lastPracticeDate: YESTERDAY, currentStreak: 5 });
    const { profile: updated } = updateStreak(profile, TODAY);
    expect(updated.currentStreak).toBe(6);
  });

  it('does not change streak if practiced already today', () => {
    const profile = makeProfile({ lastPracticeDate: TODAY, currentStreak: 5 });
    const { profile: updated } = updateStreak(profile, TODAY);
    expect(updated.currentStreak).toBe(5);
  });

  it('resets streak when 2+ days missed without shield', () => {
    const profile = makeProfile({ lastPracticeDate: TWO_DAYS_AGO, currentStreak: 10, streakShields: 0 });
    const { profile: updated, streakLost } = updateStreak(profile, TODAY);
    expect(updated.currentStreak).toBe(1);
    expect(streakLost).toBe(true);
  });

  it('uses shield when exactly 1 day missed', () => {
    const profile = makeProfile({ lastPracticeDate: TWO_DAYS_AGO, currentStreak: 10, streakShields: 1 });
    const { profile: updated, shieldUsed } = updateStreak(profile, TODAY);
    expect(updated.currentStreak).toBe(11);
    expect(shieldUsed).toBe(true);
    expect(updated.streakShields).toBe(0);
  });

  it('updates longestStreak when current beats record', () => {
    const profile = makeProfile({ lastPracticeDate: YESTERDAY, currentStreak: 29, longestStreak: 20 });
    const { profile: updated } = updateStreak(profile, TODAY);
    expect(updated.longestStreak).toBe(30);
  });

  it('reports milestone at 7 days', () => {
    const profile = makeProfile({ lastPracticeDate: YESTERDAY, currentStreak: 6 });
    const { streakMilestone } = updateStreak(profile, TODAY);
    expect(streakMilestone).toBe(7);
  });
});

describe('shouldSuggestRestDay', () => {
  it('suggests rest day at 7-day multiples', () => {
    const profile = makeProfile({ currentStreak: 7 });
    expect(shouldSuggestRestDay(profile)).toBe(true);
    const profile30 = makeProfile({ currentStreak: 14 });
    expect(shouldSuggestRestDay(profile30)).toBe(true);
  });

  it('does not suggest rest day at non-multiples', () => {
    const profile = makeProfile({ currentStreak: 8 });
    expect(shouldSuggestRestDay(profile)).toBe(false);
  });
});

// ─── Daily missions ───────────────────────────────────────────────────────────

describe('generateDailyMissions', () => {
  it('generates exactly 3 missions', () => {
    const missions = generateDailyMissions(TODAY);
    expect(missions).toHaveLength(3);
  });

  it('generates same missions for same date (deterministic)', () => {
    const a = generateDailyMissions(TODAY);
    const b = generateDailyMissions(TODAY);
    expect(a.map(m => m.id)).toEqual(b.map(m => m.id));
  });

  it('generates different missions for different dates', () => {
    const a = generateDailyMissions(TODAY);
    const b = generateDailyMissions(YESTERDAY);
    // Very unlikely to be identical
    expect(a.map(m => m.id)).not.toEqual(b.map(m => m.id));
  });

  it('all missions start incomplete', () => {
    const missions = generateDailyMissions(TODAY);
    missions.forEach(m => {
      expect(m.isCompleted).toBe(false);
      expect(m.progress).toBe(0);
    });
  });
});

describe('updateMissionProgress', () => {
  it('increments progress', () => {
    const missions = generateDailyMissions(TODAY);
    // Pick a mission whose objective count is large enough to test a partial increment
    const mission = missions.find(m => m.objective.count >= 10) ?? missions[0];
    const increment = Math.min(5, mission.objective.count - 1);
    const updated = updateMissionProgress(mission, increment);
    expect(updated.progress).toBe(increment);
  });

  it('marks mission complete when progress meets objective', () => {
    const missions = generateDailyMissions(TODAY);
    const mission = missions.find(m => m.objective.count <= 10)!;
    const updated = updateMissionProgress(mission, mission.objective.count);
    expect(updated.isCompleted).toBe(true);
  });

  it('does not exceed objective count', () => {
    const missions = generateDailyMissions(TODAY);
    const mission = missions[0];
    const updated = updateMissionProgress(mission, 9999);
    expect(updated.progress).toBe(mission.objective.count);
  });

  it('does not modify completed missions', () => {
    const missions = generateDailyMissions(TODAY);
    const mission = missions[0];
    const completed = { ...mission, isCompleted: true, progress: mission.objective.count };
    const updated = updateMissionProgress(completed, 5);
    expect(updated.progress).toBe(mission.objective.count);
  });
});

// ─── Companions ───────────────────────────────────────────────────────────────

describe('SPIRIT_COMPANIONS', () => {
  it('has at least 6 companions defined', () => {
    expect(SPIRIT_COMPANIONS.length).toBeGreaterThanOrEqual(6);
  });

  it('all companions have required fields', () => {
    SPIRIT_COMPANIONS.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.nameThai).toBeTruthy();
      expect(c.bonus).toBeTruthy();
      expect(['common', 'rare', 'legendary']).toContain(c.rarity);
    });
  });

  it('phi_lok is the starter companion', () => {
    const starter = SPIRIT_COMPANIONS.find(c => c.id === 'phi_lok');
    expect(starter).toBeDefined();
    expect(starter!.bonus).toBe('double_new_word_xp');
  });
});

// ─── Profile creation ─────────────────────────────────────────────────────────

describe('createNewProfile', () => {
  it('starts with krung_thon unlocked', () => {
    const profile = createNewProfile('Test', 'avatar_1', TODAY);
    expect(profile.unlockedRegions).toContain('krung_thon');
  });

  it('starts with phi_lok companion', () => {
    const profile = createNewProfile('Test', 'avatar_1', TODAY);
    expect(profile.activeCompanionIds).toContain('phi_lok');
  });

  it('starts at level 1 with 0 XP', () => {
    const profile = createNewProfile('Test', 'avatar_1', TODAY);
    expect(profile.totalXP).toBe(0);
    expect(profile.currentLevel).toBe(1);
  });

  it('generates 3 daily missions on creation', () => {
    const profile = createNewProfile('Test', 'avatar_1', TODAY);
    expect(profile.dailyMissions).toHaveLength(3);
  });
});
