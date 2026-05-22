import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { PixelPet } from '../../components/pixel/PixelPet';
import { PixelText } from '../../components/pixel/PixelText';
import { RetroButton } from '../../components/ui/RetroButton';
import { Colors } from '../../constants/colors';
import { EVOLUTION_STAGES } from '../../constants/petData';

export default function EvolutionModal() {
  const { pet } = usePetStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!pet) return null;

  const evolution = EVOLUTION_STAGES[pet.evolutionStage];
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <LinearGradient colors={[Colors.bg.deep, '#3d0f7a', Colors.bg.deep]} style={styles.container}>
      <PixelText variant="title" size={22} color={Colors.neon.yellow} glow style={styles.center}>
        ✨  EVOLUTION!  ✨
      </PixelText>

      <PixelText size={14} color={Colors.ui.textDim} style={styles.center}>
        {pet.name} has evolved into...
      </PixelText>

      <View style={styles.evolutionBadge}>
        <PixelText size={48}>{evolution.emoji}</PixelText>
        <Animated.View style={{ opacity: glowOpacity }}>
          <PixelText variant="title" size={28} color={Colors.neon.purple} glow style={styles.center}>
            {evolution.name.toUpperCase()}
          </PixelText>
        </Animated.View>
        <PixelText size={14} color={Colors.ui.text} style={styles.center}>
          {evolution.description}
        </PixelText>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <PixelPet pet={pet} size={160} />
      </Animated.View>

      <View style={styles.particles}>
        {Array.from({ length: 8 }).map((_, i) => (
          <PixelText key={i} size={16}>✨</PixelText>
        ))}
      </View>

      <RetroButton
        label="Awesome!"
        onPress={() => router.back()}
        color={Colors.neon.yellow}
        size="lg"
        emoji="🎉"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
  center: {
    textAlign: 'center',
  },
  evolutionBadge: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(191,95,255,0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.neon.purple,
    padding: 20,
    width: '100%',
  },
  particles: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
