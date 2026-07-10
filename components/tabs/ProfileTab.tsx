import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, ActivityIndicator, Platform,
} from 'react-native';

import { router } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';
import { useSrsStore } from '../../store/srsStore';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { REWARDS, FRAME_STYLES, FrameId, BONUS_PACKS } from '../../data/rewards';
import { SUPABASE_CONFIGURED } from '../../constants/supabase';
import AvatarPicker from '../AvatarPicker';
import FlagPicker from '../FlagPicker';
import CloudSyncCard from '../CloudSyncCard';
import PixelAvatar from '../PixelAvatar';
import PixelFlag from '../PixelFlag';

function Avatar({ emoji, frame, size = 72 }: { emoji: string; frame: FrameId; size?: number }) {
  const { border, glow } = FRAME_STYLES[frame];
  return (
    <View style={[
      styles.avatarWrap,
      {
        width: size, height: size, borderRadius: 6,
        borderColor: border,
        shadowColor: glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      Platform.OS === 'web' ? { boxShadow: `0 0 16px ${glow}` } as any : {},
    ]}>
      <PixelAvatar avatar={emoji} size={size * 0.58} />
    </View>
  );
}

function ProfileSetup() {
  const { setupProfile, getUnlockedAvatars } = useUserStore();
  const [username, setUsername]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio]                 = useState('');
  const [avatar, setAvatar]           = useState('px:naga');
  const [flag, setFlag]               = useState('world');
  const [avatarOpen, setAvatarOpen]   = useState(false);
  const [flagOpen, setFlagOpen]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async () => {
    if (username.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
    if (username.trim().length > 20) { setError('Username max 20 characters'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Only letters, numbers and _ allowed'); return; }
    setLoading(true);
    setError('');
    const err = await setupProfile({ username, displayName, avatarEmoji: avatar, countryFlag: flag, bio });
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.setupContent}>
        <Text style={styles.setupTitle}>Create Profile</Text>
        <Text style={styles.setupSub}>Your name appears on the global leaderboard</Text>

        <View style={styles.setupAvatarRow}>
          <TouchableOpacity onPress={() => setAvatarOpen(true)} style={styles.setupAvatarBtn}>
            <PixelAvatar avatar={avatar} size={52} />
            <Text style={styles.setupAvatarEdit}>Change ›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlagOpen(true)} style={styles.setupFlagBtn}>
            <PixelFlag value={flag} size={44} />
            <Text style={styles.setupAvatarEdit}>Flag ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>USERNAME *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={v => setUsername(v.replace(/[^a-zA-Z0-9_]/g, ''))}
            placeholder="e.g. thai_learner"
            placeholderTextColor={Colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          <Text style={styles.fieldHint}>Letters, numbers, _ only · shown on leaderboard</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your full name (optional)"
            placeholderTextColor={Colors.textDim}
            maxLength={40}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>BIO</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={bio}
            onChangeText={setBio}
            placeholder="Why are you learning Thai?"
            placeholderTextColor={Colors.textDim}
            multiline
            maxLength={140}
          />
          <Text style={styles.fieldHint}>{bio.length}/140</Text>
        </View>

        {!SUPABASE_CONFIGURED && (
          <View style={styles.offlineNote}>
            <Text style={styles.offlineNoteText}>
              ℹ️ Supabase not configured — profile saved locally only. Rankings require Supabase.
            </Text>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.setupBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.setupBtnText}>Create Profile</Text>
          }
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <CloudSyncCard />
        </View>
      </ScrollView>

      <AvatarPicker
        visible={avatarOpen}
        avatars={getUnlockedAvatars()}
        selected={avatar}
        onSelect={setAvatar}
        onClose={() => setAvatarOpen(false)}
      />
      <FlagPicker visible={flagOpen} selected={flag} onSelect={setFlag} onClose={() => setFlagOpen(false)} />
    </SafeAreaView>
  );
}

function ProfileEdit({ onDone }: { onDone: () => void }) {
  const store = useUserStore();
  const [displayName, setDisplayName] = useState(store.displayName);
  const [bio, setBio]                 = useState(store.bio);
  const [avatar, setAvatar]           = useState(store.avatarEmoji);
  const [flag, setFlag]               = useState(store.countryFlag);
  const [frame, setFrame]             = useState<FrameId>(store.profileFrame);
  const [avatarOpen, setAvatarOpen]   = useState(false);
  const [flagOpen, setFlagOpen]       = useState(false);
  const [saving, setSaving]           = useState(false);

  const unlockedFrames = store.getUnlockedFrames();

  const save = async () => {
    setSaving(true);
    await store.updateProfile({ displayName, bio, avatarEmoji: avatar, countryFlag: flag, profileFrame: frame });
    setSaving(false);
    onDone();
  };

  return (
    <View style={styles.editSheet}>
      <View style={styles.editHandle} />
      <Text style={styles.editTitle}>Edit Profile</Text>

      <View style={styles.editPickRow}>
        <TouchableOpacity onPress={() => setAvatarOpen(true)} style={styles.editAvatarBtn}>
          <PixelAvatar avatar={avatar} size={52} />
          <Text style={styles.editAvatarHint}>Change avatar ›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFlagOpen(true)} style={styles.editAvatarBtn}>
          <PixelFlag value={flag} size={44} />
          <Text style={styles.editAvatarHint}>Flag ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
        <TextInput
          style={styles.input} value={displayName} onChangeText={setDisplayName}
          placeholderTextColor={Colors.textDim} maxLength={40}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>BIO</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]} value={bio} onChangeText={setBio}
          placeholder="Say something…" placeholderTextColor={Colors.textDim} multiline maxLength={140}
        />
        <Text style={styles.fieldHint}>{bio.length}/140</Text>
      </View>

      <Text style={[styles.fieldLabel, { paddingHorizontal: 0, marginBottom: 8 }]}>PROFILE FRAME</Text>
      <View style={styles.frameRow}>
        {unlockedFrames.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.frameOpt,
              frame === f && styles.frameOptActive,
              { borderColor: FRAME_STYLES[f].border },
            ]}
            onPress={() => setFrame(f)}
          >
            <Text style={styles.frameOptText}>{FRAME_STYLES[f].label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.editActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onDone}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving
            ? <ActivityIndicator color={Colors.bg} size="small" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <AvatarPicker visible={avatarOpen} avatars={store.getUnlockedAvatars()} selected={avatar}
        onSelect={setAvatar} onClose={() => setAvatarOpen(false)} />
      <FlagPicker visible={flagOpen} selected={flag} onSelect={setFlag} onClose={() => setFlagOpen(false)} />
    </View>
  );
}

const LEVELS: { key: 'beginner' | 'intermediate' | 'advanced'; emoji: string; label: string }[] = [
  { key: 'beginner',     emoji: '🌱', label: 'Beginner' },
  { key: 'intermediate', emoji: '🔥', label: 'Intermediate' },
  { key: 'advanced',     emoji: '⚡', label: 'Advanced' },
];

function LevelCard() {
  const { skillLevel, setSkillLevel } = useProgressStore();
  return (
    <View style={styles.levelCard}>
      <Text style={styles.levelTitle}>🎯 Learning Level</Text>
      <Text style={styles.levelSub}>Beginners always see pronunciation; harder levels add script reading.</Text>
      <View style={styles.levelRowBtns}>
        {LEVELS.map(l => {
          const active = skillLevel === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              style={[styles.levelBtn, active && styles.levelBtnActive]}
              onPress={() => setSkillLevel(l.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.levelBtnEmoji}>{l.emoji}</Text>
              <Text style={[styles.levelBtnText, active && styles.levelBtnTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileTab() {
  const store = useUserStore();
  const { xp, level, hearts, gems, isPremium, badges, dailyXp, dailyGoal } = useProgressStore();
  const { streak, getStats } = useSrsStore();
  const stats = getStats();
  const [editing, setEditing] = useState(false);

  const xpForLevel = level * 100;
  const xpThisLevel = xp - (level - 1) * 100;
  const levelPct = Math.min(1, xpThisLevel / 100);

  const unlockedContent = store.getUnlockedContent();

  if (!store.isSetup) return <ProfileSetup />;

  return (
    <SafeAreaView style={styles.safe}>
      {editing && <ProfileEdit onDone={() => setEditing(false)} />}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>

          <Avatar emoji={store.avatarEmoji} frame={store.profileFrame} size={80} />
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{store.displayName || store.username}</Text>
            <PixelFlag value={store.countryFlag} size={22} />
          </View>
          <Text style={styles.username}>@{store.username}</Text>
          {store.bio ? <Text style={styles.bio}>{store.bio}</Text> : null}

          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv.{level}</Text>
            <View style={styles.xpTrack}>
              <View style={[
                styles.xpFill,
                { width: `${Math.round(levelPct * 100)}%` as any },
              ]} />
            </View>
            <Text style={styles.xpLabel}>{xpThisLevel}/100</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={streak} label="Streak" color={Colors.streak} />
          <StatCard icon="⚡" value={xp} label="Total XP" color={Colors.xp} />
          <StatCard icon="❤️" value={isPremium ? '∞' : hearts} label="Hearts" color={Colors.hearts} />
          <StatCard icon="✅" value={stats.mastered} label="Mastered" color={Colors.mint} />
          <StatCard icon="💎" value={gems} label="Gems" color={Colors.sky} />
          <StatCard icon="📅" value={dailyXp.earned} label={`/${dailyGoal} today`} color={Colors.lavender} />
        </View>

        <LevelCard />

        <CloudSyncCard />

        {unlockedContent.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🎁 Bonus Content</Text>
            <View style={styles.bonusGrid}>
              {unlockedContent.map(key => {
                const pack = BONUS_PACKS[key];
                if (!pack) return null;
                return (
                  <View key={key} style={styles.bonusCard}>
                    <Text style={styles.bonusIcon}>{pack.icon}</Text>
                    <Text style={styles.bonusTitle}>{pack.title}</Text>
                    <Text style={styles.bonusCount}>{pack.words.length} words</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>🏅 Rewards</Text>
        <View style={styles.rewardsGrid}>
          {REWARDS.map(r => {
            const earned = store.unlockedRewards.includes(r.id);
            return (
              <View key={r.id} style={[styles.rewardCard, !earned && styles.rewardLocked]}>
                <Text style={[styles.rewardIcon, !earned && styles.dim]}>{r.icon}</Text>
                <Text style={[styles.rewardTitle, !earned && styles.dim]}>{r.title}</Text>
                <Text style={styles.rewardDesc}>{r.description}</Text>
                {earned && (
                  <View style={styles.rewardUnlocks}>
                    {r.unlocks.map(u => (
                      <Text key={u.label} style={styles.rewardUnlockText}>{u.label}</Text>
                    ))}
                  </View>
                )}
                {!earned && <Text style={styles.lockText}>🔒</Text>}
              </View>
            );
          })}
        </View>

        <View style={styles.legalFooter}>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.legalLink}>Privacy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => router.push('/refunds')}>
              <Text style={styles.legalLink}>Refunds</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => router.push('/delete-account')}>
              <Text style={styles.legalLink}>Delete account</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.legalContact}>coficollective@gmail.com · v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '25' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color, fontFamily: Fonts.hud }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 16, gap: 0 },

  profileCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 20,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16, position: 'relative',
  },
  editBtn: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: Colors.bgInset, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.borderStrong,
  },
  editBtnText: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.hud },
  avatarWrap: {
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg, marginBottom: 4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  displayName: { color: Colors.text, fontSize: 20, fontFamily: Fonts.display, fontWeight: '700' },
  flagEmoji: { fontSize: 20 },
  username: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.mono },
  bio: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginTop: 4 },
  levelText: { color: Colors.lavender, fontSize: 11, fontFamily: Fonts.hud, width: 36 },
  xpTrack: { flex: 1, height: 6, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.xp, borderRadius: 2 },
  xpLabel: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.mono, width: 40, textAlign: 'right' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '30%', backgroundColor: Colors.card, borderRadius: 6, borderWidth: 1,
    paddingVertical: 12, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 20 },
  statLabel: { color: Colors.textDim, fontSize: 9, fontFamily: Fonts.hud, textAlign: 'center', letterSpacing: 0.5 },

  sectionTitle: {
    color: Colors.text, fontSize: 15,
    fontFamily: Fonts.display, fontWeight: '700',
    marginBottom: 10,
  },

  bonusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  bonusCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(196,181,244,0.06)', borderRadius: 6,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(196,181,244,0.15)',
  },
  bonusIcon: { fontSize: 28 },
  bonusTitle: { color: Colors.text, fontSize: 12, fontFamily: Fonts.body, fontWeight: '700' },
  bonusCount: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.mono },

  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 30 },
  rewardCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 3, alignItems: 'center',
  },
  rewardLocked: { opacity: 0.4 },
  rewardIcon: { fontSize: 28 },
  rewardTitle: { color: Colors.text, fontSize: 12, fontFamily: Fonts.body, fontWeight: '700', textAlign: 'center' },
  rewardDesc: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.body, textAlign: 'center' },
  rewardUnlocks: { gap: 2, marginTop: 4, alignItems: 'center' },
  rewardUnlockText: { color: Colors.gold, fontSize: 10, fontFamily: Fonts.hud },
  lockText: { fontSize: 16, marginTop: 2 },
  dim: { color: Colors.textDim },

  setupContent: { padding: 24, paddingTop: 32, gap: 0 },
  setupTitle: {
    color: Colors.text, fontSize: 24,
    fontFamily: Fonts.display, fontWeight: '700',
    marginBottom: 6,
  },
  setupSub: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, marginBottom: 28 },
  setupAvatarRow: { flexDirection: 'row', gap: 16, marginBottom: 24, justifyContent: 'center' },
  setupAvatarBtn: { alignItems: 'center', gap: 4 },
  setupAvatarEmoji: { fontSize: 56 },
  setupFlagBtn: { alignItems: 'center', gap: 4 },
  setupFlagEmoji: { fontSize: 46 },
  setupAvatarEdit: { color: Colors.lavender, fontSize: 11, fontFamily: Fonts.hud },
  setupBtn: {
    backgroundColor: Colors.ember, borderRadius: 10, paddingVertical: 15,
    alignItems: 'center', marginTop: 16,
    ...(Platform.OS === 'web' ? { boxShadow: `0 5px 0 0 ${Colors.emberDeep}` } as any : {}),
  },
  setupBtnText: { color: Colors.onBrand, fontSize: 14, fontFamily: Fonts.hud, fontWeight: '700', letterSpacing: 1 },

  editSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderColor: Colors.borderGlow,
    maxHeight: '90%',
  },
  editHandle: { width: 36, height: 3, borderRadius: 2, backgroundColor: Colors.borderGlow, alignSelf: 'center', marginBottom: 16 },
  editTitle: {
    color: Colors.text, fontSize: 18,
    fontFamily: Fonts.display, fontWeight: '700',
    marginBottom: 16, textAlign: 'center',
  },
  editPickRow: { flexDirection: 'row', gap: 28, justifyContent: 'center' },
  editAvatarBtn: { alignItems: 'center', gap: 4, marginBottom: 16 },
  editAvatarHint: { color: Colors.lavender, fontSize: 11, fontFamily: Fonts.hud },
  frameRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  frameOpt: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.border,
  },
  frameOptActive: { backgroundColor: 'rgba(196,181,244,0.12)' },
  frameOptText: { color: Colors.text, fontSize: 11, fontFamily: Fonts.body, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: 4, paddingVertical: 13, alignItems: 'center',
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textDim, fontSize: 14, fontFamily: Fonts.body },
  saveBtn: { flex: 2, borderRadius: 10, paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.ember },
  saveBtnText: { color: Colors.onBrand, fontSize: 14, fontFamily: Fonts.hud, fontWeight: '700' },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    color: Colors.textDim, fontSize: 9,
    fontFamily: Fonts.hud, letterSpacing: 1.5,
    marginBottom: 6, paddingHorizontal: 4,
  },
  input: {
    backgroundColor: Colors.bg, borderRadius: 4, borderWidth: 1, borderColor: Colors.borderGlow,
    paddingHorizontal: 14, paddingVertical: 12, color: Colors.text,
    fontSize: 15, fontFamily: Fonts.body,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  fieldHint: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.mono, marginTop: 4, paddingHorizontal: 4 },
  offlineNote: {
    backgroundColor: 'rgba(196,181,244,0.06)', borderRadius: 6, padding: 12,
    borderWidth: 1, borderColor: 'rgba(196,181,244,0.15)', marginBottom: 12,
  },
  offlineNoteText: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.body, lineHeight: 17 },
  errorText: { color: Colors.wrong, fontSize: 12, fontFamily: Fonts.body, marginBottom: 8, textAlign: 'center' },

  levelCard: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  levelTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.display, fontWeight: '700' },
  levelSub: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.body, lineHeight: 17 },
  levelRowBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  levelBtn: {
    flex: 1, alignItems: 'center', gap: 3, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: Colors.border,
  },
  levelBtnActive: { borderColor: Colors.borderStrong, backgroundColor: Colors.realmGrove },
  levelBtnEmoji: { fontSize: 20 },
  levelBtnText: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.hud },
  levelBtnTextActive: { color: Colors.text },

  legalFooter: { alignItems: 'center', gap: 6, paddingBottom: 24 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legalLink: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.body, textDecorationLine: 'underline' },
  legalDot: { color: Colors.textDim, fontSize: 11 },
  legalContact: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.mono, opacity: 0.7 },
});
