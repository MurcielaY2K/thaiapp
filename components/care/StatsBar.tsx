import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PixelText } from '../pixel/PixelText';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  emoji: string;
  value: number;
  color: string;
  maxValue?: number;
}

export function StatsBar({ label, emoji, value, color, maxValue = 100 }: Props) {
  const pct = Math.max(0, Math.min(1, value / maxValue));
  const isLow = pct < 0.25;
  const isCritical = pct < 0.1;

  const barColor = isCritical ? Colors.ui.danger : isLow ? Colors.ui.warning : color;

  return (
    <View style={styles.row}>
      <PixelText style={styles.emoji}>{emoji}</PixelText>
      <PixelText variant="label" style={styles.label}>{label}</PixelText>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: barColor,
              shadowColor: barColor,
              shadowOpacity: isCritical ? 0.9 : 0.4,
              shadowRadius: isCritical ? 6 : 3,
            },
          ]}
        />
        {/* Pixel notches */}
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[styles.notch, { left: `${(i + 1) * 20}%` }]}
          />
        ))}
      </View>
      <PixelText
        size={11}
        color={barColor}
        style={styles.value}
        glow={isCritical}
      >
        {Math.round(value)}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    gap: 6,
  },
  emoji: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  label: {
    width: 70,
    fontSize: 9,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.bg.mid,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
  },
  notch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.bg.deep,
    opacity: 0.4,
  },
  value: {
    width: 24,
    textAlign: 'right',
  },
});
