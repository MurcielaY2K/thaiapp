import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { CHAR_GROUPS, type CharType } from '../data/alphabet';
import { Colors } from '../constants/colors';
import TraceCanvas from '../components/TraceCanvas';

export default function WriteScreen() {
  const { writing, markWritten } = useSrsStore();
  const [groupKey, setGroupKey] = useState<CharType>('consonant');
  const [index, setIndex] = useState(0);

  const group = useMemo(
    () => CHAR_GROUPS.find(g => g.key === groupKey)!,
    [groupKey]
  );
  const chars = group.chars;
  const char = chars[index];

  const switchGroup = (key: CharType) => {
    setGroupKey(key);
    setIndex(0);
  };

  const next = () => {
    markWritten(char.id);
    setIndex(i => (i + 1) % chars.length);
  };

  const prev = () => setIndex(i => (i - 1 + chars.length) % chars.length);

  const learnedInGroup = chars.filter(c => writing[c.id]).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.close} onPress={() => router.replace('/')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {index + 1} / {chars.length}
        </Text>
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
        {/* Character info */}
        <Text style={styles.name}>{char.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.soundChip}>
            <Text style={styles.soundText}>{char.sound}</Text>
          </View>
          <Text style={styles.meaning}>{char.meaning}</Text>
        </View>

        {/* Tracing canvas (remounts per char to clear ink) */}
        <View style={styles.canvasWrap}>
          <TraceCanvas key={char.id} char={char.char} />
        </View>

        <Text style={styles.hint}>Trace over the character</Text>
      </ScrollView>

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.prevBtn} onPress={prev} activeOpacity={0.8}>
          <Text style={styles.prevText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>Got it  →</Text>
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
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  closeText: { color: Colors.textDim, fontSize: 16 },
  counter: { color: Colors.textDim, fontSize: 15, letterSpacing: 1 },
  learned: { color: Colors.correct, fontSize: 15, fontWeight: '600', width: 40, textAlign: 'right' },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,159,67,0.14)',
    borderColor: Colors.accent,
  },
  tabText: { color: Colors.textDim, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.accent },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  name: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  soundChip: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  soundText: { color: Colors.accent, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  meaning: { color: Colors.textDim, fontSize: 15, fontStyle: 'italic' },
  canvasWrap: { width: '100%', maxWidth: 360 },
  hint: {
    color: Colors.textDim,
    fontSize: 14,
    marginTop: 18,
    letterSpacing: 0.5,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
  },
  prevBtn: {
    width: 60,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  prevText: { color: Colors.textDim, fontSize: 20 },
  nextBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  nextText: { color: Colors.bg, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
