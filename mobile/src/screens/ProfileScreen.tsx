import React, { useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

const XP_PER_LEVEL = 500;

export function ProfileScreen() {
  const { profile, stats, refreshStats, resetProgress } = useGame();

  useFocusEffect(useCallback(() => { refreshStats(); }, [refreshStats]));

  if (!profile || !stats) return null;

  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const levelProgress = levelXP / XP_PER_LEVEL;

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'This will delete all progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Avatar + name */}
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧭</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.levelBadge}>Level {profile.currentLevel} Traveler</Text>

        <View style={styles.levelBarArea}>
          <View style={styles.levelBarRow}>
            <Text style={styles.levelBarLabel}>XP to next level</Text>
            <Text style={styles.levelBarValue}>{levelXP} / {XP_PER_LEVEL}</Text>
          </View>
          <ProgressBar value={levelProgress} color={colors.gold} height={8} />
        </View>
      </View>

      {/* Main stats */}
      <View style={styles.statsGrid}>
        <BigStat label="Total XP" value={profile.totalXP.toLocaleString()} icon="✨" accent={colors.gold} />
        <BigStat label="Day Streak" value={profile.currentStreak} icon="🔥" accent={colors.warning} />
        <BigStat label="Words Learned" value={profile.totalWordsLearned} icon="📖" accent={colors.success} />
        <BigStat label="Cards Reviewed" value={profile.totalCardsReviewed} icon="📋" accent={colors.info} />
        <BigStat label="Mastered" value={stats.masteredCards} icon="⭐" accent={colors.gold} />
        <BigStat label="Struggling" value={stats.strugglingCards} icon="⚠️" accent={colors.warning} />
      </View>

      {/* Unlocked regions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Regions Unlocked</Text>
        {profile.unlockedRegions.map(region => {
          const regionColor = colors.region[region] ?? colors.primary;
          return (
            <View key={region} style={[styles.regionChip, { borderColor: regionColor }]}>
              <View style={[styles.regionDot, { backgroundColor: regionColor }]} />
              <Text style={[styles.regionChipText, { color: regionColor }]}>
                {region.replace(/_/g, ' ')}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Companions */}
      {profile.collectedCompanionIds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Companions</Text>
          <View style={styles.companionRow}>
            {profile.collectedCompanionIds.map((cid: string) => (
              <View key={cid} style={styles.companionBadge}>
                <Text style={styles.companionEmoji}>🐾</Text>
                <Text style={styles.companionName}>{cid}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent sessions */}
      {/* (session history could be added here) */}

      {/* Danger zone */}
      <View style={styles.dangerZone}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>Reset All Progress</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function BigStat({ label, value, icon, accent = colors.primary }: {
  label: string; value: string | number; icon: string; accent?: string;
}) {
  return (
    <View style={[styles.bigStat, { borderTopColor: accent }]}>
      <Text style={styles.bigStatIcon}>{icon}</Text>
      <Text style={[styles.bigStatValue, { color: accent }]}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarEmoji: { fontSize: 36 },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  levelBadge: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  levelBarArea: { width: '100%', gap: spacing.xs },
  levelBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBarLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  levelBarValue: { fontSize: fontSize.xs, color: colors.textSecondary },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  bigStat: {
    width: '30.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bigStatIcon: { fontSize: 20, marginBottom: 4 },
  bigStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  bigStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  regionDot: { width: 8, height: 8, borderRadius: 4 },
  regionChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  companionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  companionBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  companionEmoji: { fontSize: 24, marginBottom: 4 },
  companionName: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  dangerZone: {
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  resetButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
