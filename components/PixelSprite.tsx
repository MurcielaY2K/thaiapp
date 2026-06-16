import React from 'react';
import { View } from 'react-native';
import type { Sprite } from '../data/sprites';

interface Props {
  sprite: Sprite;
  size: number;
  opacity?: number;
}

function normalize(sprite: Sprite): string[] {
  return sprite.rows.map(r => {
    if (r.length === sprite.w) return r;
    if (r.length > sprite.w) return r.slice(0, sprite.w);
    return r + '.'.repeat(sprite.w - r.length);
  });
}

export default function PixelSprite({ sprite, size, opacity = 1 }: Props) {
  const scale = size / sprite.w;
  const renderedH = sprite.h * scale;
  const rows = normalize(sprite);

  return (
    <View style={{ width: size, height: renderedH, opacity }}>
      {rows.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((ch, x) => (
            <View
              key={x}
              style={{
                width: scale,
                height: scale,
                backgroundColor: ch === '.' ? 'transparent' : (sprite.palette[ch] ?? 'transparent'),
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
