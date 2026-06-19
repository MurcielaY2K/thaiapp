import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,
  Animated, Easing, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { ALL_CHARS } from '../data/alphabet';
import { Colors } from '../constants/colors';
import PixelSprite from '../components/PixelSprite';
import { SPRITES } from '../data/sprites';

const SCREEN_W = Dimensions.get('window').width;

export default function HomeScreen() {
  const { load, isLoading, startSession, getStats, writing } = useSrsStore();

  // Gentle mascot bob
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
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

  const stats = getStats();
  const sessionSize = Math.min(20, stats.dueToday + stats.newWords);
  const hasSession = sessionSize > 0;
  const charsLearned = ALL_CHARS.filter(c => writing[c.id]).length;

  const handleStudy = () => {
    startSession();
    router.push('/session');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Animated.View style={{ transform: [{ translateY: bob }] }}>
            <PixelSprite sprite={hasSession ? SPRITES.naga : SPRITES.nagaSleep} size={92} />
          </Animated.View>
          <Text style={styles.title}>ภาษาไทย</Text>
          <Text style={styles.subtitle}>THAI</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox
            value={stats.dueToday}
            label="due"
            color={stats.dueToday > 0 ? Colors.accent : Colors.textDim}
          />
          <View style={styles.statDivider} />
          <StatBox value={stats.mastered} label="mastered" color={Colors.correct} />
          <View style={styles.statDivider} />
          <StatBox value={charsLearned} label="written" color={Colors.text} />
        </View>

        <View style={styles.modes}>
          {/* Study words */}
          <TouchableOpacity
            style={[styles.mode, styles.modePrimary, !hasSession && styles.modeDone]}
            onPress={handleStudy}
            disabled={!hasSession}
            activeOpacity={0.85}
          >
            <Text style={styles.modeIcon}>📖</Text>
            <View style={styles.modeTextWrap}>
              <Text style={[styles.modeTitle, !hasSession && styles.modeTitleDone]}>
                {hasSession ? 'Study words' : 'All caught up'}
              </Text>
              <Text style={[styles.modeSub, !hasSession && styles.modeSubDone]}>
                {hasSession
                  ? `${sessionSize} words · tap the meaning`
                  : 'No words due — come back later'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Write alphabet */}
          <TouchableOpacity
            style={[styles.mode, styles.modeSecondary]}
            onPress={() => router.push('/write')}
            activeOpacity={0.85}
          >
            <Text style={styles.modeIcon}>✍️</Text>
            <View style={styles.modeTextWrap}>
              <Text style={[styles.modeTitle, styles.modeTitleDone]}>Write alphabet</Text>
              <Text style={[styles.modeSub, styles.modeSubDone]}>
                Trace characters · {charsLearned}/{ALL_CHARS.length} practiced
              </Text>
            </View>
          </TouchableOpacity>

          {/* Read stories */}
          <TouchableOpacity
            style={[styles.mode, styles.modeSecondary]}
            onPress={() => router.push('/read')}
            activeOpacity={0.85}
          >
            <Text style={styles.modeIcon}>📜</Text>
            <View style={styles.modeTextWrap}>
              <Text style={[styles.modeTitle, styles.modeTitleDone]}>Read stories</Text>
              <Text style={[styles.modeSub, styles.modeSubDone]}>
                Illustrated scenes · tap words to hear them
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Decorative Thai skyline */}
        <View style={styles.scene} pointerEvents="none">
          <View style={styles.mountains}>
            <PixelSprite sprite={SPRITES.mountains} size={SCREEN_W} opacity={0.28} />
          </View>
          <View style={styles.skyline}>
            <PixelSprite sprite={SPRITES.palm} size={42} opacity={0.85} />
            <PixelSprite sprite={SPRITES.temple} size={96} opacity={0.9} />
            <PixelSprite sprite={SPRITES.chedi} size={54} opacity={0.9} />
            <PixelSprite sprite={SPRITES.lotus} size={40} opacity={0.85} />
          </View>
        </View>

      </View>
    </SafeAreaView>
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    position: 'relative',
  },
  header: { alignItems: 'center', gap: 4 },
  title: { color: Colors.text, fontSize: 50, fontWeight: '200', letterSpacing: 4, marginTop: 8 },
  subtitle: { color: Colors.textDim, fontSize: 13, letterSpacing: 8 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 28,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { color: Colors.textDim, fontSize: 12, letterSpacing: 1.5 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  modes: { gap: 14, marginTop: 22 },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  modePrimary: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modeSecondary: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeDone: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  modeIcon: { fontSize: 30 },
  modeTextWrap: { flex: 1, gap: 4 },
  modeTitle: { color: Colors.bg, fontSize: 19, fontWeight: '700' },
  modeTitleDone: { color: Colors.text },
  modeSub: { color: 'rgba(13,13,26,0.7)', fontSize: 13 },
  modeSubDone: { color: Colors.textDim },

  scene: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mountains: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 6,
  },
});
