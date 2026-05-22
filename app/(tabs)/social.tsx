import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { PixelText } from '../../components/pixel/PixelText';
import { Colors } from '../../constants/colors';
import { EVOLUTION_STAGES } from '../../constants/petData';
import type { Friend } from '../../types';

const MOCK_FRIENDS: Friend[] = [
  { id: '1', username: 'PixelPawz', petName: 'Mochi', petSpecies: 'cat', evolutionStage: 'adult', level: 14, lastSeen: Date.now() - 300000 },
  { id: '2', username: 'RetroTails', petName: 'Biscuit', petSpecies: 'dog', evolutionStage: 'teen', level: 8, lastSeen: Date.now() - 3600000 },
  { id: '3', username: 'NeonPets99', petName: 'Kiwi', petSpecies: 'bird', evolutionStage: 'legend', level: 32, lastSeen: Date.now() - 86400000 },
  { id: '4', username: 'ChibiWorld', petName: 'Dumpling', petSpecies: 'rabbit', evolutionStage: 'child', level: 4, lastSeen: Date.now() - 120000 },
  { id: '5', username: 'GremlinLvr', petName: 'Chaos', petSpecies: 'other', evolutionStage: 'teen', level: 11, lastSeen: Date.now() - 7200000 },
];

const LEADERBOARD = [
  { rank: 1, username: 'NeonPets99', petName: 'Kiwi', score: 9842, emoji: '👑' },
  { rank: 2, username: 'PixelLegend', petName: 'Shadow', score: 8431, emoji: '🥈' },
  { rank: 3, username: 'RetroGamer', petName: 'Pixel', score: 7230, emoji: '🥉' },
  { rank: 4, username: 'CuteChaos', petName: 'Wobble', score: 6120, emoji: '⭐' },
  { rank: 5, username: 'You', petName: '—', score: 0, emoji: '🎮' },
];

const DAILY_CHALLENGES = [
  { id: 'c1', title: 'Feed your pet 3 times', emoji: '🍖', reward: 50, current: 0, goal: 3, done: false },
  { id: 'c2', title: 'Play a mini game', emoji: '🎮', reward: 30, current: 0, goal: 1, done: false },
  { id: 'c3', title: 'Give 5 hugs', emoji: '🤗', reward: 20, current: 2, goal: 5, done: false },
  { id: 'c4', title: 'Reach 90% happiness', emoji: '😊', reward: 75, current: 0, goal: 1, done: false },
];

type Tab = 'friends' | 'leaderboard' | 'challenges';

export default function SocialScreen() {
  const { pet } = usePetStore();
  const [tab, setTab] = useState<Tab>('friends');

  if (!pet) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PixelText variant="title" size={18} color={Colors.neon.purple} glow>👥  SOCIAL</PixelText>
      </View>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(['friends', 'leaderboard', 'challenges'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <PixelText size={11} color={tab === t ? Colors.neon.purple : Colors.ui.textDim} style={{ letterSpacing: 1 }}>
              {t.toUpperCase()}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'friends' && (
          <View style={styles.section}>
            <View style={styles.myPetCard}>
              <PixelText size={18}>🐾</PixelText>
              <View>
                <PixelText size={13} color={Colors.ui.textBright}>{pet.name}</PixelText>
                <PixelText size={10} color={Colors.ui.textDim}>
                  {EVOLUTION_STAGES[pet.evolutionStage].emoji} Lv.{pet.stats.level}  •  Share code: PG-{pet.id.slice(-4).toUpperCase()}
                </PixelText>
              </View>
            </View>
            {MOCK_FRIENDS.map(friend => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </View>
        )}

        {tab === 'leaderboard' && (
          <View style={styles.section}>
            <PixelText size={12} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
              Weekly Happiness Score
            </PixelText>
            {LEADERBOARD.map(entry => (
              <View
                key={entry.rank}
                style={[
                  styles.leaderRow,
                  entry.rank === 1 && { borderColor: Colors.neon.yellow },
                ]}
              >
                <PixelText size={20}>{entry.emoji}</PixelText>
                <PixelText size={12} color={Colors.ui.textDim} style={{ width: 20 }}>{entry.rank}</PixelText>
                <View style={{ flex: 1 }}>
                  <PixelText size={13} color={Colors.ui.textBright}>{entry.username}</PixelText>
                  <PixelText size={10} color={Colors.ui.textDim}>{entry.petName}</PixelText>
                </View>
                <PixelText size={13} color={Colors.neon.yellow}>{entry.score.toLocaleString()}</PixelText>
              </View>
            ))}
          </View>
        )}

        {tab === 'challenges' && (
          <View style={styles.section}>
            <PixelText size={12} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
              Daily Challenges  •  Resets in 14h 22m
            </PixelText>
            {DAILY_CHALLENGES.map(challenge => (
              <View key={challenge.id} style={[styles.challengeCard, challenge.done && styles.challengeDone]}>
                <PixelText size={24}>{challenge.emoji}</PixelText>
                <View style={{ flex: 1, gap: 4 }}>
                  <PixelText size={13} color={challenge.done ? Colors.ui.textDim : Colors.ui.textBright}>
                    {challenge.title}
                  </PixelText>
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[
                        styles.progressFill,
                        { width: `${(challenge.current / challenge.goal) * 100}%` }
                      ]} />
                    </View>
                    <PixelText size={10} color={Colors.ui.textDim}>
                      {challenge.current}/{challenge.goal}
                    </PixelText>
                  </View>
                </View>
                <View style={styles.rewardBadge}>
                  <PixelText size={10} color={Colors.neon.yellow}>+{challenge.reward}</PixelText>
                  <PixelText size={10}>🪙</PixelText>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const evolution = EVOLUTION_STAGES[friend.evolutionStage];
  const minutesAgo = Math.floor((Date.now() - friend.lastSeen) / 60000);
  const lastSeenLabel = minutesAgo < 60
    ? `${minutesAgo}m ago`
    : minutesAgo < 1440
    ? `${Math.floor(minutesAgo / 60)}h ago`
    : `${Math.floor(minutesAgo / 1440)}d ago`;

  return (
    <TouchableOpacity style={styles.friendCard} onPress={() => Haptics.selectionAsync()}>
      <View style={styles.petAvatar}>
        <PixelText size={28}>{evolution.emoji}</PixelText>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.friendNameRow}>
          <PixelText size={13} color={Colors.ui.textBright}>{friend.petName}</PixelText>
          <PixelText size={10} color={Colors.neon.purple}>@{friend.username}</PixelText>
        </View>
        <PixelText size={10} color={Colors.ui.textDim}>
          {evolution.name}  •  Lv.{friend.level}  •  {lastSeenLabel}
        </PixelText>
      </View>
      <PixelText size={18} color={Colors.ui.border}>›</PixelText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.neon.purple,
  },
  section: {
    padding: 16,
    gap: 10,
  },
  myPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neon.purple,
    padding: 12,
    marginBottom: 4,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 12,
  },
  petAvatar: {
    width: 48,
    height: 48,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendNameRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 10,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 12,
  },
  challengeDone: {
    opacity: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bg.mid,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neon.purple,
    borderRadius: 2,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.neon.yellow,
  },
});
