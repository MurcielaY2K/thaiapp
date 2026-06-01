import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../store/srsStore';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const { load, isLoading, startSession, getStats } = useSrsStore();

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

  const handleStart = () => {
    startSession();
    router.push('/session');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
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
          <StatBox value={stats.newWords} label="new" color={Colors.textDim} />
          <View style={styles.statDivider} />
          <StatBox value={stats.mastered} label="mastered" color={Colors.correct} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((stats.total - stats.newWords) / stats.total) * 100}%` as any },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {stats.total - stats.newWords} / {stats.total} words seen
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, !hasSession && styles.startBtnDone]}
          onPress={handleStart}
          disabled={!hasSession}
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnText, !hasSession && styles.startBtnTextDone]}>
            {hasSession ? `Study  ·  ${sessionSize} words` : '✓  All done for today'}
          </Text>
        </TouchableOpacity>

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
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', gap: 6 },
  title: { color: Colors.text, fontSize: 54, fontWeight: '200', letterSpacing: 4 },
  subtitle: { color: Colors.textDim, fontSize: 13, letterSpacing: 8 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 34, fontWeight: '700' },
  statLabel: { color: Colors.textDim, fontSize: 12, letterSpacing: 1.5 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  progressSection: { gap: 10 },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressLabel: {
    color: Colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnDone: {
    backgroundColor: Colors.card,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  startBtnText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startBtnTextDone: {
    color: Colors.textDim,
  },
});
