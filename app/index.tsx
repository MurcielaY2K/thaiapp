import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSrsStore } from '../store/srsStore';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';
import BottomTabBar, { TabId } from '../components/BottomTabBar';
import LearnTab from '../components/tabs/LearnTab';
import PracticeTab from '../components/tabs/PracticeTab';
import DatabaseTab from '../components/tabs/DatabaseTab';
import ProfileTab from '../components/tabs/ProfileTab';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const { load: loadSrs } = useSrsStore();
  const { load: loadProgress } = useProgressStore();

  useEffect(() => {
    loadSrs();
    loadProgress();
  }, []);

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
