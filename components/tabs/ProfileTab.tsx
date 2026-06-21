import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { useUserStore } from '../../store/userStore';
import { useProgressStore } from '../../store/progressStore';
import { useSrsStore } from '../../store/srsStore';
import { Colors } from '../../constants/colors';
import { REWARDS, FRAME_STYLES, FrameId, BONUS_PACKS } from '../../data/rewards';
import { SUPABASE_CONFIGURED } from '../../constants/supabase';
import AvatarPicker from '../AvatarPicker';
import FlagPicker from '../FlagPicker';

function Avatar({ emoji, frame, size = 72 }: { emoji: string; frame: FrameId; size?: number }) {
  const { border, glow } = FRAME_STYLES[frame];
  return (
    <View style={[
      styles.avatarWrap,
      {
        width: size, height: size, borderRadius: size / 2,
        borderColor: border,
        shadowColor: glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
    ]}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

function ProfileSetup() {
  const { setupProfile, getUnlockedAvatars, avatarEmoji, countryFlag } = useUserStore();
  const [username, setUsername]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio]                 = useState('');
  const [avatar, setAvatar]           = useState('🐉');
  const [flag, setFlag]               = useState('🌍');
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
        <Text style={styles.setupTitle}>Create Your Profile</Text>
        <Text style={styles.setupSub}>Your name appears on the global leaderboard</Text>

        {/* Avatar + flag pick */}
        <View style={styles.setupAvatarRow}>
          <TouchableOpacity onPress={() => setAvatarOpen(true)} style={styles.setupAvatarBtn}>
            <Text style={styles.setupAvatarEmoji}>{avatar}</Text>
            <Text style={styles.setupAvatarEdit}>Change ›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFlagOpen(true)} style={styles.setupFlagBtn}>
            <Text style={styles.setupFlagEmoji}>{flag}</Text>
            <Text style={styles.setupAvatarEdit}>Flag ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Username *</Text>
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
          <Text style={styles.fieldLabel}>Display Name</Text>
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
          <Text style={styles.fieldLabel}>Bio</Text>
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.setupBtnText}>Create Profile</Text>}
        </TouchableOpacity>
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

      <TouchableOpacity onPress={() => setAvatarOpen(true)} style={styles.editAvatarBtn}>
        <Text style={{ fontSize: 56 }}>{avatar}</Text>
        <Text style={styles.editAvatarHint}>Change avatar ›</Text>
      </TouchableOpacity>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Display Name</Text>
        <TextInput
          style={styles.input} value={displayName} onChangeText={setDisplayName}
          placeholderTextColor={Colors.textDim} maxLength={40}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Bio</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]} value={bio} onChangeText={setBio}
          placeholder="Say something…" placeholderTextColor={Colors.textDim} multiline maxLength={140}
        />
        <Text style={styles.fieldHint}>{bio.length}/140</Text>
      </View>

      {/* Frame picker */}
      <Text style={[styles.fieldLabel, { paddingHorizontal: 0, marginBottom: 8 }]}>Profile Frame</Text>
      <View style={styles.frameRow}>
        {unlockedFrames.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.frameOpt, frame === f && styles.frameOptActive, { borderColor: FRAME_STYLES[f].border }]}
            onPress={() => setFrame(f)}
          >
            <Text style={styles.frameOptText}>{FRAME_STYLES[f].label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.editActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onDone}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <AvatarPicker visible={avatarOpen} avatars={store.getUnlockedAvatars()} selected={avatar}
        onSelect={setAvatar} onClose={() => setAvatarOpen(false)} />
      <FlagPicker visible={flagOpen} selected={flag} onSelect={setFlag} onClose={() => setFlagOpen(false)} />
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

        {/* Profile card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>

          <Avatar emoji={store.avatarEmoji} frame={store.profileFrame} size={80} />
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{store.displayName || store.username}</Text>
            <Text style={styles.flagEmoji}>{store.countryFlag}</Text>
          </View>
          <Text style={styles.username}>@{store.username}</Text>
          {store.bio ? <Text style={styles.bio}>{store.bio}</Text> : null}

          {/* Level bar */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv.{level}</Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round(levelPct * 100)}%` as any }]} />
            </View>
            <Text style={styles.xpLabel}>{xpThisLevel}/100</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={streak} label="Streak" color="#ff9f43" />
          <StatCard icon="⭐" value={xp} label="Total XP" color="#fbbf24" />
          <StatCard icon="❤️" value={isPremium ? '∞' : hearts} label="Hearts" color="#e74c3c" />
          <StatCard icon="✅" value={stats.mastered} label="Mastered" color="#34d399" />
          <StatCard icon="💎" value={gems} label="Gems" color="#60a5fa" />
          <StatCard icon="📅" value={dailyXp.earned} label={`/${dailyGoal} today`} color={Colors.accent} />
        </View>

        {/* Unlocked bonus packs */}
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

        {/* Rewards progress */}
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

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
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
  content: { padding: 20, paddingTop: 16, gap: 0 },

  // Profile card
  profileCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 20,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16, position: 'relative',
  },
  editBtn: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: Colors.bg, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  editBtnText: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
  avatarWrap: {
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg, marginBottom: 4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  displayName: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  flagEmoji: { fontSize: 22 },
  username: { color: Colors.textDim, fontSize: 13 },
  bio: { color: Colors.textDim, fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginTop: 4 },
  levelText: { color: Colors.accent, fontSize: 13, fontWeight: '700', width: 36 },
  xpTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  xpLabel: { color: Colors.textDim, fontSize: 11, width: 40, textAlign: 'right' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '30%', backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1,
    paddingVertical: 12, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textDim, fontSize: 10, textAlign: 'center' },

  // Sections
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 10 },

  // Bonus packs
  bonusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  bonusCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,159,67,0.08)', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,159,67,0.2)',
  },
  bonusIcon: { fontSize: 28 },
  bonusTitle: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  bonusCount: { color: Colors.textDim, fontSize: 11 },

  // Rewards
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 30 },
  rewardCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 3, alignItems: 'center',
  },
  rewardLocked: { opacity: 0.45 },
  rewardIcon: { fontSize: 28 },
  rewardTitle: { color: Colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  rewardDesc: { color: Colors.textDim, fontSize: 11, textAlign: 'center' },
  rewardUnlocks: { gap: 2, marginTop: 4, alignItems: 'center' },
  rewardUnlockText: { color: '#ff9f43', fontSize: 10, fontWeight: '600' },
  lockText: { fontSize: 16, marginTop: 2 },
  dim: { color: Colors.textDim },

  // Setup form
  setupContent: { padding: 24, paddingTop: 32, gap: 0 },
  setupTitle: { color: Colors.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  setupSub: { color: Colors.textDim, fontSize: 14, marginBottom: 28 },
  setupAvatarRow: { flexDirection: 'row', gap: 16, marginBottom: 24, justifyContent: 'center' },
  setupAvatarBtn: { alignItems: 'center', gap: 4 },
  setupAvatarEmoji: { fontSize: 56 },
  setupFlagBtn: { alignItems: 'center', gap: 4 },
  setupFlagEmoji: { fontSize: 46 },
  setupAvatarEdit: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  setupBtn: {
    backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 16,
  },
  setupBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Edit profile
  editSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderColor: Colors.border,
    maxHeight: '90%',
  },
  editHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  editTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  editAvatarBtn: { alignItems: 'center', gap: 4, marginBottom: 16 },
  editAvatarHint: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  frameRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  frameOpt: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
  },
  frameOptActive: { backgroundColor: 'rgba(255,159,67,0.12)' },
  frameOptText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textDim, fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.accent },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Shared form fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: Colors.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, paddingHorizontal: 4 },
  input: {
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, color: Colors.text, fontSize: 15,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  fieldHint: { color: Colors.textDim, fontSize: 11, marginTop: 4, paddingHorizontal: 4 },
  offlineNote: {
    backgroundColor: 'rgba(255,159,67,0.08)', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,159,67,0.2)', marginBottom: 12,
  },
  offlineNoteText: { color: Colors.textDim, fontSize: 12, lineHeight: 17 },
  errorText: { color: Colors.wrong, fontSize: 13, marginBottom: 8, textAlign: 'center' },
});
