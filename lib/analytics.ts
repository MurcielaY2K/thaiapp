// Minimal, privacy-respecting product analytics into our own Supabase
// (supabase/analytics.sql). No PII, no third-party trackers: an anonymous
// per-device uuid + a small allowlisted event set, batched every few seconds.
// Fire-and-forget: failures are silently dropped, never block the UI.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { SUPABASE_CONFIGURED } from '../constants/supabase';

export type AnalyticsEvent =
  | 'app_open' | 'level_picked' | 'lesson_start' | 'lesson_complete'
  | 'lesson_fail' | 'profile_created' | 'email_linked'
  | 'paywall_view' | 'checkout_click';

const DEVICE_KEY = '@thaiapp_device_id';
let deviceId: string | null = null;
let queue: { device_id: string; event: string; props: Record<string, unknown> }[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`.padEnd(36, '0').slice(0, 36);
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  deviceId = id;
  return id;
}

async function flush() {
  flushTimer = null;
  if (!SUPABASE_CONFIGURED || !supabase || queue.length === 0) return;
  const batch = queue.splice(0, 20);
  try {
    await supabase.from('analytics_events').insert(batch);
  } catch {
    // Dropped on the floor by design — analytics must never hurt the app.
  }
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  if (!SUPABASE_CONFIGURED) return;
  getDeviceId()
    .then(id => {
      queue.push({ device_id: id, event, props });
      if (!flushTimer) flushTimer = setTimeout(flush, 4000);
    })
    .catch(() => {});
}
