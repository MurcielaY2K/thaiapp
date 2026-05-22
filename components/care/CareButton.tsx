import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { Colors } from '../../constants/colors';
import type { CareAction } from '../../types';

interface Props {
  action: CareAction;
  onPress: () => void;
  cooldownRemaining: number; // ms
  disabled?: boolean;
}

export function CareButton({ action, onPress, cooldownRemaining, disabled }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOnCooldown = cooldownRemaining > 0;
  const isDisabled = disabled || isOnCooldown;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const cooldownLabel = isOnCooldown ? formatCooldown(cooldownRemaining) : null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        style={[styles.button, isDisabled && styles.disabled]}
        activeOpacity={0.8}
      >
        <PixelText size={24}>{action.emoji}</PixelText>
        <PixelText size={10} color={isDisabled ? Colors.ui.textDim : Colors.ui.text} style={styles.label}>
          {action.label}
        </PixelText>
        {cooldownLabel && (
          <View style={styles.cooldownBadge}>
            <PixelText size={8} color={Colors.ui.textDim}>{cooldownLabel}</PixelText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatCooldown(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h`;
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: Colors.neon.purple,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.4,
    borderColor: Colors.bg.mid,
    shadowOpacity: 0,
  },
  label: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cooldownBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.bg.deep,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
});
