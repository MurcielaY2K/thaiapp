import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

export type TabId = 'learn' | 'practice' | 'database' | 'ranking' | 'profile';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'learn',    icon: '🌿', label: 'Learn' },
  { id: 'practice', icon: '✍️', label: 'Practice' },
  { id: 'database', icon: '📚', label: 'Words' },
  { id: 'ranking',  icon: '👑', label: 'Ranking' },
  { id: 'profile',  icon: '👻', label: 'Profile' },
];

interface Props {
  active: TabId;
  onPress: (id: TabId) => void;
}

export default function BottomTabBar({ active, onPress }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onPress(tab.id)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.indicator} />}
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGlow,
    paddingBottom: 20,
    paddingTop: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -4px 20px rgba(196,181,244,0.08)' } as any : {}),
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, position: 'relative', paddingTop: 6 },
  icon: { fontSize: 20, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: {
    color: Colors.textDim,
    fontSize: 10,
    fontFamily: Fonts.hud,
    letterSpacing: 0.5,
  },
  labelActive: { color: Colors.lavender },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 2,
    backgroundColor: Colors.lavender,
    borderRadius: 1,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(196,181,244,0.8)' } as any : {}),
  },
});
