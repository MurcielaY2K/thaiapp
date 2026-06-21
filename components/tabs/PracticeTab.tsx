import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../../store/srsStore';
import { ALL_CHARS } from '../../data/alphabet';
import { Colors } from '../../constants/colors';

export default function PracticeTab() {
  const { startSession, getStats, writing } = useSrsStore();
  const stats = getStats();
  const charsLearned = ALL_CHARS.filter(c => writing[c.id]).length;
  const sessionSize = Math.min(20, stats.dueToday + stats.newWords);
  const hasSession = sessionSize > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Practice</Text>
        <Text style={styles.sub}>Keep your Thai sharp</Text>

        <View style={styles.statsRow}>
          <StatBox value={stats.dueToday} label="due" color={stats.dueToday > 0 ? Colors.accent : Colors.textDim} />
          <View style={styles.divider} />
          <StatBox value={stats.mastered} label="mastered" color={Colors.correct} />
          <View style={styles.divider} />
          <StatBox value={charsLearned} label="written" color={Colors.text} />
        </View>

        <View style={styles.cards}>
          <PracticeCard
            color={hasSession ? '#ff9f43' : '#3d3d55'}
            icon="📖"
            title={hasSession ? 'SRS Flashcards' : 'All caught up!'}
            sub={hasSession
              ? `${sessionSize} words due · tap the meaning`
              : 'No words due right now · come back later'}
            badge={hasSession ? `${sessionSize} words` : undefined}
            onPress={() => { if (hasSession) { startSession(); router.push('/session'); } }}
            disabled={!hasSession}
          />
          <PracticeCard
            color="#a78bfa"
            icon="✍️"
            title="Write Alphabet"
            sub={`Trace Thai characters · ${charsLearned}/${ALL_CHARS.length} practiced`}
            onPress={() => router.push('/write')}
          />
          <PracticeCard
            color="#34d399"
            icon="📜"
            title="Read & Phrases"
            sub="Illustrated stories · 16 phrase categories"
            onPress={() => router.push('/read')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function PracticeCard({
  color, icon, title, sub, badge, onPress, disabled,
}: {
  color: string; icon: string; title: string; sub: string;
  badge?: string; onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color, backgroundColor: color + '12' }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '28' }]}>
        <Text style={styles.cardIconText}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, disabled && styles.cardTitleDim]}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {!badge && (
        <Text style={[styles.chevron, { color: disabled ? Colors.textDim : color }]}>›</Text>
      )}
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 20, gap: 0 },

  heading: { color: Colors.text, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { color: Colors.textDim, fontSize: 14, marginBottom: 20 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 26, fontWeight: '700' },
  statLabel: { color: Colors.textDim, fontSize: 11, letterSpacing: 1.5 },
  divider: { width: 1, height: 32, backgroundColor: Colors.border },

  cards: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  cardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 22 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cardTitleDim: { color: Colors.textDim },
  cardSub: { color: Colors.textDim, fontSize: 12, lineHeight: 17 },
  chevron: { fontSize: 26, fontWeight: '200' },
  badge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
