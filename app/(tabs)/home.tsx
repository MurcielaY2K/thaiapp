import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { useAchievementStore } from '../../store/achievementStore';
import { useNotifications } from '../../hooks/useNotifications';
import { PixelPet } from '../../components/pixel/PixelPet';
import { PixelBackground } from '../../components/pixel/PixelBackground';
import { PixelText } from '../../components/pixel/PixelText';
import { MoodBubble } from '../../components/care/MoodBubble';
import { StatsBar } from '../../components/care/StatsBar';
import { AchievementToast } from '../../components/ui/AchievementToast';
import { Colors } from '../../constants/colors';
import { EVOLUTION_STAGES } from '../../constants/petData';
import type { Achievement } from '../../store/achievementStore';

export default function HomeScreen() {
  const { pet, updateDecay, coins, gems } = usePetStore();
  const { newUnlocks, dismissNewUnlocks, updateStats, stats: achStats, load: loadAch } = useAchievementStore();
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [petTapped, setPetTapped] = useState(false);
  const prevEvolutionRef = useRef<string | null>(null);

  const heartAnim = useRef(new Animated.Value(0)).current;
  const tapScaleAnim = useRef(new Animated.Value(1)).current;

  useNotifications(pet);

  // Load achievements on mount
  useEffect(() => {
    loadAch();
  }, []);

  // Sync pet stats to achievement store
  useEffect(() => {
    if (!pet) return;
    updateStats({
      totalCareActions: pet.totalCareActions,
      evolutionStage: pet.evolutionStage,
      maxHappiness: Math.max(achStats.maxHappiness, pet.stats.happiness),
      neglectStreak: pet.neglectStreak,
    });
  }, [pet?.totalCareActions, pet?.evolutionStage, pet?.neglectStreak]);

  // Evolution celebration
  useEffect(() => {
    if (!pet) return;
    if (prevEvolutionRef.current && prevEvolutionRef.current !== pet.evolutionStage) {
      router.push('/modals/evolution');
    }
    prevEvolutionRef.current = pet.evolutionStage;
  }, [pet?.evolutionStage]);

  // Achievement queue processing
  useEffect(() => {
    if (newUnlocks.length > 0) {
      setAchievementQueue(prev => [...prev, ...newUnlocks]);
      dismissNewUnlocks();
    }
  }, [newUnlocks.length]);

  useEffect(() => {
    if (!pendingAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setPendingAchievement(next);
      setAchievementQueue(rest);
    }
  }, [pendingAchievement, achievementQueue.length]);

  // Decay loop (every 6 minutes)
  useEffect(() => {
    const interval = setInterval(updateDecay, 6 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!pet) return null;

  const { stats, mood, personality, evolutionStage, name, roomTheme } = pet;
  const evolution = EVOLUTION_STAGES[evolutionStage];
  const hoursSince = (Date.now() - pet.lastInteraction) / (1000 * 60 * 60);
  const isNeglected = hoursSince > 6;

  const handlePetTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPetTapped(true);
    setTimeout(() => setPetTapped(false), 500);

    Animated.sequence([
      Animated.timing(tapScaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(tapScaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    heartAnim.setValue(0);
    Animated.timing(heartAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  };

  const heartY = heartAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const heartOpacity = heartAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });

  return (
    <PixelBackground theme={roomTheme}>
      <SafeAreaView style={styles.safe}>
        {/* Achievement toast overlay */}
        <AchievementToast
          achievement={pendingAchievement}
          onDismiss={() => setPendingAchievement(null)}
        />

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.currencyRow}>
            <PixelText size={12} color={Colors.neon.yellow}>🪙 {coins}</PixelText>
            <PixelText size={12} color={Colors.neon.cyan}>💎 {gems}</PixelText>
          </View>
          <View style={styles.nameTag}>
            <PixelText size={14} color={Colors.ui.textBright}>{name}</PixelText>
            <PixelText size={10} color={Colors.neon.yellow}>{evolution.emoji} {evolution.name}</PixelText>
          </View>
          <TouchableOpacity onPress={() => router.push('/modals/shop')}>
            <PixelText size={22}>⚙️</PixelText>
          </TouchableOpacity>
        </View>

        {/* XP bar */}
        <View style={styles.xpRow}>
          <PixelText size={10} color={Colors.ui.xp}>LVL {stats.level}</PixelText>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${stats.xp % 100}%` }]} />
          </View>
          <PixelText size={10} color={Colors.ui.xp}>{stats.xp} XP</PixelText>
        </View>

        {/* Neglect warning */}
        {isNeglected && (
          <View style={styles.neglectBanner}>
            <PixelText size={12} color={Colors.ui.warning} glow>
              ⚠️  {name} misses you! ({Math.floor(hoursSince)}h without care)
            </PixelText>
          </View>
        )}

        {/* Pet stage */}
        <View style={styles.petStage}>
          <MoodBubble mood={mood} personality={personality} name={name} />

          <Animated.View style={{ transform: [{ scale: tapScaleAnim }] }}>
            <TouchableOpacity onPress={handlePetTap} activeOpacity={1}>
              <PixelPet pet={pet} size={140} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[styles.floatingHeart, { opacity: heartOpacity, transform: [{ translateY: heartY }] }]}
          >
            <PixelText size={24}>💕</PixelText>
          </Animated.View>

          <View style={styles.shadow} />
        </View>

        {/* Stats panel */}
        <View style={styles.statsPanel}>
          <View style={styles.statsPanelInner}>
            <StatsBar label="Happiness" emoji="😊" value={stats.happiness} color={Colors.stat.happiness} />
            <StatsBar label="Energy" emoji="⚡" value={stats.energy} color={Colors.stat.energy} />
            <StatsBar label="Hunger" emoji="🍖" value={100 - stats.hunger} color={Colors.stat.hunger} />
            <StatsBar label="Hygiene" emoji="🛁" value={stats.hygiene} color={Colors.stat.hygiene} />
            <StatsBar label="Affection" emoji="💕" value={stats.affection} color={Colors.stat.affection} />
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/care')}>
            <PixelText size={22}>💕</PixelText>
            <PixelText size={9} color={Colors.neon.pink}>CARE</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/games')}>
            <PixelText size={22}>🎮</PixelText>
            <PixelText size={9} color={Colors.neon.cyan}>PLAY</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/shop')}>
            <PixelText size={22}>👒</PixelText>
            <PixelText size={9} color={Colors.neon.purple}>DRESS</PixelText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/profile')}>
            <PixelText size={22}>🏆</PixelText>
            <PixelText size={9} color={Colors.neon.yellow}>AWARDS</PixelText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  currencyRow: { gap: 8, flexDirection: 'row' },
  nameTag: { alignItems: 'center' },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bg.mid,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.ui.xp,
    borderRadius: 2,
    shadowColor: Colors.ui.xp,
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
  neglectBanner: {
    backgroundColor: 'rgba(255,224,102,0.15)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.ui.warning,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  petStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingHeart: {
    position: 'absolute',
    top: '30%',
  },
  shadow: {
    width: 80,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 40,
    marginTop: 4,
  },
  statsPanel: { paddingHorizontal: 16, paddingVertical: 8 },
  statsPanelInner: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 10,
    gap: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  qaBtn: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
