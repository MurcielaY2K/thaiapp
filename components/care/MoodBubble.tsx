import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PixelText } from '../pixel/PixelText';
import { Colors } from '../../constants/colors';
import type { PetMood, PetPersonality } from '../../types';

const MOOD_CONFIG: Record<PetMood, { emoji: string; label: string; color: string; message: string }> = {
  ecstatic: { emoji: '🌟', label: 'ECSTATIC', color: Colors.neon.yellow, message: 'I love my life!!' },
  happy: { emoji: '😄', label: 'HAPPY', color: Colors.neon.pink, message: 'Life is good~' },
  neutral: { emoji: '😐', label: 'OKAY', color: Colors.ui.textDim, message: 'Fine I guess...' },
  sad: { emoji: '😢', label: 'SAD', color: Colors.pastel.blue, message: 'Pay attention to me...' },
  angry: { emoji: '😤', label: 'ANGRY', color: Colors.ui.danger, message: 'I\'m upset!!' },
  sleepy: { emoji: '😴', label: 'SLEEPY', color: Colors.pastel.purple, message: 'zzzZZZ...' },
  hungry: { emoji: '🍖', label: 'HUNGRY', color: Colors.neon.orange, message: 'FEED ME NOW' },
};

const PERSONALITY_QUIPS: Record<PetPersonality, string[]> = {
  lazy: ['Can we nap instead?', 'This is too much effort', 'zzz...'],
  chaotic: ['AAAAAA!!', 'LET\'S BREAK THINGS', 'WHY NOT BOTH'],
  affectionate: ['Hold me~', 'More hugs pls', 'Never leave me'],
  jealous: ['Who were you with?!', 'Only pet ME', 'I saw that...'],
  hyperactive: ['GO GO GO!!', 'MORE ENERGY PLZ', 'ZOOM'],
  dramatic: ['I\'m DYING (I\'m fine)', 'The tragedy!!', '*gasps*'],
  intelligent: ['I\'ve analyzed the situation', 'Statistically speaking...', 'Actually...'],
  weird: ['✦✦✦', 'beep boop', '...'],
};

interface Props {
  mood: PetMood;
  personality: PetPersonality;
  name: string;
}

export function MoodBubble({ mood, personality, name }: Props) {
  const config = MOOD_CONFIG[mood];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  const quips = PERSONALITY_QUIPS[personality];
  const quip = quips[Math.floor(Math.random() * quips.length)];
  const showQuip = Math.random() > 0.5;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [mood]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.bubble, { borderColor: config.color }]}>
        <PixelText size={20}>{config.emoji}</PixelText>
        <View style={styles.textBlock}>
          <PixelText size={9} color={config.color} style={styles.moodLabel}>{config.label}</PixelText>
          <PixelText size={12} color={Colors.ui.text}>
            {showQuip ? quip : config.message}
          </PixelText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bg.card,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 220,
  },
  textBlock: {
    flex: 1,
  },
  moodLabel: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
});
