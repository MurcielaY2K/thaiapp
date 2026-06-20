import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { CHAR_GROUPS, type CharType } from '../data/alphabet';
import { Colors } from '../constants/colors';
import TraceCanvas from '../components/TraceCanvas';
import StrokeAnimation from '../components/StrokeAnimation';

type Mode = 'watch' | 'trace';

// Vertical space the controls below the canvas need (tools row / toolbar).
const CONTROLS_RESERVE = 76;
const MAX_CANVAS = 420;

export default function WriteScreen() {
  const { writing, markWritten } = useSrsStore();
  const [groupKey, setGroupKey] = useState<CharType>('consonant');
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('watch');
  const [area, setArea] = useState({ w: 0, h: 0 });

  const group = useMemo(
    () => CHAR_GROUPS.find(g => g.key === groupKey)!,
    [groupKey]
  );
  const chars  = group.chars;
  const char   = chars[index];
  const practiced = writing[char.id] ?? 0;

  const switchGroup = (key: CharType) => {
    setGroupKey(key);
    setIndex(0);
    setMode('watch');
  };

  const prev = () => {
    setIndex(i => (i - 1 + chars.length) % chars.length);
    setMode('watch');
  };

  const next = () => {
    if (mode === 'trace') markWritten(char.id);
    setIndex(i => (i + 1) % chars.length);
    setMode('watch');
  };

  const learnedInGroup = chars.filter(c => writing[c.id]).length;

  const onAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: Math.round(width), h: Math.round(height) });
  };

  // Square canvas that fits the available area with room for the controls.
  const canvasSize = area.h > 0
    ? Math.min(area.w, area.h - CONTROLS_RESERVE, MAX_CANVAS)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.close} onPress={() => router.replace('/')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>{index + 1} / {chars.length}</Text>
        <Text style={styles.learned}>✓ {learnedInGroup}</Text>
      </View>

      {/* Category tabs */}
      <View style={styles.tabs}>
        {CHAR_GROUPS.map(g => (
          <TouchableOpacity
            key={g.key}
            style={[styles.tab, g.key === groupKey && styles.tabActive]}
            onPress={() => switchGroup(g.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, g.key === groupKey && styles.tabTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Character name + meta */}
      <View style={styles.header}>
        <Text style={styles.charName}>{char.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{char.sound}</Text>
          </View>
          <Text style={styles.meaning}>{char.meaning}</Text>
          {practiced > 0 && (
            <Text style={styles.practicedBadge}>✓ {practiced}×</Text>
          )}
        </View>
      </View>

      {/* Mode toggle: Watch / Trace */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'watch' && styles.modeTabActive]}
          onPress={() => setMode('watch')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeTabText, mode === 'watch' && styles.modeTabTextActive]}>
            ▶  Watch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'trace' && styles.modeTabActive]}
          onPress={() => setMode('trace')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeTabText, mode === 'trace' && styles.modeTabTextActive]}>
            ✍  Trace
          </Text>
        </TouchableOpacity>
      </View>

      {/* Flexible canvas area — sized to fit, never scrolls */}
      <View style={styles.canvasArea} onLayout={onAreaLayout}>
        {canvasSize > 0 && (
          mode === 'watch' ? (
            <StrokeAnimation key={`${char.id}-watch`} charId={char.id} char={char.char} size={canvasSize} />
          ) : (
            <TraceCanvas key={`${char.id}-trace`} char={char.char} size={canvasSize} />
          )
        )}
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.prevBtn} onPress={prev} activeOpacity={0.8}>
          <Text style={styles.prevText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {mode === 'trace' ? 'Got it  →' : 'Next  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  close: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  closeText: { color: Colors.textDim, fontSize: 16 },
  counter: { color: Colors.textDim, fontSize: 15, letterSpacing: 1 },
  learned: { color: Colors.correct, fontSize: 15, fontWeight: '600', width: 46, textAlign: 'right' },

  tabs: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, marginTop: 12,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: 'rgba(255,159,67,0.14)', borderColor: Colors.accent },
  tabText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.accent },

  header: { alignItems: 'center', paddingTop: 12 },
  charName: {
    color: Colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6,
  },
  chip: {
    backgroundColor: Colors.card, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { color: Colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  meaning: { color: Colors.textDim, fontSize: 14, fontStyle: 'italic' },
  practicedBadge: { color: Colors.correct, fontSize: 13, fontWeight: '600' },

  modeTabs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginHorizontal: 24,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
  },
  modeTabActive: { backgroundColor: Colors.bg },
  modeTabText: { color: Colors.textDim, fontSize: 14, fontWeight: '600' },
  modeTabTextActive: { color: Colors.text },

  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  nav: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8,
  },
  prevBtn: {
    width: 60, borderRadius: 16, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  prevText: { color: Colors.textDim, fontSize: 20 },
  nextBtn: {
    flex: 1, borderRadius: 16, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  nextText: { color: Colors.bg, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
