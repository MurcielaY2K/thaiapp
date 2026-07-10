// Cloud progress sync. The whole learning state is serialized into one JSON
// snapshot stored per-user in Supabase (progress_sync table, owner-only RLS).
//
// Sync model: progress only ever grows, so conflict resolution is
// "the snapshot with more XP wins wholesale" (ties broken by streak, then by
// save time). That keeps merges deterministic and understandable — no
// field-by-field three-way merges that could resurrect stale state.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { SUPABASE_CONFIGURED } from '../constants/supabase';
import { StorageKeys } from '../constants/storageKeys';
import { useProgressStore } from '../store/progressStore';
import { useSrsStore } from '../store/srsStore';
import { useUserStore } from '../store/userStore';

export interface ProgressSnapshot {
  v: 1;
  savedAt: number;
  xp: number;
  gems: number;
  lessonProgress: Record<string, string>;
  lessonStars?: Record<string, number>;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
  srs: Record<string, unknown>;
  writing: Record<string, number>;
  streak: number;
  lastStudyDay: string;
  unlockedRewards: string[];
}

export function buildSnapshot(): ProgressSnapshot {
  const p = useProgressStore.getState();
  const s = useSrsStore.getState();
  const u = useUserStore.getState();
  return {
    v: 1,
    savedAt: Date.now(),
    xp: p.xp,
    gems: p.gems,
    lessonProgress: p.lessonProgress,
    lessonStars: p.lessonStars,
    skillLevel: p.skillLevel,
    srs: s.progress,
    writing: s.writing,
    streak: s.streak,
    lastStudyDay: s.lastStudyDay,
    unlockedRewards: u.unlockedRewards,
  };
}

// The remote snapshot is data, not code — but it can be stale (older app
// version), truncated, or hand-edited via the API by the account owner.
// Coerce every field to a sane shape/range before it touches storage, so a
// bad snapshot can never poison local state (NaN xp, bogus lesson states…).
const LESSON_STATES = new Set(['available', 'locked', 'complete', 'premium-locked']);
const SKILL_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);

function toCount(v: unknown, max: number, fallback = 0): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : fallback;
  return Math.min(Math.max(n, 0), max);
}

export function sanitizeSnapshot(raw: unknown): ProgressSnapshot | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const lessonProgress: Record<string, string> = {};
  if (r.lessonProgress && typeof r.lessonProgress === 'object' && !Array.isArray(r.lessonProgress)) {
    for (const [k, v] of Object.entries(r.lessonProgress as Record<string, unknown>)) {
      if (typeof v === 'string' && LESSON_STATES.has(v)) lessonProgress[k.slice(0, 40)] = v;
    }
  }

  const lessonStars: Record<string, number> = {};
  if (r.lessonStars && typeof r.lessonStars === 'object' && !Array.isArray(r.lessonStars)) {
    for (const [k, v] of Object.entries(r.lessonStars as Record<string, unknown>)) {
      const stars = toCount(v, 3);
      if (stars > 0) lessonStars[k.slice(0, 40)] = stars;
    }
  }

  // SRS entries must be numerically sound or the scheduler produces NaN dates.
  const srs: Record<string, unknown> = {};
  if (r.srs && typeof r.srs === 'object' && !Array.isArray(r.srs)) {
    for (const [k, v] of Object.entries(r.srs as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue;
      const e = v as Record<string, unknown>;
      srs[k.slice(0, 40)] = {
        interval: toCount(e.interval, 3650),
        dueDate:  toCount(e.dueDate, 8.64e15),
        ease:     typeof e.ease === 'number' && Number.isFinite(e.ease)
                    ? Math.min(Math.max(e.ease, 1.3), 2.5) : 2.5,
        reviews:  toCount(e.reviews, 100000),
      };
    }
  }

  const writing: Record<string, number> = {};
  if (r.writing && typeof r.writing === 'object' && !Array.isArray(r.writing)) {
    for (const [k, v] of Object.entries(r.writing as Record<string, unknown>)) {
      const n = toCount(v, 100000);
      if (n > 0) writing[k.slice(0, 40)] = n;
    }
  }

  const unlockedRewards = Array.isArray(r.unlockedRewards)
    ? r.unlockedRewards.filter((x): x is string => typeof x === 'string').slice(0, 500)
    : [];

  return {
    v: 1,
    savedAt: toCount(r.savedAt, 8.64e15),
    xp:   toCount(r.xp, 100_000_000),
    gems: toCount(r.gems, 100_000_000),
    lessonProgress,
    lessonStars,
    skillLevel: typeof r.skillLevel === 'string' && SKILL_LEVELS.has(r.skillLevel)
      ? (r.skillLevel as ProgressSnapshot['skillLevel']) : null,
    srs,
    writing,
    streak: toCount(r.streak, 36500),
    lastStudyDay: typeof r.lastStudyDay === 'string' ? r.lastStudyDay.slice(0, 10) : '',
    unlockedRewards,
  };
}

async function applySnapshot(snap: ProgressSnapshot): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(StorageKeys.xp, String(snap.xp)),
    AsyncStorage.setItem(StorageKeys.gems, String(snap.gems)),
    AsyncStorage.setItem(StorageKeys.lessonProgress, JSON.stringify(snap.lessonProgress)),
    AsyncStorage.setItem(StorageKeys.lessonStars, JSON.stringify(snap.lessonStars ?? {})),
    ...(snap.skillLevel ? [AsyncStorage.setItem(StorageKeys.skillLevel, snap.skillLevel)] : []),
    AsyncStorage.setItem(StorageKeys.srsProgress, JSON.stringify(snap.srs)),
    AsyncStorage.setItem(StorageKeys.writing, JSON.stringify(snap.writing)),
    AsyncStorage.setItem(StorageKeys.streak, JSON.stringify({ streak: snap.streak, lastStudyDay: snap.lastStudyDay })),
    AsyncStorage.setItem(StorageKeys.rewards, JSON.stringify(snap.unlockedRewards)),
  ]);
  // Re-hydrate the stores through their own load paths so derived state
  // (level, heart refill, daily reset) is recomputed consistently.
  await Promise.all([
    useProgressStore.getState().load(),
    useSrsStore.getState().load(),
    useUserStore.getState().load(),
  ]);
}

async function authUid(): Promise<string | null> {
  if (!SUPABASE_CONFIGURED || !supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

export type SyncStatus = { lastSyncedAt: number | null; state: 'idle' | 'syncing' | 'error' };
let status: SyncStatus = { lastSyncedAt: null, state: 'idle' };
const statusListeners = new Set<(s: SyncStatus) => void>();
function setStatus(next: Partial<SyncStatus>) {
  status = { ...status, ...next };
  statusListeners.forEach(l => l(status));
}
export function getSyncStatus(): SyncStatus { return status; }
export function onSyncStatus(l: (s: SyncStatus) => void): () => void {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
}

export async function pushProgress(): Promise<boolean> {
  const uid = await authUid();
  if (!uid || !supabase) return false;
  setStatus({ state: 'syncing' });
  const { error } = await supabase.from('progress_sync').upsert(
    { auth_id: uid, data: buildSnapshot() },
    { onConflict: 'auth_id' },
  );
  setStatus(error ? { state: 'error' } : { state: 'idle', lastSyncedAt: Date.now() });
  return !error;
}

// Pull the remote snapshot and reconcile with local state.
// Returns which side won (or 'none' when there is nothing to reconcile).
export async function pullAndMerge(): Promise<'remote' | 'local' | 'none'> {
  const uid = await authUid();
  if (!uid || !supabase) return 'none';

  const { data, error } = await supabase
    .from('progress_sync')
    .select('data')
    .eq('auth_id', uid)
    .maybeSingle();
  if (error) return 'none';

  const local = buildSnapshot();
  const remote = sanitizeSnapshot(data?.data ?? null);

  if (!remote) {
    if (local.xp > 0) await pushProgress();
    return 'none';
  }

  const remoteWins =
    remote.xp > local.xp ||
    (remote.xp === local.xp && remote.streak > local.streak) ||
    (remote.xp === local.xp && remote.streak === local.streak && remote.savedAt > local.savedAt);

  if (remoteWins) {
    await applySnapshot(remote);
    setStatus({ state: 'idle', lastSyncedAt: Date.now() });
    return 'remote';
  }
  await pushProgress();
  return 'local';
}

// Restore the user's profile row on a fresh device after magic-link sign-in.
// profiles.auth_id is hidden from clients, so this goes through the
// my_profile() SECURITY DEFINER function (supabase/progress_sync.sql).
export async function restoreProfileFromCloud(): Promise<boolean> {
  const uid = await authUid();
  if (!uid || !supabase) return false;
  const u = useUserStore.getState();
  if (u.isSetup) return false;

  const { data, error } = await supabase.rpc('my_profile').maybeSingle();
  if (error || !data) return false;

  const row = data as {
    id: string; username: string; display_name: string;
    avatar_emoji: string; country_flag: string; bio: string; profile_frame: string;
  };
  const profile = {
    profileId: row.id,
    authId: uid,
    username: row.username,
    displayName: row.display_name,
    avatarEmoji: row.avatar_emoji,
    countryFlag: row.country_flag,
    bio: row.bio,
    profileFrame: row.profile_frame as never,
    isSetup: true,
  };
  await AsyncStorage.setItem(StorageKeys.profile, JSON.stringify(profile));
  await useUserStore.getState().load();
  return true;
}

// Debounced auto-push: any meaningful progress change schedules an upload.
const PUSH_DEBOUNCE_MS = 8000;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushProgress().catch(() => {}); }, PUSH_DEBOUNCE_MS);
}

export function initProgressSync(): void {
  if (initialized || !SUPABASE_CONFIGURED) return;
  initialized = true;

  useProgressStore.subscribe((s, prev) => {
    if (s.xp !== prev.xp || s.gems !== prev.gems || s.lessonProgress !== prev.lessonProgress) {
      schedulePush();
    }
  });
  useSrsStore.subscribe((s, prev) => {
    if (s.progress !== prev.progress || s.writing !== prev.writing || s.streak !== prev.streak) {
      schedulePush();
    }
  });
}
