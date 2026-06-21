import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useProgressStore } from '../../store/progressStore';
import { useSrsStore } from '../../store/srsStore';
import { Colors } from '../../constants/colors';
import PremiumModal from '../PremiumModal';

const BADGE_META: Record<string, { icon: string; label: string; desc: string }> = {
  'first-100xp': { icon: '⭐', label: 'First Steps',   desc: 'Earn 100 XP' },
  '1000xp':      { icon: '🌟', label: 'Dedicated',     desc: 'Earn 1,000 XP' },
  'streak-7':    { icon: '🔥', label: 'Week Warrior',  desc: '7-day streak' },
  'streak-30':   { icon: '💎', label: 'Diamond Mind',  desc: '30-day streak' },
  'words-10':    { icon: '📖', label: 'Word Collector', desc: 'Master 10 words' },
  'words-50':    { icon: '📚', label: 'Vocabularian',  desc: 'Master 50 words' },
  'words-100':   { icon: '🏆', label: 'Thai Scholar',  desc: 'Master 100 words' },
};

const ALL_BADGES = Object.keys(BADGE_META);

export default function ProfileTab() {
  const { xp, level, hearts, gems, isPremium, badges, dailyXp, dailyGoal } = useProgressStore();
  const { streak, getStats } = useSrsStore();
  const stats = getStats();

  const [premiumVisible, setPremiumVisible] = React.useState(false);
  const xpForNextLevel = level * 100;
  const xpThisLevel = xp - (level - 1) * 100;
  const levelPct = Math.min(1, xpThisLevel / 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar + level */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🐉</Text>
          </View>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.round(levelPct * 100)}%` as any }]} />
          </View>
          <Text style={styles.xpLabel}>{xpThisLevel} / 100 XP to next level</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={streak} label="Day streak" color="#ff9f43" />
          <StatCard icon="💎" value={gems} label="Gems" color="#60a5fa" />
          <StatCard icon="❤️" value={isPremium ? '∞' : hearts} label="Hearts" color="#e74c3c" />
          <StatCard icon="✅" value={stats.mastered} label="Mastered" color="#34d399" />
          <StatCard icon="⭐" value={xp} label="Total XP" color="#fbbf24" />
          <StatCard icon="📅" value={dailyXp.earned} label={`/ ${dailyGoal} today`} color={Colors.accent} />
        </View>

        {/* Premium status */}
        {!isPremium ? (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => setPremiumVisible(true)} activeOpacity={0.85}>
            <Text style={styles.premiumIcon}>👑</Text>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSub}>Unlock all worlds & unlimited hearts</Text>
            </View>
            <Text style={styles.premiumArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.premiumActive}>
            <Text style={styles.premiumActiveIcon}>👑</Text>
            <Text style={styles.premiumActiveText}>Premium Member</Text>
          </View>
        )}

        {/* Badges */}
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {ALL_BADGES.map(id => {
            const meta = BADGE_META[id];
            const earned = badges.includes(id);
            return (
              <View key={id} style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
                <Text style={[styles.badgeIcon, !earned && styles.badgeLocked]}>{meta.icon}</Text>
                <Text style={[styles.badgeLabel, !earned && styles.textDimmed]}>{meta.label}</Text>
                <Text style={styles.badgeDesc}>{meta.desc}</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
      <PremiumModal visible={premiumVisible} onClose={() => setPremiumVisible(false)} />
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, color }: {
  icon: string; value: number | string; label: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 20, gap: 0 },

  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 6 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarEmoji: { fontSize: 44 },
  levelLabel: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  xpTrack: {
    width: 200, height: 10, borderRadius: 5,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  xpFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 5 },
  xpLabel: { color: Colors.textDim, fontSize: 12 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textDim, fontSize: 11, textAlign: 'center' },

  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    marginBottom: 24,
  },
  premiumIcon: { fontSize: 28 },
  premiumText: { flex: 1 },
  premiumTitle: { color: '#ffd700', fontSize: 15, fontWeight: '700' },
  premiumSub: { color: Colors.textDim, fontSize: 12 },
  premiumArrow: { color: '#ffd700', fontSize: 24 },

  premiumActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    marginBottom: 24,
    justifyContent: 'center',
  },
  premiumActiveIcon: { fontSize: 24 },
  premiumActiveText: { color: '#ffd700', fontSize: 15, fontWeight: '700' },

  sectionTitle: {
    color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12,
  },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
    alignItems: 'center',
  },
  badgeCardLocked: { opacity: 0.45 },
  badgeIcon: { fontSize: 28 },
  badgeLocked: { filter: 'grayscale(1)' } as any,
  badgeLabel: { color: Colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: Colors.textDim, fontSize: 11, textAlign: 'center' },
  textDimmed: { color: Colors.textDim },
});
