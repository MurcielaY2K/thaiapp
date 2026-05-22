import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: TextStyle;
  glow?: boolean;
  variant?: 'title' | 'body' | 'label' | 'dim';
}

export function PixelText({ children, size, color, style, glow, variant = 'body' }: Props) {
  const variantStyles: Record<string, TextStyle> = {
    title: { fontSize: 20, color: Colors.ui.textBright, letterSpacing: 2, fontWeight: '900' },
    body: { fontSize: 14, color: Colors.ui.text, letterSpacing: 1 },
    label: { fontSize: 11, color: Colors.ui.textDim, letterSpacing: 1.5, textTransform: 'uppercase' },
    dim: { fontSize: 12, color: Colors.ui.textDim, letterSpacing: 0.5 },
  };

  const base = variantStyles[variant];

  return (
    <Text
      style={[
        base,
        size ? { fontSize: size } : null,
        color ? { color } : null,
        glow ? { textShadowColor: color ?? Colors.neon.pink, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
