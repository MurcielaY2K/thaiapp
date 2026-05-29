import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { useAchievementStore } from '../../store/achievementStore';
import { PixelPet } from '../../components/pixel/PixelPet';
import { PixelText } from '../../components/pixel/PixelText';
import { CareButton } from '../../components/care/CareButton';
import { StatsBar } from '../../components/care/StatsBar';
import { Colors } from '../../constants/colors';
import { CARE_ACTIONS, PERSONALITY_TRAITS } from '../../constants/petData';

export default function CareScreen() {
  const { pet, cooldowns, performCareAction } = usePetStore();
  const { updateStats, stats } = useAchievementStore();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  if (!pet) return null;

  const now = Date.now();
  const traitInfo = PERSONALITY_TRAITS[pet.personality];

  const handleCareAction = (action: typeof CARE_ACTIONS[0]) => {
    const cooldownRemaining = getCooldown(action.type);
    if (cooldownRemaining > 0) return;

    performCareAction(action);
    setLastAction(action.label);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Track specific action types for achievements
    if (action.type === 'feed') {
      updateStats({ totalFeeds: stats.totalFeeds + 1 });
    } else if (action.type === 'hug') {
      updateStats({ totalHugs: stats.totalHugs + 1 });
    }

    feedbackAnim.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setLastAction(null));
  };

  const getCooldown = (type: string): number => {
    const lastUsed = cooldowns[type] || 0;
    const action = CARE_ACTIONS.find(a => a.type === type);
    if (!action) return 0;
    const remaining = action.cooldownMs - (now - lastUsed);
    return Math.max(0, remaining);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText variant="title" size={18} color={Colors.neon.pink} glow>
            💕  CARE FOR {pet.name.toUpperCase()}
          </PixelText>
        </View>

        {/* Pet preview */}
        <View style={styles.petPreview}>
          <PixelPet pet={pet} size={100} />
          <View style={styles.personalityBadge}>
            <PixelText size={18}>{traitInfo.emoji}</PixelText>
            <View>
              <PixelText size={11} color={Colors.neon.purple} style={{ letterSpacing: 1 }}>
                {pet.personality.toUpperCase()}
              </PixelText>
              <PixelText size={10} color={Colors.ui.textDim}>{traitInfo.description}</PixelText>
            </View>
          </View>
        </View>

        {/* Personality traits */}
        <View style={styles.section}>
          <PixelText variant="label">Personality Traits</PixelText>
          <View style={styles.traitsBox}>
            {traitInfo.behaviors.map((b, i) => (
              <View key={i} style={styles.traitRow}>
                <PixelText size={10} color={Colors.neon.yellow}>▶</PixelText>
                <PixelText size={11} color={Colors.ui.text}>{b}</PixelText>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <PixelText variant="label">Current Stats</PixelText>
          <View style={styles.statsBox}>
            <StatsBar label="Happiness" emoji="😊" value={pet.stats.happiness} color={Colors.stat.happiness} />
            <StatsBar label="Energy" emoji="⚡" value={pet.stats.energy} color={Colors.stat.energy} />
            <StatsBar label="Hunger" emoji="🍖" value={100 - pet.stats.hunger} color={Colors.stat.hunger} />
            <StatsBar label="Hygiene" emoji="🛁" value={pet.stats.hygiene} color={Colors.stat.hygiene} />
            <StatsBar label="Affection" emoji="💕" value={pet.stats.affection} color={Colors.stat.affection} />
          </View>
        </View>

        {/* Care actions */}
        <View style={styles.section}>
          <PixelText variant="label">Care Actions</PixelText>
          <View style={styles.careGrid}>
            {CARE_ACTIONS.map(action => (
              <CareButton
                key={action.type}
                action={action}
                onPress={() => handleCareAction(action)}
                cooldownRemaining={getCooldown(action.type)}
              />
            ))}
          </View>
        </View>

        {/* Action feedback */}
        {lastAction && (
          <Animated.View style={[styles.feedback, { opacity: feedbackAnim }]}>
            <PixelText size={14} color={Colors.neon.green} glow>
              ✓ {lastAction} complete! +XP earned
            </PixelText>
          </Animated.View>
        )}

        {/* Care tips */}
        <View style={styles.section}>
          <PixelText variant="label">Care Tips for {pet.personality} pets</PixelText>
          <View style={styles.tipsBox}>
            <PixelText size={11} color={Colors.ui.textDim}>
              • Check in every few hours to prevent stat decay{'\n'}
              • Neglected pets turn into grumpy gremlins!{'\n'}
              • Higher happiness = faster evolution{'\n'}
              • Some actions have cooldowns — plan ahead!
            </PixelText>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
  },
  petPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  personalityBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neon.purple,
    padding: 10,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    gap: 10,
  },
  statsBox: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 4,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  traitsBox: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 6,
  },
  traitRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  feedback: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(57,255,20,0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neon.green,
  },
  tipsBox: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
  },
});
