import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

interface Props {
  value: number;       // 0–1
  color?: string;
  height?: number;
  bgColor?: string;
}

export function ProgressBar({ value, color = colors.primary, height = 6, bgColor = colors.border }: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, backgroundColor: bgColor, borderRadius: height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            height,
            backgroundColor: color,
            borderRadius: height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  fill: {},
});
