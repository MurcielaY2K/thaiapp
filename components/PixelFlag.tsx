import React from 'react';
import { View, Text } from 'react-native';
import PixelSprite from './PixelSprite';
import { resolveFlag } from '../data/flags';
import { Colors } from '../constants/colors';

// Renders a country flag as pixel art (data/flags.ts). Accepts either a short
// code ('th') or a legacy emoji ('🇹🇭'); anything unrecognised falls back to
// rendering the raw string as text so old data never breaks.
export default function PixelFlag({ value, size }: { value: string; size: number }) {
  const flag = resolveFlag(value);
  if (!flag) {
    return <Text style={{ fontSize: size * 0.9, lineHeight: size * 1.1 }}>{value}</Text>;
  }
  const border = flag.outline === false ? 0 : Math.max(1, Math.round(size / 22));
  return (
    <View
      style={{
        borderWidth: border,
        borderColor: Colors.borderStrong,
        backgroundColor: flag.outline === false ? 'transparent' : Colors.borderStrong,
      }}
    >
      <PixelSprite sprite={flag} size={size} />
    </View>
  );
}
