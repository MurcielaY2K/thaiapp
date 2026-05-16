import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing, radius, fontSize } from '../theme/colors';
import { Session } from '@engine/types';
import { ReviewQuality } from '@engine/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

type Quality = 0 | 2 | 3 | 4;

const QUALITY_CONFIG: { quality: Quality; label: string; shortcut: string; color: string }[] = [
  { quality: 0, label: 'Again', shortcut: '✗', color: colors.again },
  { quality: 2, label: 'Hard',  shortcut: '~', color: colors.hard  },
  { quality: 3, label: 'Good',  shortcut: '✓', color: colors.good  },
  { quality: 4, label: 'Easy',  shortcut: '★', color: colors.easy  },
];

export function StudyScreen({ navigation }: Props) {
  const { facade, refreshStats } = useGame();
  const [session, setSession] = useState<Session | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Start session on mount
  useEffect(() => {
    if (!facade) return;
    try {
      const s = facade.startSession();
      setSession(s);
      setCardStartTime(Date.now());
    } catch (e) {
      Alert.alert('Error', 'Could not start session.');
      navigation.goBack();
    }
    return () => {
      // If user backs out mid-session, end it cleanly
    };
  }, [facade]);

  const currentCard = session?.cards[session.currentIndex];

  const flipToBack = useCallback(() => {
    if (isFlipped || !currentCard) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  }, [isFlipped, currentCard, flipAnim]);

  const answerCard = useCallback(
    async (quality: Quality) => {
      if (!facade || !session || !currentCard || !isFlipped) return;

      Haptics.impactAsync(
        quality >= 3 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );

      const timeTaken = Date.now() - cardStartTime;
      const result = facade.answerCard(quality as ReviewQuality, timeTaken);
      const updatedSession = result.updatedSession;

      // Slide card out, then advance
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: quality >= 3 ? -400 : 400,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(async () => {
        if (updatedSession.isComplete) {
          // End session and navigate
          try {
            const endResult = await facade.endSession();
            refreshStats();
            navigation.replace('SessionComplete', {
              summary: endResult!.summary,
              xpGained: endResult!.summary.xpEarned,
              completedQuestIds: endResult!.completedQuestIds,
            });
          } catch {
            navigation.replace('Main');
          }
          return;
        }

        setSession(updatedSession);
        setIsFlipped(false);
        setCardStartTime(Date.now());
        flipAnim.setValue(0);
        slideAnim.setValue(0);
      });
    },
    [facade, session, currentCard, isFlipped, cardStartTime, flipAnim, slideAnim, navigation, refreshStats],
  );

  if (!session || !currentCard) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading cards…</Text>
      </View>
    );
  }

  const progress = (session.currentIndex) / session.cards.length;
  const card = currentCard.card;

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const regionColor = colors.region[card.region] ?? colors.primary;

  return (
    <View style={styles.container}>
      {/* Top bar: progress */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressBar value={progress} color={regionColor} height={6} />
        </View>
        <Text style={styles.cardCount}>
          {session.currentIndex + 1}/{session.cards.length}
        </Text>
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>
        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Front face */}
          <Pressable onPress={flipToBack}>
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                { borderTopColor: regionColor },
                { transform: [{ rotateY: frontRotate }] },
                isFlipped && styles.cardHidden,
              ]}
            >
              <Text style={styles.categoryLabel}>{card.category.replace(/_/g, ' ')}</Text>
              <Text style={styles.toneLabel}>{card.tone} tone</Text>
              <Text style={styles.thaiText}>{card.thai}</Text>
              <Text style={styles.romanization}>{card.romanization}</Text>
              <Text style={styles.tapHint}>Tap to reveal →</Text>
            </Animated.View>
          </Pressable>

          {/* Back face */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { borderTopColor: regionColor },
              { transform: [{ rotateY: backRotate }] },
              !isFlipped && styles.cardHidden,
            ]}
          >
            <Text style={styles.thaiSmall}>{card.thai}</Text>
            <Text style={styles.meaningText}>{card.englishMeaning}</Text>
            {card.englishAlternatives && card.englishAlternatives.length > 0 && (
              <Text style={styles.alternatives}>
                also: {card.englishAlternatives.join(', ')}
              </Text>
            )}
            {card.exampleSentence && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleThai}>{card.exampleSentence.thai}</Text>
                <Text style={styles.exampleRoman}>{card.exampleSentence.romanization}</Text>
                <Text style={styles.exampleEn}>{card.exampleSentence.englishNatural}</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </View>

      {/* Quality buttons — shown only after flip */}
      <View style={[styles.qualityArea, !isFlipped && styles.qualityHidden]}>
        <Text style={styles.qualityPrompt}>How well did you know it?</Text>
        <View style={styles.qualityRow}>
          {QUALITY_CONFIG.map(({ quality, label, shortcut, color }) => (
            <TouchableOpacity
              key={quality}
              style={[styles.qualityBtn, { borderColor: color }]}
              onPress={() => answerCard(quality)}
              activeOpacity={0.75}
            >
              <Text style={[styles.qualityShortcut, { color }]}>{shortcut}</Text>
              <Text style={[styles.qualityLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.md },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  exitBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitText: { color: colors.textSecondary, fontSize: fontSize.md },
  progressWrapper: { flex: 1 },
  cardCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    minWidth: 36,
    textAlign: 'right',
  },

  cardArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  cardContainer: { width: '100%' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardHidden: { opacity: 0 },

  categoryLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  toneLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  thaiText: {
    fontSize: fontSize.thai,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 72,
    marginBottom: spacing.sm,
  },
  romanization: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  tapHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  thaiSmall: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  meaningText: {
    fontSize: fontSize.xl,
    color: colors.gold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  alternatives: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  exampleBox: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginTop: spacing.sm,
  },
  exampleThai: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  exampleRoman: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleEn: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  qualityArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  qualityHidden: { opacity: 0, pointerEvents: 'none' },
  qualityPrompt: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  qualityBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  qualityShortcut: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  qualityLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
});
