import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  ActivityIndicator, Animated, Easing, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { ALL_CHARS } from '../data/alphabet';
import { Colors } from '../constants/colors';
import PixelSprite from '../components/PixelSprite';
import { SPRITES } from '../data/sprites';

const SCREEN_W = Dimensions.get('window').width;

export default function HomeScreen() {
  const { load, isLoading, startSession, getStats, writing, streak } = useSrsStore();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -7, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0,  duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bob]);

  useEffect(() => { load(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const stats      = getStats();
  const sessionSize = Math.min(20, stats.dueToday + stats.newWords);
  const hasSession  = sessionSize > 0;
  const charsLearned = ALL_CHARS.filter(c => writing[c.id]).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ translateY: bob }] }}>
            <PixelSprite sprite={hasSession ? SPRITES.naga : SPRITES.nagaSleep} size={76} />
          </Animated.View>
          <Text style={styles.title}>ภาษาไทย</Text>
          <Text style={styles.subtitle}>T H A I</Text>
        </View>

        {/* ── Streak banner ──────────────────────────────────────── */}
        {streak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        )}

        {/* ── Stats ──────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatBox
            value={stats.dueToday}
            label="due"
            color={stats.dueToday > 0 ? Colors.accent : Colors.textDim}
          />
          <View style={styles.statDivider} />
          <StatBox value={stats.mastered} label="mastered" color={Colors.correct} />
          <View style={styles.statDivider} />
          <StatBox value={charsLearned}   label="written"  color={Colors.text} />
        </View>

        {/* ── Mode cards ─────────────────────────────────────────── */}
        <View style={styles.modes}>
          <ModeCard
            color={hasSession ? '#ff9f43' : '#3d3d55'}
            icon="📖"
            title={hasSession ? 'Study words' : 'All caught up'}
            sub={hasSession
              ? `${sessionSize} words · tap the meaning`
              : 'No words due · come back later'}
            onPress={() => { startSession(); router.push('/session'); }}
            disabled={!hasSession}
          />
          <ModeCard
            color="#a78bfa"
            icon="✍️"
            title="Write alphabet"
            sub={`Trace characters · ${charsLearned}/${ALL_CHARS.length} practiced`}
            onPress={() => router.push('/write')}
          />
          <ModeCard
            color="#34d399"
            icon="📜"
            title="Read & phrases"
            sub="Illustrated stories · phrases by category"
            onPress={() => router.push('/read')}
          />
        </View>

        {/* ── Pixel-art scene (in-flow, never overlaps buttons) ──── */}
        <View style={styles.sceneWrap} pointerEvents="none">
          <View style={styles.mountainsLayer}>
            <PixelSprite sprite={SPRITES.mountains} size={SCREEN_W} opacity={0.22} />
          </View>
          <View style={styles.skylineLayer}>
            <PixelSprite sprite={SPRITES.palm}   size={36} opacity={0.85} />
            <PixelSprite sprite={SPRITES.temple} size={80} opacity={0.9}  />
            <PixelSprite sprite={SPRITES.chedi}  size={46} opacity={0.9}  />
            <PixelSprite sprite={SPRITES.lotus}  size={34} opacity={0.85} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ModeCard({
  color, icon, title, sub, onPress, disabled,
}: {
  color: string; icon: string; title: string; sub: string;
  onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color, backgroundColor: color + '12' }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View style={[styles.cardIconBox, { backgroundColor: color + '28' }]}>
        <Text style={styles.cardIconText}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, disabled && styles.cardTitleDim]}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <Text style={[styles.cardChevron, { color: disabled ? Colors.textDim : color }]}>›</Text>
    </TouchableOpacity>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  safe:    { flex: 1, backgroundColor: Colors.bg },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
  },

  // ── Hero ──────────────────────────────────────────────────────────
  hero: { alignItems: 'center', gap: 2, marginBottom: 22 },
  title: {
    color: Colors.text,
    fontSize: 44,
    fontWeight: '200',
    letterSpacing: 4,
    marginTop: 8,
  },
  subtitle: { color: Colors.textDim, fontSize: 11, letterSpacing: 7 },

  // ── Streak ───────────────────────────────────────────────────────
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,159,67,0.10)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,159,67,0.35)',
    marginBottom: 12,
  },
  streakFire:  { fontSize: 22 },
  streakCount: { color: Colors.accent, fontSize: 26, fontWeight: '700' },
  streakLabel: { color: Colors.textDim, fontSize: 13, letterSpacing: 0.5 },

  // ── Stats ─────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  statBox:    { flex: 1, alignItems: 'center', gap: 6 },
  statValue:  { fontSize: 26, fontWeight: '700' },
  statLabel:  { color: Colors.textDim, fontSize: 11, letterSpacing: 1.5 },
  statDivider:{ width: 1, height: 32, backgroundColor: Colors.border },

  // ── Mode cards ────────────────────────────────────────────────────
  modes: { gap: 10, marginBottom: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  cardIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIconText:  { fontSize: 22 },
  cardBody:      { flex: 1, gap: 3 },
  cardTitle:     { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cardTitleDim:  { color: Colors.textDim },
  cardSub:       { color: Colors.textDim, fontSize: 12, lineHeight: 17 },
  cardChevron:   { fontSize: 26, fontWeight: '200' },

  // ── Pixel-art decorative scene ────────────────────────────────────
  sceneWrap: {
    height: 86,
    marginHorizontal: -24,   // bleed to screen edges
    overflow: 'hidden',
  },
  mountainsLayer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  skylineLayer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 4,
  },
});
