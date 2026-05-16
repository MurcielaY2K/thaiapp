import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { QuestBoardEntry } from '@engine/GameFacade';
import { GameRegion, REGIONS } from '@engine/types';

const REGION_ORDER: GameRegion[] = [
  'krung_thon',
  'paa_isaan',
  'doi_nuea',
  'talee_tong',
  'mueang_hin',
  'wang_loi_faa',
  'daen_winyaan',
];

const STATUS_SORT: Record<string, number> = {
  active: 0,
  available: 1,
  completed: 2,
  locked: 3,
};

export function QuestBoardScreen() {
  const { facade, profile, refreshStats } = useGame();
  const [boards, setBoards] = useState<Partial<Record<GameRegion, QuestBoardEntry[]>>>({});

  useFocusEffect(
    useCallback(() => {
      if (!facade || !profile) return;
      const next: Partial<Record<GameRegion, QuestBoardEntry[]>> = {};
      for (const region of profile.unlockedRegions) {
        next[region] = facade
          .getQuestBoard(region)
          .sort((a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]);
      }
      setBoards(next);
    }, [facade, profile]),
  );

  if (!profile) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.pageTitle}>Quest Board</Text>

      {REGION_ORDER.filter(r => profile.unlockedRegions.includes(r)).map(region => {
        const entries = boards[region] ?? [];
        const regionConfig = REGIONS[region];
        const regionColor = colors.region[region] ?? colors.primary;
        const completedCount = entries.filter(e => e.status === 'completed').length;

        return (
          <View key={region} style={styles.regionSection}>
            <View style={[styles.regionHeader, { borderLeftColor: regionColor }]}>
              <View>
                <Text style={styles.regionThai}>{regionConfig.nameThai}</Text>
                <Text style={[styles.regionEn, { color: regionColor }]}>
                  {regionConfig.nameEnglish}
                </Text>
              </View>
              <Text style={styles.regionProgress}>
                {completedCount}/{entries.length}
              </Text>
            </View>

            {entries.map(entry => (
              <QuestRow key={entry.quest.id} entry={entry} regionColor={regionColor} />
            ))}
          </View>
        );
      })}

      {/* Locked regions */}
      {REGION_ORDER.filter(r => !profile.unlockedRegions.includes(r)).slice(0, 3).map(region => {
        const regionConfig = REGIONS[region];
        return (
          <View key={region} style={styles.lockedRegion}>
            <Text style={styles.lockIcon}>🔒</Text>
            <View>
              <Text style={styles.lockedName}>{regionConfig.nameEnglish}</Text>
              <Text style={styles.lockedHint}>
                Level {regionConfig.minLevelRequired} required
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function QuestRow({
  entry,
  regionColor,
}: {
  entry: QuestBoardEntry;
  regionColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { quest, status, progress, progressPercent } = entry;

  const statusIcon =
    status === 'completed' ? '✅' :
    status === 'active'    ? '⚔️' :
    status === 'available' ? '📜' : '🔒';

  const statusColor =
    status === 'completed' ? colors.success :
    status === 'active'    ? regionColor :
    status === 'available' ? colors.textSecondary : colors.textMuted;

  return (
    <TouchableOpacity
      style={[styles.questCard, status === 'locked' && styles.questLocked]}
      onPress={() => status !== 'locked' && setExpanded(e => !e)}
      activeOpacity={status === 'locked' ? 1 : 0.75}
    >
      <View style={styles.questHeader}>
        <Text style={styles.questIcon}>{statusIcon}</Text>
        <View style={styles.questInfo}>
          <Text style={[styles.questTitle, { color: status === 'locked' ? colors.textMuted : colors.textPrimary }]}>
            {quest.title}
          </Text>
          <Text style={[styles.questStatus, { color: statusColor }]}>
            {status.toUpperCase()}
            {quest.type === 'boss' ? ' • BOSS' : quest.type === 'daily' ? ' • DAILY' : ''}
          </Text>
        </View>
        {status === 'active' && (
          <Text style={styles.expandChevron}>{expanded ? '▲' : '▼'}</Text>
        )}
      </View>

      {status === 'active' && (
        <ProgressBar
          value={progressPercent / 100}
          color={regionColor}
          height={4}
          bgColor={colors.surfaceHigh}
        />
      )}

      {expanded && status === 'active' && (
        <View style={styles.expandedBody}>
          <Text style={styles.questDesc}>{quest.description}</Text>
          <Text style={styles.questFlavor}>{quest.flavorText}</Text>

          {quest.objectives.map((obj, i) => {
            const objProgress = progress?.objectives[i];
            const current = objProgress?.current ?? 0;
            const pct = Math.min(1, current / obj.count);
            return (
              <View key={i} style={styles.objective}>
                <View style={styles.objectiveHeader}>
                  <Text style={styles.objectiveDesc}>{obj.description}</Text>
                  <Text style={[styles.objectiveCount, { color: regionColor }]}>
                    {current}/{obj.count}
                  </Text>
                </View>
                <ProgressBar value={pct} color={regionColor} height={3} bgColor={colors.surfaceHigh} />
              </View>
            );
          })}

          <View style={styles.rewards}>
            <Text style={styles.rewardLabel}>Rewards: </Text>
            <Text style={styles.rewardValue}>
              ✨ {quest.rewards.xp} XP
              {quest.rewards.gold ? `  🪙 ${quest.rewards.gold}` : ''}
              {quest.rewards.gems ? `  💎 ${quest.rewards.gems}` : ''}
              {quest.rewards.companionId ? '  🐾 Companion!' : ''}
            </Text>
          </View>
        </View>
      )}

      {status === 'available' && (
        <Text style={styles.availableHint}>Available — auto-accepted ✓</Text>
      )}

      {status === 'completed' && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>
            ✨ {quest.rewards.xp} XP earned
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  regionSection: { marginBottom: spacing.xl },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
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
  regionProgress: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  questCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  questLocked: { opacity: 0.45 },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  questIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  questInfo: { flex: 1 },
  questTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  questStatus: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  expandChevron: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  expandedBody: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  questDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  questFlavor: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  objective: { gap: 4 },
  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectiveDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  objectiveCount: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  rewardLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rewardValue: {
    fontSize: fontSize.xs,
    color: colors.gold,
    fontWeight: '600',
  },
  availableHint: {
    fontSize: fontSize.xs,
    color: colors.success,
  },
  completedBadge: {},
  completedText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
  },
  lockedRegion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockIcon: { fontSize: 24 },
  lockedName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  lockedHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
