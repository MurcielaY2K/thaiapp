import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

export default function XPBar() {
  const { dailyXp, dailyGoal } = useProgressStore();
  const pct = Math.min(1, dailyGoal > 0 ? dailyXp.earned / dailyGoal : 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>⚡ Daily XP</Text>
        <Text style={styles.count}>{dailyXp.earned} / {dailyGoal}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.hud },
  count: { color: Colors.xp, fontSize: 11, fontFamily: Fonts.hud },
  track: {
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.xp,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 6px rgba(167,139,250,0.6)' } as any : {}),
  },
});
