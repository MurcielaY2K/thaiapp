import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import SanukSprite, { SanukSpriteName } from './SanukSprite';

export type TabId = 'learn' | 'practice' | 'database' | 'ranking' | 'profile';

interface TabDef {
  id: TabId;
  icon: SanukSpriteName;
  label: string;
  glow: string;
  glowColor: string;
}

const TABS: TabDef[] = [
  { id: 'learn',    icon: 'lotus',  label: 'LEARN',    glow: 'mint',     glowColor: Colors.mint },
  { id: 'practice', icon: 'pencil', label: 'PRACTICE', glow: 'ember',    glowColor: Colors.ember },
  { id: 'database', icon: 'book',   label: 'WORDS',    glow: 'cyan',     glowColor: Colors.cyan },
  { id: 'ranking',  icon: 'crown',  label: 'RANKING',  glow: 'gold',     glowColor: Colors.gold },
  { id: 'profile',  icon: 'ghost',  label: 'PROFILE',  glow: 'lavender', glowColor: Colors.lavender },
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
        const indicatorGlow = Platform.OS === 'web'
          ? { boxShadow: `0 0 8px ${tab.glowColor}cc` } as any
          : {};
        const labelColor = isActive ? tab.glowColor : Colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onPress(tab.id)}
            activeOpacity={0.7}
          >
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: tab.glowColor }, indicatorGlow]} />
            )}
            <View style={[styles.iconWrap, isActive && {
              opacity: 1,
              ...(Platform.OS === 'web' ? {
                filter: `drop-shadow(0 0 6px ${tab.glowColor}99)`,
              } as any : {}),
            }, !isActive && styles.iconDim]}>
              <SanukSprite name={tab.icon} size={22} />
            </View>
            <Text style={[styles.label, { color: labelColor }]}>{tab.label}</Text>
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
    borderTopWidth: 2,
    borderTopColor: Colors.borderStrong,
    paddingBottom: 20,
    paddingTop: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -4px 16px rgba(23,21,15,0.08)' } as any : {}),
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, position: 'relative', paddingTop: 6 },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 2,
    borderRadius: 1,
  },
  iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconDim: { opacity: 0.4 },
  label: {
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 0.8,
  },
});
