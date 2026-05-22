import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { useAchievementStore } from '../../store/achievementStore';
import { PixelPet } from '../../components/pixel/PixelPet';
import { PixelText } from '../../components/pixel/PixelText';
import { StatsBar } from '../../components/care/StatsBar';
import { Colors } from '../../constants/colors';
import { EVOLUTION_STAGES, PERSONALITY_TRAITS, ROOM_THEMES } from '../../constants/petData';

type Tab = 'overview' | 'achievements' | 'history';

const CATEGORY_LABELS = {
  care: { label: 'Care', emoji: '💕', color: Colors.neon.pink },
  games: { label: 'Games', emoji: '🎮', color: Colors.neon.cyan },
  social: { label: 'Social', emoji: '👥', color: Colors.neon.purple },
  evolution: { label: 'Evolution', emoji: '✨', color: Colors.neon.yellow },
  secret: { label: 'Secret', emoji: '🔮', color: Colors.neon.green },
};

export default function ProfileScreen() {
  const { pet, coins, gems } = usePetStore();
  const { getAllAchievements, stats, unlocked } = useAchievementStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  if (!pet) return null;

  const allAchievements = getAllAchievements();
  const filteredAch = filterCategory
    ? allAchievements.filter(a => a.category === filterCategory)
    : allAchievements;

  const evolution = EVOLUTION_STAGES[pet.evolutionStage];
  const trait = PERSONALITY_TRAITS[pet.personality];
  const room = ROOM_THEMES[pet.roomTheme];
  const daysSince = Math.floor((Date.now() - pet.createdAt) / 86400000);
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const completionPct = Math.round((unlockedCount / allAchievements.length) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Pet card header */}
      <View style={styles.petCard}>
        <PixelPet pet={pet} size={80} />
        <View style={styles.petInfo}>
          <PixelText variant="title" size={18} color={Colors.ui.textBright}>{pet.name}</PixelText>
          <PixelText size={11} color={Colors.neon.yellow}>
            {evolution.emoji} {evolution.name}  •  Lv.{pet.stats.level}
          </PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>
            {trait.emoji} {pet.personality}  •  {pet.species}
          </PixelText>
          <View style={styles.currencyRow}>
            <PixelText size={11} color={Colors.neon.yellow}>🪙 {coins}</PixelText>
            <PixelText size={11} color={Colors.neon.cyan}>💎 {gems}</PixelText>
            <PixelText size={11} color={Colors.ui.textDim}>📅 Day {daysSince + 1}</PixelText>
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(['overview', 'achievements', 'history'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <PixelText size={10} color={tab === t ? Colors.neon.pink : Colors.ui.textDim} style={{ letterSpacing: 1 }}>
              {t.toUpperCase()}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          <View style={styles.section}>
            {/* XP progress */}
            <View style={styles.card}>
              <PixelText variant="label">Experience</PixelText>
              <StatsBar
                label="XP Progress"
                emoji="⭐"
                value={pet.stats.xp % 100}
                color={Colors.ui.xp}
                maxValue={100}
              />
              <PixelText size={11} color={Colors.ui.textDim}>
                Total XP: {pet.stats.xp}  •  Next level at {(pet.stats.level) * 100} XP
              </PixelText>
            </View>

            {/* Current stats */}
            <View style={styles.card}>
              <PixelText variant="label">Vitals</PixelText>
              <StatsBar label="Happiness" emoji="😊" value={pet.stats.happiness} color={Colors.stat.happiness} />
              <StatsBar label="Energy" emoji="⚡" value={pet.stats.energy} color={Colors.stat.energy} />
              <StatsBar label="Hunger" emoji="🍖" value={100 - pet.stats.hunger} color={Colors.stat.hunger} />
              <StatsBar label="Hygiene" emoji="🛁" value={pet.stats.hygiene} color={Colors.stat.hygiene} />
              <StatsBar label="Affection" emoji="💕" value={pet.stats.affection} color={Colors.stat.affection} />
            </View>

            {/* Lifetime stats */}
            <View style={styles.card}>
              <PixelText variant="label">Lifetime Stats</PixelText>
              {[
                ['🤝', 'Care Actions', pet.totalCareActions],
                ['🎮', 'Games Played', stats.totalGamesPlayed],
                ['🏆', 'Best Treat Score', stats.bestTreatScore],
                ['🏎️', 'Best Race Score', stats.bestRaceScore],
                ['🎣', 'Best Fish Coins', stats.bestFishCoins],
                ['💃', 'Best Dance Score', stats.bestDanceScore],
                ['⚡', 'Best Rush Score', stats.bestRushScore],
              ].map(([emoji, label, value]) => (
                <View key={label as string} style={styles.statRow}>
                  <PixelText size={14}>{emoji}</PixelText>
                  <PixelText size={12} color={Colors.ui.textDim} style={{ flex: 1 }}>{label}</PixelText>
                  <PixelText size={12} color={Colors.neon.cyan}>{value}</PixelText>
                </View>
              ))}
            </View>

            {/* Room & style */}
            <View style={styles.card}>
              <PixelText variant="label">Current Setup</PixelText>
              <View style={styles.statRow}>
                <PixelText size={18}>{room.emoji}</PixelText>
                <PixelText size={12} color={Colors.ui.text}>{room.name}</PixelText>
              </View>
              <View style={styles.statRow}>
                <PixelText size={18}>🎨</PixelText>
                <PixelText size={12} color={Colors.ui.text}>{pet.pixelStyle} style</PixelText>
              </View>
              <View style={styles.statRow}>
                <PixelText size={18}>👒</PixelText>
                <PixelText size={12} color={Colors.ui.text}>
                  {pet.accessories.length > 0 ? pet.accessories.join(', ') : 'No accessories'}
                </PixelText>
              </View>
            </View>
          </View>
        )}

        {tab === 'achievements' && (
          <View style={styles.section}>
            {/* Completion bar */}
            <View style={styles.completionCard}>
              <PixelText size={13} color={Colors.neon.yellow}>
                🏆  {unlockedCount} / {allAchievements.length} Unlocked  ({completionPct}%)
              </PixelText>
              <View style={styles.completionTrack}>
                <View style={[styles.completionFill, { width: `${completionPct}%` }]} />
              </View>
            </View>

            {/* Category filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
                onPress={() => setFilterCategory(null)}
              >
                <PixelText size={10} color={!filterCategory ? Colors.neon.pink : Colors.ui.textDim}>ALL</PixelText>
              </TouchableOpacity>
              {Object.entries(CATEGORY_LABELS).map(([key, { label, emoji, color }]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, filterCategory === key && { borderColor: color }]}
                  onPress={() => setFilterCategory(filterCategory === key ? null : key)}
                >
                  <PixelText size={10} color={filterCategory === key ? color : Colors.ui.textDim}>
                    {emoji} {label}
                  </PixelText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Achievement list */}
            {filteredAch.map(ach => (
              <View
                key={ach.id}
                style={[
                  styles.achCard,
                  ach.unlocked && { borderColor: CATEGORY_LABELS[ach.category].color, opacity: 1 },
                  !ach.unlocked && styles.achLocked,
                ]}
              >
                <PixelText size={28} style={!ach.unlocked ? styles.achEmojiLocked : undefined}>
                  {ach.unlocked ? ach.emoji : '🔒'}
                </PixelText>
                <View style={{ flex: 1, gap: 3 }}>
                  <PixelText size={13} color={ach.unlocked ? Colors.ui.textBright : Colors.ui.textDim}>
                    {ach.title}
                  </PixelText>
                  <PixelText size={10} color={Colors.ui.textDim}>
                    {ach.unlocked ? ach.description : ach.category === 'secret' ? '???' : ach.description}
                  </PixelText>
                </View>
                {ach.unlocked && (
                  <View style={[styles.categoryBadge, { borderColor: CATEGORY_LABELS[ach.category].color }]}>
                    <PixelText size={9} color={CATEGORY_LABELS[ach.category].color}>
                      {CATEGORY_LABELS[ach.category].emoji}
                    </PixelText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {tab === 'history' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <PixelText variant="label">Evolution Timeline</PixelText>
              {Object.entries(EVOLUTION_STAGES).map(([key, data]) => {
                const isReached = Object.keys(EVOLUTION_STAGES).indexOf(key) <=
                  Object.keys(EVOLUTION_STAGES).indexOf(pet.evolutionStage);
                return (
                  <View key={key} style={styles.timelineRow}>
                    <PixelText size={20} style={!isReached ? { opacity: 0.3 } : undefined}>{data.emoji}</PixelText>
                    <View style={styles.timelineLine} />
                    <View style={{ flex: 1 }}>
                      <PixelText size={12} color={isReached ? Colors.ui.textBright : Colors.ui.textDim}>
                        {data.name}
                      </PixelText>
                      <PixelText size={10} color={Colors.ui.textDim}>
                        {isReached ? data.description : `Requires ${data.minXp} XP`}
                      </PixelText>
                    </View>
                    {isReached && <PixelText size={14} color={Colors.neon.green}>✓</PixelText>}
                  </View>
                );
              })}
            </View>

            <View style={styles.card}>
              <PixelText variant="label">Pet Bio</PixelText>
              <PixelText size={12} color={Colors.ui.textDim} style={{ lineHeight: 20 }}>
                {pet.name} is a {pet.personality} {pet.species} who was born {daysSince} day{daysSince !== 1 ? 's' : ''} ago.{'\n\n'}
                {trait.description}.{'\n\n'}
                They have received {pet.totalCareActions} care actions and are currently a {evolution.name}.
              </PixelText>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.bg.card,
  },
  petInfo: { flex: 1, gap: 4 },
  currencyRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.neon.pink },
  section: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 14,
    gap: 8,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  completionCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neon.yellow,
    padding: 14,
    gap: 10,
  },
  completionTrack: {
    height: 8,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: Colors.neon.yellow,
    borderRadius: 4,
  },
  filterRow: { marginBottom: 4 },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: Colors.bg.card,
  },
  filterChipActive: { borderColor: Colors.neon.pink },
  achCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 12,
  },
  achLocked: { opacity: 0.45 },
  achEmojiLocked: { opacity: 0.5 },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  timelineLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.ui.border,
  },
});
