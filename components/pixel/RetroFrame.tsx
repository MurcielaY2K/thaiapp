import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  glowing?: boolean;
  color?: string;
}

export function RetroFrame({ children, style, glowing, color = Colors.ui.border }: Props) {
  return (
    <View style={[
      styles.outer,
      glowing && { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 },
      style,
    ]}>
      <View style={[styles.inner, { borderColor: color }]}>
        {children}
      </View>
    </View>
  );
}

export function PixelBorder({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.pixelBorder, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  inner: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 2,
    backgroundColor: Colors.bg.card,
  },
  pixelBorder: {
    borderWidth: 3,
    borderColor: Colors.ui.border,
    borderRadius: 2,
    backgroundColor: Colors.bg.card,
    shadowColor: Colors.neon.purple,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
});
