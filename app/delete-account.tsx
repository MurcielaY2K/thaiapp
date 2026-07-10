import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '../store/userStore';
import { useProgressStore } from '../store/progressStore';
import { useSrsStore } from '../store/srsStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

// Public account-deletion page. App stores require a deletion path that is
// reachable from a plain URL (Google Play "data deletion" link) as well as
// from inside the app, so this screen must work standalone.
export default function DeleteAccount() {
  const { isSetup, username, authId, deleteAccount } = useUserStore();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  const runDelete = async () => {
    setBusy(true); setMsg('');
    const err = await deleteAccount();
    if (err) { setMsg(err); setBusy(false); setConfirming(false); return; }
    // Storage is wiped — re-hydrate the other stores so in-memory state
    // matches (fresh defaults), then show the confirmation.
    await Promise.all([useProgressStore.getState().load(), useSrsStore.getState().load()]);
    setBusy(false);
    setDone(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Delete Account & Data</Text>

        {done ? (
          <>
            <Text style={styles.para}>
              ✅ Done. Your account and data have been deleted. Thanks for learning Thai with us — สวัสดีครับ 👋
            </Text>
            <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
              <Text style={styles.homeBtnText}>Back to start</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.para}>
              This permanently deletes everything we have about you. It cannot be undone.
            </Text>

            <Text style={styles.heading}>What gets deleted</Text>
            <Text style={styles.bullet}>• Your profile (username, display name, bio, avatar, flag)</Text>
            <Text style={styles.bullet}>• Your leaderboard entry and scores</Text>
            <Text style={styles.bullet}>• Your cloud progress backup and linked email</Text>
            <Text style={styles.bullet}>• Your subscription record on our side</Text>
            <Text style={styles.bullet}>• All learning progress stored on this device</Text>

            <Text style={styles.heading}>Before you go</Text>
            <Text style={styles.para}>
              ⚠️ If you have an active Premium subscription, cancel it first — deleting your
              account does not stop billing by itself. Web (Stripe) subscribers: use the manage
              link in your Stripe receipt email, or email us. App Store / Google Play
              subscribers: cancel in your store's subscription settings.
            </Text>

            {isSetup || authId ? (
              <>
                {confirming ? (
                  <>
                    <Text style={styles.confirmText}>
                      Really delete{username ? ` @${username}` : ''} and all data? This is permanent.
                    </Text>
                    <TouchableOpacity style={styles.dangerBtn} onPress={runDelete} disabled={busy}>
                      {busy
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.dangerBtnText}>Yes, delete everything</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirming(false)} disabled={busy}>
                      <Text style={styles.cancelBtnText}>Keep my account</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.dangerBtn} onPress={() => setConfirming(true)}>
                    <Text style={styles.dangerBtnText}>Delete my account & data</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.para}>
                No profile is signed in on this device. Open this page from the device where you
                use the app (Profile → Delete account), or email us from your linked address and
                we will delete your account for you.
              </Text>
            )}

            {msg ? <Text style={styles.errText}>{msg}</Text> : null}

            <Text style={styles.footer}>
              Prefer email? Write to coficollective@gmail.com and we will delete your account
              within 30 days. Deletion of our server records is immediate when done in-app.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: Colors.bgInset, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.borderStrong,
  },
  backText: { color: Colors.text, fontSize: 13, fontFamily: Fonts.hud },
  content: { padding: 20, paddingBottom: 60, maxWidth: 640, alignSelf: 'center', width: '100%' },
  title: { color: Colors.text, fontSize: 24, fontFamily: Fonts.display, fontWeight: '700', marginBottom: 14 },
  heading: { color: Colors.text, fontSize: 15, fontFamily: Fonts.display, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  para: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, lineHeight: 20, marginBottom: 8 },
  bullet: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, lineHeight: 22 },
  confirmText: { color: Colors.text, fontSize: 14, fontFamily: Fonts.body, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  dangerBtn: {
    backgroundColor: '#c0392b', borderRadius: 8, paddingVertical: 13, alignItems: 'center',
    marginTop: 14, borderWidth: 2, borderColor: Colors.borderStrong,
  },
  dangerBtnText: { color: '#fff', fontSize: 13, fontFamily: Fonts.hud, fontWeight: '700', letterSpacing: 0.5 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.hud },
  homeBtn: {
    backgroundColor: Colors.bgInset, borderRadius: 8, paddingVertical: 12, alignItems: 'center',
    marginTop: 16, borderWidth: 1, borderColor: Colors.borderStrong,
  },
  homeBtnText: { color: Colors.text, fontSize: 13, fontFamily: Fonts.hud },
  errText: { color: '#c0392b', fontSize: 13, fontFamily: Fonts.body, marginTop: 12 },
  footer: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.body, lineHeight: 17, marginTop: 24, opacity: 0.8 },
});
