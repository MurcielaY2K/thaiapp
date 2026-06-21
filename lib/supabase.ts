import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CONFIGURED } from '../constants/supabase';

const rnStorage = {
  getItem:    (key: string) => AsyncStorage.getItem(key),
  setItem:    (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: Platform.OS !== 'web' ? rnStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

export interface DbProfile {
  id: string;
  auth_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  country_flag: string;
  bio: string;
  profile_frame: string;
}

export interface DbLeaderboardEntry {
  profile_id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  country_flag: string;
  profile_frame: string;
  xp: number;
  streak: number;
  words_mastered: number;
  lessons_completed: number;
  rank: number;
}
