import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSrsStore } from '../../store/srsStore';
import { ALL_CHARS } from '../../data/alphabet';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

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
          <StatBox
            value={stats.dueToday}
            label="due"
            color={stats.dueToday > 0 ? Colors.peach : Colors.textDim}
          />
          <View style={styles.divider} />
          <StatBox value={stats.mastered} label="mastered" color={Colors.mint} />
          <View style={styles.divider} />
          <StatBox value={charsLearned} label="written" color={Colors.lavender} />
        </View>

        <View style={styles.cards}>
          <PracticeCard
            color={hasSession ? Colors.teal : Colors.textMuted}
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
            color={Colors.lavender}
            icon="✍️"
            title="Write Alphabet"
            sub={`Trace Thai characters · ${charsLearned}/${ALL_CHARS.length} practiced`}
            onPress={() => router.push('/write')}
          />
          <PracticeCard
            color={Colors.mint}
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
      style={[
        styles.card,
        { borderLeftColor: color, backgroundColor: color + '10' },
        Platform.OS === 'web' && !disabled ? {
          boxShadow: `2px 0 0 0 ${color} inset, 0 2px 12px ${color}18`,
        } as any : {},
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
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
        <Text style={[styles.chevron, { color: disabled ? Colors.textMuted : color }]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color, fontFamily: Fonts.hud }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 20, gap: 0 },

  heading: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Fonts.display,
    fontWeight: '700',
    marginBottom: 4,
  },
  sub: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, marginBottom: 20 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    marginBottom: 20,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 26 },
  statLabel: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.hud, letterSpacing: 1 },
  divider: { width: 1, height: 32, backgroundColor: Colors.borderGlow },

  cards: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  cardIcon: { width: 46, height: 46, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 22 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.body, fontWeight: '700' },
  cardTitleDim: { color: Colors.textDim },
  cardSub: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.body, lineHeight: 17 },
  chevron: { fontSize: 26 },
  badge: { borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: Colors.bg, fontSize: 10, fontFamily: Fonts.hud, fontWeight: '700' },
});
