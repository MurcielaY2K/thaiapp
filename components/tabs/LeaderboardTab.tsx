import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useUserStore, LeaderboardEntry } from '../../store/userStore';
import { Colors } from '../../constants/colors';
import PixelAvatar from '../PixelAvatar';
import { Fonts } from '../../constants/typography';
import { SUPABASE_CONFIGURED } from '../../constants/supabase';
import { FRAME_STYLES, FrameId } from '../../data/rewards';

const RANK_COLORS: Record<number, string> = {
  1: Colors.gold,
  2: '#9ca3af',
  3: '#cd7f32',
};

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank] ?? Colors.textDim;
  const label = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`;
  return (
    <View style={[styles.rankBadge, { borderColor: color + '50', backgroundColor: color + '10' }]}>
      <Text style={[styles.rankText, { color, fontFamily: Fonts.hud }]}>{label}</Text>
    </View>
  );
}

function EntryRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const frame = (entry.profileFrame ?? 'default') as FrameId;
  const { border } = FRAME_STYLES[frame];
  return (
    <View style={[
      styles.row,
      isMe && styles.rowMe,
      Platform.OS === 'web' && isMe ? {
        boxShadow: `0 0 12px rgba(196,181,244,0.15)`,
      } as any : {},
    ]}>
      <RankBadge rank={entry.rank} />
      <View style={[styles.avatar, { borderColor: border }]}>
        <PixelAvatar avatar={entry.avatarEmoji} size={24} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.displayName, isMe && styles.nameMe]} numberOfLines={1}>
            {entry.displayName || entry.username}
          </Text>
          <Text style={styles.flag}>{entry.countryFlag}</Text>
          {isMe && (
            <View style={styles.meBadge}>
              <Text style={styles.meBadgeText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>@{entry.username}</Text>
      </View>
      <View style={styles.scores}>
        <Text style={styles.xpScore}>{entry.xp.toLocaleString()} XP</Text>
        <Text style={styles.streakScore}>🔥 {entry.streak}</Text>
      </View>
    </View>
  );
}

export default function LeaderboardTab() {
  const { leaderboard, myRank, profileId, isLoadingLeaderboard, fetchLeaderboard, isSetup } = useUserStore();

  useEffect(() => {
    if (SUPABASE_CONFIGURED && isSetup) fetchLeaderboard();
  }, [isSetup]);

  if (!SUPABASE_CONFIGURED) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.offlineIcon}>🌐</Text>
          <Text style={styles.offlineTitle}>Connect to see rankings</Text>
          <Text style={styles.offlineSub}>
            Add your Supabase credentials in{'\n'}
            <Text style={styles.code}>constants/supabase.ts</Text>
            {'\n'}to enable global leaderboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSetup) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.offlineIcon}>👻</Text>
          <Text style={styles.offlineTitle}>Set up your profile first</Text>
          <Text style={styles.offlineSub}>
            Go to the Profile tab to create your username and appear on the leaderboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Global Ranking</Text>
          {myRank != null && (
            <Text style={styles.myRankText}>Your rank: #{myRank}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchLeaderboard}
          disabled={isLoadingLeaderboard}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshText}>↺</Text>
        </TouchableOpacity>
      </View>

      {isLoadingLeaderboard && leaderboard.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lavender} size="large" />
          <Text style={styles.loadingText}>Loading rankings…</Text>
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.offlineIcon}>👑</Text>
          <Text style={styles.offlineTitle}>No players yet</Text>
          <Text style={styles.offlineSub}>Be the first on the leaderboard!</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={e => e.profileId}
          renderItem={({ item }) => (
            <EntryRow entry={item} isMe={item.profileId === profileId} />
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingLeaderboard}
              onRefresh={fetchLeaderboard}
              tintColor={Colors.lavender}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGlow,
  },
  heading: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.display,
    fontWeight: '700',
  },
  myRankText: {
    color: Colors.lavender,
    fontSize: 12,
    fontFamily: Fonts.hud,
    marginTop: 2,
  },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 4,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.borderGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  refreshText: { color: Colors.textDim, fontSize: 20 },

  list: { paddingHorizontal: 16, paddingBottom: 24 },
  sep: { height: 1, backgroundColor: Colors.border, marginHorizontal: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rowMe: { backgroundColor: 'rgba(196,181,244,0.07)', borderRadius: 8 },

  rankBadge: {
    width: 44, height: 34, borderRadius: 4,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12 },

  avatar: {
    width: 44, height: 44, borderRadius: 4,
    borderWidth: 2, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },

  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  displayName: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.body,
    fontWeight: '700',
  },
  nameMe: { color: Colors.lavender },
  flag: { fontSize: 14 },
  meBadge: {
    backgroundColor: Colors.lavender,
    borderRadius: 3,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  meBadgeText: { color: Colors.bg, fontSize: 9, fontFamily: Fonts.hud, fontWeight: '700' },
  username: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.mono },

  scores: { alignItems: 'flex-end', gap: 2 },
  xpScore: { color: Colors.xp, fontSize: 13, fontFamily: Fonts.hud },
  streakScore: { color: Colors.streak, fontSize: 11, fontFamily: Fonts.hud },

  offlineIcon: { fontSize: 52 },
  offlineTitle: {
    color: Colors.text, fontSize: 18,
    fontFamily: Fonts.display,
    fontWeight: '700', textAlign: 'center',
  },
  offlineSub: {
    color: Colors.textDim, fontSize: 14,
    fontFamily: Fonts.body,
    textAlign: 'center', lineHeight: 21,
  },
  code: { fontFamily: Fonts.mono, color: Colors.lavender },
  loadingText: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, marginTop: 8 },
});
