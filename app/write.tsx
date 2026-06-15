import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { CHAR_GROUPS, type CharType } from '../data/alphabet';
import { Colors } from '../constants/colors';
import TraceCanvas from '../components/TraceCanvas';
import StrokeAnimation from '../components/StrokeAnimation';

type Mode = 'watch' | 'trace';

export default function WriteScreen() {
  const { writing, markWritten } = useSrsStore();
  const [groupKey, setGroupKey] = useState<CharType>('consonant');
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('watch');

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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Character name + meta */}
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

        {/* Content area: animation OR tracing canvas */}
        <View style={styles.canvasWrap}>
          {mode === 'watch' ? (
            // key forces remount (fresh animation) when character or mode changes
            <StrokeAnimation key={`${char.id}-watch`} charId={char.id} char={char.char} />
          ) : (
            <TraceCanvas key={`${char.id}-trace`} char={char.char} />
          )}
        </View>

        <Text style={styles.hint}>
          {mode === 'watch'
            ? 'Orange ink shows each stroke in order'
            : 'Trace over the ghost guide with your finger'}
        </Text>
      </ScrollView>

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
    paddingHorizontal: 20, marginTop: 14,
  },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: 'rgba(255,159,67,0.14)', borderColor: Colors.accent },
  tabText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.accent },

  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 8,
    alignItems: 'center',
  },

  charName: {
    color: Colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 16,
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
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTab: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
  },
  modeTabActive: { backgroundColor: Colors.bg },
  modeTabText: { color: Colors.textDim, fontSize: 14, fontWeight: '600' },
  modeTabTextActive: { color: Colors.text },

  canvasWrap: { width: '100%', maxWidth: 380 },

  hint: {
    color: Colors.textDim, fontSize: 13, marginTop: 12,
    textAlign: 'center', letterSpacing: 0.3,
  },

  nav: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8,
  },
  prevBtn: {
    width: 60, borderRadius: 16, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 18,
  },
  prevText: { color: Colors.textDim, fontSize: 20 },
  nextBtn: {
    flex: 1, borderRadius: 16, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 18,
  },
  nextText: { color: Colors.bg, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
