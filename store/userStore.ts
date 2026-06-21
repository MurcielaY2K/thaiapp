import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { SUPABASE_CONFIGURED } from '../constants/supabase';
import {
  REWARDS, RewardStats, FrameId, AvatarPackId, AVATAR_PACKS,
} from '../data/rewards';

const PROFILE_KEY  = '@thaiapp_user_profile';
const REWARDS_KEY  = '@thaiapp_unlocked_rewards';

export interface UserProfile {
  profileId: string | null;   // Supabase profile UUID
  authId:    string | null;   // Supabase auth UID
  username:     string;
  displayName:  string;
  avatarEmoji:  string;
  countryFlag:  string;
  bio:          string;
  profileFrame: FrameId;
  isSetup:      boolean;
}

export interface LeaderboardEntry {
  rank:          number;
  profileId:     string;
  username:      string;
  displayName:   string;
  avatarEmoji:   string;
  countryFlag:   string;
  profileFrame:  string;
  xp:            number;
  streak:        number;
  wordsMastered: number;
}

const DEFAULT_PROFILE: UserProfile = {
  profileId:    null,
  authId:       null,
  username:     '',
  displayName:  '',
  avatarEmoji:  '🐉',
  countryFlag:  '🌍',
  bio:          '',
  profileFrame: 'default',
  isSetup:      false,
};

interface UserStore extends UserProfile {
  leaderboard:        LeaderboardEntry[];
  myRank:             number | null;
  isLoadingLeaderboard: boolean;
  unlockedRewards:    string[];
  newRewards:         string[];   // IDs of just-unlocked rewards (for toast)
  isOnline:           boolean;
  isLoaded:           boolean;

  load:             () => Promise<void>;
  setupProfile:     (data: { username: string; displayName: string; avatarEmoji: string; countryFlag: string; bio: string }) => Promise<string | null>;
  updateProfile:    (data: Partial<UserProfile>) => Promise<void>;
  syncScore:        (stats: RewardStats) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  checkRewards:     (stats: RewardStats) => void;
  clearNewRewards:  () => void;
  getUnlockedAvatars: () => string[];
  getUnlockedFrames:  () => FrameId[];
  getUnlockedContent: () => string[];
}

function computeUnlocks(rewardIds: string[]) {
  const frames: FrameId[]   = ['default'];
  const packs:  AvatarPackId[] = ['starter'];
  const content: string[]   = [];
  for (const id of rewardIds) {
    const r = REWARDS.find(x => x.id === id);
    if (!r) continue;
    for (const u of r.unlocks) {
      if (u.type === 'frame')       frames.push(u.frameId);
      if (u.type === 'avatar-pack') packs.push(u.packId);
      if (u.type === 'content')     content.push(u.contentKey);
    }
  }
  return { frames, packs, content };
}

export const useUserStore = create<UserStore>((set, get) => ({
  ...DEFAULT_PROFILE,
  leaderboard: [],
  myRank: null,
  isLoadingLeaderboard: false,
  unlockedRewards: [],
  newRewards: [],
  isOnline: false,
  isLoaded: false,

  load: async () => {
    try {
      const [profileJ, rewardsJ] = await Promise.all([
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(REWARDS_KEY),
      ]);
      const profile: UserProfile = profileJ ? JSON.parse(profileJ) : DEFAULT_PROFILE;
      const unlockedRewards: string[] = rewardsJ ? JSON.parse(rewardsJ) : [];
      set({ ...profile, unlockedRewards, isLoaded: true });

      if (SUPABASE_CONFIGURED && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({ authId: session.user.id, isOnline: true } as any);
        }
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  setupProfile: async ({ username, displayName, avatarEmoji, countryFlag, bio }) => {
    // Validate username uniqueness on Supabase if available
    if (SUPABASE_CONFIGURED && supabase) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase().trim())
        .maybeSingle();
      if (existing) return 'Username already taken';

      // Anonymous auth
      let authId = get().authId;
      if (!authId) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.user) return 'Could not connect to server';
        authId = data.user.id;
      }

      // Insert profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .insert({
          auth_id:      authId,
          username:     username.toLowerCase().trim(),
          display_name: displayName.trim() || username.trim(),
          avatar_emoji: avatarEmoji,
          country_flag: countryFlag,
          bio:          bio.trim(),
          profile_frame: 'default',
        })
        .select()
        .single();
      if (profileErr) return profileErr.message;

      const update: Partial<UserProfile> = {
        profileId: profile.id, authId,
        username: profile.username, displayName: profile.display_name,
        avatarEmoji, countryFlag, bio, isSetup: true,
      };
      set({ ...update, isOnline: true } as any);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...get(), ...update }));
      return null;
    }

    // Offline mode
    const update: Partial<UserProfile> = {
      username: username.trim(), displayName: displayName.trim() || username.trim(),
      avatarEmoji, countryFlag, bio, isSetup: true,
    };
    set(update);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...get(), ...update }));
    return null;
  },

  updateProfile: async (data) => {
    set(data as any);
    const full = { ...get(), ...data };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(full));

    if (SUPABASE_CONFIGURED && supabase && get().profileId) {
      await supabase.from('profiles').update({
        display_name:  data.displayName,
        avatar_emoji:  data.avatarEmoji,
        country_flag:  data.countryFlag,
        bio:           data.bio,
        profile_frame: data.profileFrame,
      }).eq('id', get().profileId!);
    }
  },

  syncScore: async (stats) => {
    if (!SUPABASE_CONFIGURED || !supabase || !get().profileId) return;
    await supabase.from('scores').upsert({
      profile_id:        get().profileId,
      xp:                stats.xp,
      streak:            stats.streak,
      words_mastered:    stats.wordsMastered,
      lessons_completed: stats.lessonsCompleted,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'profile_id' });
  },

  fetchLeaderboard: async () => {
    if (!SUPABASE_CONFIGURED || !supabase) return;
    set({ isLoadingLeaderboard: true });
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('rank')
      .limit(100);

    if (data) {
      const entries: LeaderboardEntry[] = data.map(r => ({
        rank:          r.rank,
        profileId:     r.profile_id,
        username:      r.username,
        displayName:   r.display_name,
        avatarEmoji:   r.avatar_emoji,
        countryFlag:   r.country_flag,
        profileFrame:  r.profile_frame,
        xp:            r.xp,
        streak:        r.streak,
        wordsMastered: r.words_mastered,
      }));
      const myId = get().profileId;
      const myEntry = myId ? entries.find(e => e.profileId === myId) : null;
      set({ leaderboard: entries, myRank: myEntry?.rank ?? null });
    }
    set({ isLoadingLeaderboard: false });
  },

  checkRewards: (stats) => {
    const { unlockedRewards } = get();
    const newlyUnlocked: string[] = [];
    for (const r of REWARDS) {
      if (!unlockedRewards.includes(r.id) && r.condition(stats)) {
        newlyUnlocked.push(r.id);
      }
    }
    if (newlyUnlocked.length > 0) {
      const updated = [...unlockedRewards, ...newlyUnlocked];
      set({ unlockedRewards: updated, newRewards: newlyUnlocked });
      AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
    }
  },

  clearNewRewards: () => set({ newRewards: [] }),

  getUnlockedAvatars: () => {
    const { packs } = computeUnlocks(get().unlockedRewards);
    return packs.flatMap(p => AVATAR_PACKS[p]);
  },

  getUnlockedFrames: () => {
    return computeUnlocks(get().unlockedRewards).frames;
  },

  getUnlockedContent: () => {
    return computeUnlocks(get().unlockedRewards).content;
  },
}));
