import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export type TabId = 'learn' | 'practice' | 'database' | 'ranking' | 'profile';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'learn',    icon: '🌍', label: 'Learn' },
  { id: 'practice', icon: '✍️', label: 'Practice' },
  { id: 'database', icon: '📚', label: 'Words' },
  { id: 'ranking',  icon: '🏆', label: 'Ranking' },
  { id: 'profile',  icon: '👤', label: 'Profile' },
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
            <Text style={styles.icon}>{tab.icon}</Text>
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
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, position: 'relative', paddingTop: 4 },
  icon: { fontSize: 20 },
  label: { color: Colors.textDim, fontSize: 10, fontWeight: '600' },
  labelActive: { color: Colors.accent },
  indicator: {
    position: 'absolute',
    top: 0, width: 28, height: 3,
    backgroundColor: Colors.accent, borderRadius: 2,
  },
});
