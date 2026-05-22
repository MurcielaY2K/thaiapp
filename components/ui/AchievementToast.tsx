import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { Colors } from '../../constants/colors';
import type { Achievement } from '../../store/achievementStore';

interface Props {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievement) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -120, duration: 400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 3000);

    return () => clearTimeout(timer);
  }, [achievement?.id]);

  if (!achievement) return null;

  const catColors: Record<Achievement['category'], string> = {
    care: Colors.neon.pink,
    games: Colors.neon.cyan,
    social: Colors.neon.purple,
    evolution: Colors.neon.yellow,
    secret: Colors.neon.green,
  };

  const color = catColors[achievement.category];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.toast, { borderColor: color }]}>
        <PixelText size={28}>{achievement.emoji}</PixelText>
        <View style={styles.textBlock}>
          <PixelText size={9} color={color} style={{ letterSpacing: 2 }}>
            ACHIEVEMENT UNLOCKED
          </PixelText>
          <PixelText size={13} color={Colors.ui.textBright}>{achievement.title}</PixelText>
          <PixelText size={10} color={Colors.ui.textDim}>{achievement.description}</PixelText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bg.dark,
    borderRadius: 4,
    borderWidth: 2,
    padding: 12,
    shadowColor: Colors.neon.yellow,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
});
