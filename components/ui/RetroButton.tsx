import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
  emoji?: string;
}

export function RetroButton({ label, onPress, color = Colors.neon.pink, size = 'md', style, disabled, emoji }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 11 },
    md: { paddingHorizontal: 20, paddingVertical: 10, fontSize: 13 },
    lg: { paddingHorizontal: 28, paddingVertical: 14, fontSize: 16 },
  };

  const { paddingHorizontal, paddingVertical, fontSize } = sizeStyles[size];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            paddingHorizontal,
            paddingVertical,
            borderColor: color,
            shadowColor: color,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        <PixelText
          size={fontSize}
          color={disabled ? Colors.ui.textDim : color}
          glow={!disabled}
          style={styles.label}
        >
          {emoji ? `${emoji}  ${label}` : label}
        </PixelText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  label: {
    letterSpacing: 1.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
