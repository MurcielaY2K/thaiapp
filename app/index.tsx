import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSrsStore } from '../store/srsStore';
import { useProgressStore } from '../store/progressStore';
import { useUserStore } from '../store/userStore';
import { Colors } from '../constants/colors';
import { STRIPE_SUCCESS_PARAM } from '../constants/stripe';
import BottomTabBar, { TabId } from '../components/BottomTabBar';
import LearnTab from '../components/tabs/LearnTab';
import PracticeTab from '../components/tabs/PracticeTab';
import DatabaseTab from '../components/tabs/DatabaseTab';
import LeaderboardTab from '../components/tabs/LeaderboardTab';
import ProfileTab from '../components/tabs/ProfileTab';
import RewardToast from '../components/RewardToast';
import { initProgressSync, restoreProfileFromCloud, pullAndMerge } from '../lib/progressSync';

function consumeStripeSuccess(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get(STRIPE_SUCCESS_PARAM) === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const { load: loadSrs, getStats, streak } = useSrsStore();
  const { load: loadProgress, refreshEntitlement, isLoaded: progressLoaded, xp } = useProgressStore();
  const { load: loadUser, isLoaded: userLoaded, checkRewards, syncScore, newRewards, clearNewRewards, profileId } = useUserStore();

  useEffect(() => {
    loadSrs();
    loadProgress();
    loadUser();
  }, []);

  // Cloud sync: once local state is hydrated and we have a session, restore
  // the profile (new device after magic-link sign-in), reconcile progress
  // with the cloud snapshot, then start the debounced auto-push.
  const authId = useUserStore(s => s.authId);
  const srsLoading = useSrsStore(s => s.isLoading);
  useEffect(() => {
    if (!progressLoaded || !userLoaded || srsLoading || !authId) return;
    (async () => {
      await restoreProfileFromCloud().catch(() => {});
      await pullAndMerge().catch(() => {});
      initProgressSync();
    })();
  }, [progressLoaded, userLoaded, srsLoading, authId]);

  // Premium entitlement — always verified against the server, never granted
  // from the URL. On return from Stripe the webhook may lag the redirect by
  // a few seconds, so re-check on a short backoff.
  useEffect(() => {
    if (!progressLoaded) return;
    refreshEntitlement();
    if (consumeStripeSuccess()) {
      setActiveTab('profile');
      for (const ms of [3000, 8000, 15000, 30000]) {
        setTimeout(() => { useProgressStore.getState().refreshEntitlement(); }, ms);
      }
    }
  }, [progressLoaded]);

  // Check and unlock rewards whenever XP or streak changes
  useEffect(() => {
    if (!progressLoaded || !userLoaded) return;
    const stats = getStats();
    const rewardStats = {
      xp,
      streak,
      wordsMastered: stats.mastered,
      lessonsCompleted: Object.values(useProgressStore.getState().lessonProgress).filter(s => s === 'complete').length,
    };
    checkRewards(rewardStats);

    // Sync score to Supabase whenever progress changes
    if (profileId) syncScore(rewardStats);
  }, [xp, streak, progressLoaded, userLoaded]);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {activeTab === 'learn'    && <LearnTab />}
        {activeTab === 'practice' && <PracticeTab />}
        {activeTab === 'database' && <DatabaseTab />}
        {activeTab === 'ranking'  && <LeaderboardTab />}
        {activeTab === 'profile'  && <ProfileTab />}
      </View>
      <BottomTabBar active={activeTab} onPress={setActiveTab} />

      {newRewards.length > 0 && (
        <RewardToast rewardIds={newRewards} onDone={clearNewRewards} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1 },
});
