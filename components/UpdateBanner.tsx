import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { BUILD_ID } from '../constants/version';

// Detects new deploys while the app is open. Every build embeds its BUILD_ID
// and ships a version.json next to the bundle; when the served buildId stops
// matching ours, a newer version is live. Checked on launch, whenever the app
// returns to the foreground, and every few minutes — so after a deploy every
// user is prompted within minutes, without ever interrupting mid-exercise
// (refresh only happens when they tap UPDATE).

const CHECK_MS = 5 * 60 * 1000;
const VERSION_URL = '/thaiapp/version.json';

export default function UpdateBanner() {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let stopped = false;

    const check = async () => {
      try {
        const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const j = await res.json();
        if (!stopped && j?.buildId && j.buildId !== BUILD_ID) setAvailable(true);
      } catch {
        // Offline — try again on the next tick.
      }
    };

    check();
    const iv = setInterval(check, CHECK_MS);
    const onVis = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stopped = true;
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (!available || dismissed) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.emoji}>✨</Text>
        <View style={styles.textCol}>
          <Text style={styles.title}>Update ready!</Text>
          <Text style={styles.sub}>A new version of Sanuk Thai is available.</Text>
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => { if (typeof window !== 'undefined') window.location.reload(); }}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>UPDATE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.close} onPress={() => setDismissed(true)} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 84, zIndex: 999,
    alignItems: 'center', paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 2, borderColor: Colors.borderStrong,
    maxWidth: 420, width: '100%',
    ...(Platform.OS === 'web' ? { boxShadow: `0 4px 0 0 ${Colors.borderStrong}` } as any : {}),
  },
  emoji: { fontSize: 20 },
  textCol: { flex: 1, gap: 1 },
  title: { color: Colors.text, fontSize: 13, fontFamily: Fonts.display, fontWeight: '700' },
  sub: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.body },
  btn: {
    backgroundColor: Colors.ember, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 14,
    borderWidth: 2, borderColor: Colors.borderStrong,
  },
  btnText: { color: Colors.onBrand, fontSize: 11, fontFamily: Fonts.hud, fontWeight: '700', letterSpacing: 0.8 },
  close: { padding: 6 },
  closeText: { color: Colors.textDim, fontSize: 14 },
});
