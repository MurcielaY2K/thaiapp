import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';

export default function XPBar() {
  const { dailyXp, dailyGoal } = useProgressStore();
  const pct = Math.min(1, dailyGoal > 0 ? dailyXp.earned / dailyGoal : 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>🎯 Daily goal</Text>
        <Text style={styles.count}>{dailyXp.earned} / {dailyGoal} XP</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
  count: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  track: {
    height: 10, borderRadius: 5, backgroundColor: Colors.border, overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 5 },
});
