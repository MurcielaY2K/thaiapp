import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { ProgressBar } from '../components/ProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export function SessionCompleteScreen({ navigation, route }: Props) {
  const { summary, xpGained, completedQuestIds } = route.params;

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const accuracy = Math.round(summary.accuracy * 100);

  const label =
    summary.perfectSession
      ? '🏆 Perfect Session!'
      : xpGained >= 200
      ? '⭐ Great Work!'
      : '✅ Session Complete';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      bounces={false}
    >
      {/* Trophy animation */}
      <Animated.View
        style={[styles.trophyArea, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}
      >
        <Text style={styles.trophyEmoji}>
          {summary.perfectSession ? '🏆' : '⭐'}
        </Text>
        <Text style={styles.trophyLabel}>{label}</Text>
      </Animated.View>

      {/* XP gained */}
      <Animated.View style={[styles.xpBanner, { opacity: fadeAnim }]}>
        <Text style={styles.xpAmount}>+{xpGained} XP</Text>
        <Text style={styles.xpLabel}>Experience gained</Text>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatItem label="Cards Reviewed" value={summary.cardsReviewed} icon="📋" />
        <StatItem label="New Words" value={summary.newWordsLearned} icon="✨" accent={colors.success} />
        <StatItem
          label="Accuracy"
          value={`${Math.min(100, accuracy)}%`}
          icon="🎯"
          accent={accuracy >= 80 ? colors.success : colors.warning}
        />
        <StatItem
          label="Session"
          value={`${Math.round(summary.sessionDurationSec / 60)}m`}
          icon="⏱️"
        />
      </View>

      {/* Completed quests */}
      {completedQuestIds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quests Completed!</Text>
          {completedQuestIds.map(qid => (
            <View key={qid} style={styles.questComplete}>
              <Text style={styles.questCompleteIcon}>🎊</Text>
              <Text style={styles.questCompleteName}>
                {qid.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.replace('Study')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Study Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StatItem({
  label,
  value,
  icon,
  accent = colors.gold,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  trophyArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  trophyEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  trophyLabel: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  xpBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gold,
    width: '100%',
  },
  xpAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.gold,
  },
  xpLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.xl,
  },
  statItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  questComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  questCompleteIcon: { fontSize: 20 },
  questCompleteName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  buttonArea: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});
