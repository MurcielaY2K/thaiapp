import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { REGIONS } from '@engine/types';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

const XP_PER_LEVEL = 500;

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, stats, refreshStats } = useGame();

  useFocusEffect(useCallback(() => { refreshStats(); }, [refreshStats]));

  if (!profile || !stats) return null;

  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const levelProgress = levelXP / XP_PER_LEVEL;

  const primaryRegion = profile.unlockedRegions[profile.unlockedRegions.length - 1] ?? 'krung_thon';
  const regionConfig = REGIONS[primaryRegion];
  const regionColor = colors.region[primaryRegion] ?? colors.primary;

  const canStudy = stats.dueToday > 0 || stats.newAvailable > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refreshStats}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>สวัสดี, {profile.name}!</Text>
          <Text style={styles.subGreeting}>Keep the streak alive</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakCount}>{profile.currentStreak}</Text>
        </View>
      </View>

      {/* XP / Level bar */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Level {profile.currentLevel}</Text>
          <Text style={styles.levelXP}>{levelXP} / {XP_PER_LEVEL} XP</Text>
        </View>
        <ProgressBar value={levelProgress} color={colors.gold} height={8} />
        <Text style={styles.totalXP}>{profile.totalXP.toLocaleString()} total XP</Text>
      </View>

      {/* Region banner */}
      <View style={[styles.regionBanner, { borderLeftColor: regionColor }]}>
        <Text style={styles.regionThai}>{regionConfig.nameThai}</Text>
        <Text style={[styles.regionEn, { color: regionColor }]}>{regionConfig.nameEnglish}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          label="Due Today"
          value={stats.dueToday}
          accent={stats.dueToday > 0 ? colors.warning : colors.textMuted}
          icon="📋"
        />
        <View style={styles.statGap} />
        <StatCard
          label="New Words"
          value={stats.newAvailable}
          accent={colors.success}
          icon="✨"
        />
        <View style={styles.statGap} />
        <StatCard
          label="Mastered"
          value={stats.masteredCards}
          accent={colors.gold}
          icon="⭐"
        />
      </View>

      {/* Active quests */}
      {profile.activeQuestIds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Quests</Text>
          {profile.activeQuestIds.slice(0, 2).map(qid => (
            <ActiveQuestRow key={qid} questId={qid} regionColor={regionColor} />
          ))}
        </View>
      )}

      {/* Study button */}
      <TouchableOpacity
        style={[styles.studyButton, !canStudy && styles.studyButtonDim]}
        onPress={() => navigation.navigate('Study')}
        activeOpacity={0.85}
        disabled={!canStudy}
      >
        <Text style={styles.studyButtonText}>
          {canStudy
            ? `Study Now  •  ~${stats.estimatedMinutes} min`
            : 'All caught up! Come back tomorrow 🎉'
          }
        </Text>
      </TouchableOpacity>

      {/* Bottom stats */}
      <View style={styles.bottomStats}>
        <Text style={styles.bottomStat}>
          📚 {stats.totalCards} cards unlocked
        </Text>
        {stats.strugglingCards > 0 && (
          <Text style={[styles.bottomStat, { color: colors.warning }]}>
            ⚠️ {stats.strugglingCards} struggling
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function ActiveQuestRow({ questId, regionColor }: { questId: string; regionColor: string }) {
  const label = questId.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '');
  return (
    <View style={[styles.questRow, { borderLeftColor: regionColor }]}>
      <Text style={styles.questIcon}>⚔️</Text>
      <Text style={styles.questLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakFire: { fontSize: 18 },
  streakCount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.gold,
  },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  levelXP: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalXP: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  regionBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  regionThai: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  regionEn: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statGap: { width: spacing.sm },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  questIcon: { fontSize: 16 },
  questLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  studyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  studyButtonDim: {
    backgroundColor: colors.surfaceHigh,
  },
  studyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  bottomStat: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
