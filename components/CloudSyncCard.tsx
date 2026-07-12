import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { SUPABASE_CONFIGURED } from '../constants/supabase';
import { pushProgress, pullAndMerge, restoreProfileFromCloud, getSyncStatus, onSyncStatus, SyncStatus } from '../lib/progressSync';
import { useUserStore } from '../store/userStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

// window.location.origin already adapts to whatever domain is actually
// serving the app — only the subpath suffix needs the build-time constant
// (see scripts/build-web.sh: GitHub Pages subpath vs Cloudflare Pages root).
const BASE_PATH = process.env.EXPO_PUBLIC_BASE_PATH ?? '/sanuk-thai';

function redirectUrl(): string | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${BASE_PATH}/`;
  }
  return undefined;
}

export default function CloudSyncCard() {
  const { authId } = useUserStore();
  const [email, setEmail] = useState('');
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [sync, setSync] = useState<SyncStatus>(getSyncStatus());

  useEffect(() => onSyncStatus(setSync), []);

  useEffect(() => {
    if (!supabase || !authId) return;
    supabase.auth.getUser().then(({ data }) => {
      setLinkedEmail(data.user?.email ?? null);
    });
  }, [authId]);

  if (!SUPABASE_CONFIGURED || !supabase) return null;

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const linkEmail = async () => {
    if (!validEmail) { setMsg('Enter a valid email address'); return; }
    setBusy(true); setMsg('');
    const { error } = await supabase!.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: redirectUrl() },
    );
    setBusy(false);
    setMsg(error ? error.message : '📬 Check your inbox and confirm the link to finish.');
  };

  const sendMagicLink = async () => {
    if (!validEmail) { setMsg('Enter a valid email address'); return; }
    setBusy(true); setMsg('');
    const { error } = await supabase!.auth.signInWithOtp({
      email: email.trim(),
      // Restore flow only: the account must already exist (linked on the old
      // device). Without this, any typed address silently creates a fresh
      // empty account — confusing for typos, and an account-spam vector.
      options: { emailRedirectTo: redirectUrl(), shouldCreateUser: false },
    });
    setBusy(false);
    const friendly = error
      ? (/signup|not allowed|not found/i.test(error.message)
          ? 'No account found for that email. Link it from the app on your old device first.'
          : error.message)
      : '📬 Magic link sent — open it on this device to restore your progress.';
    setMsg(friendly);
  };

  const syncNow = async () => {
    setBusy(true); setMsg('');
    await restoreProfileFromCloud();
    const result = await pullAndMerge();
    const ok = result !== 'none' || await pushProgress();
    setBusy(false);
    setMsg(ok ? '✅ Synced' : 'Sync failed — try again later');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>☁️ Cloud Sync</Text>

      {authId ? (
        linkedEmail ? (
          <>
            <Text style={styles.body}>
              Progress backs up automatically to <Text style={styles.em}>{linkedEmail}</Text>.
              Sign in with this email on any device to restore it.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Add your email so you can recover your progress if you lose this device.
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.btn} onPress={linkEmail} disabled={busy}>
              {busy ? <ActivityIndicator color={Colors.bg} size="small" /> : <Text style={styles.btnText}>Link email</Text>}
            </TouchableOpacity>
          </>
        )
      ) : (
        <>
          <Text style={styles.body}>
            Already played on another device? Enter the email you linked there and
            we’ll send you a sign-in link.
          </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.btn} onPress={sendMagicLink} disabled={busy}>
            {busy ? <ActivityIndicator color={Colors.bg} size="small" /> : <Text style={styles.btnText}>Send magic link</Text>}
          </TouchableOpacity>
        </>
      )}

      {authId ? (
        <View style={styles.syncRow}>
          <TouchableOpacity style={styles.syncBtn} onPress={syncNow} disabled={busy}>
            <Text style={styles.syncBtnText}>{busy ? 'Syncing…' : 'Sync now'}</Text>
          </TouchableOpacity>
          <Text style={styles.syncMeta}>
            {sync.state === 'error'
              ? 'last sync failed'
              : sync.lastSyncedAt
                ? `synced ${new Date(sync.lastSyncedAt).toLocaleTimeString()}`
                : 'not synced yet'}
          </Text>
        </View>
      ) : null}

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 16, gap: 10,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  title: { color: Colors.text, fontSize: 15, fontFamily: Fonts.display, fontWeight: '700' },
  body: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.body, lineHeight: 18 },
  em: { color: Colors.mint },
  input: {
    backgroundColor: Colors.bg, borderRadius: 4, borderWidth: 1, borderColor: Colors.borderGlow,
    paddingHorizontal: 14, paddingVertical: 10, color: Colors.text,
    fontSize: 14, fontFamily: Fonts.body,
  },
  btn: { backgroundColor: Colors.ember, borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  btnText: { color: Colors.onBrand, fontSize: 12, fontFamily: Fonts.hud, fontWeight: '700', letterSpacing: 0.5 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  syncBtn: {
    backgroundColor: Colors.bgInset, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.borderStrong,
  },
  syncBtnText: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.hud },
  syncMeta: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.mono, opacity: 0.8 },
  msg: { color: Colors.mint, fontSize: 12, fontFamily: Fonts.body, lineHeight: 17 },
});
