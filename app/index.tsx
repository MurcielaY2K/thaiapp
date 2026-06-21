import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSrsStore } from '../store/srsStore';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';
import { STRIPE_SUCCESS_PARAM } from '../constants/stripe';
import BottomTabBar, { TabId } from '../components/BottomTabBar';
import LearnTab from '../components/tabs/LearnTab';
import PracticeTab from '../components/tabs/PracticeTab';
import DatabaseTab from '../components/tabs/DatabaseTab';
import ProfileTab from '../components/tabs/ProfileTab';

function consumeStripeSuccess(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get(STRIPE_SUCCESS_PARAM) === '1') {
    // Remove the param so a reload doesn't re-trigger
    const clean = window.location.pathname;
    window.history.replaceState({}, '', clean);
    return true;
  }
  return false;
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const { load: loadSrs } = useSrsStore();
  const { load: loadProgress, unlockPremium, isLoaded } = useProgressStore();

  useEffect(() => {
    loadSrs();
    loadProgress();
  }, []);

  // Stripe payment redirect: ?payment_success=1
  useEffect(() => {
    if (!isLoaded) return;
    if (consumeStripeSuccess()) {
      unlockPremium();
      setActiveTab('profile'); // show the user their new premium status
    }
  }, [isLoaded]);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {activeTab === 'learn'    && <LearnTab />}
        {activeTab === 'practice' && <PracticeTab />}
        {activeTab === 'database' && <DatabaseTab />}
        {activeTab === 'profile'  && <ProfileTab />}
      </View>
      <BottomTabBar active={activeTab} onPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1 },
});
