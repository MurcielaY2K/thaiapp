import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import type { Sprite } from '../data/sprites';

interface Props {
  sprite: Sprite;
  size: number;       // rendered width in px (height scales to keep aspect)
  opacity?: number;
}

// Normalize each row to exactly `w` chars so small authoring miscounts never break layout.
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

  if (Platform.OS === 'web') {
    return (
      <WebSprite sprite={sprite} width={size} height={renderedH} opacity={opacity} />
    );
  }

  // Native fallback: grid of Views (sprites are small).
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
                backgroundColor: ch === '.' ? 'transparent' : sprite.palette[ch] ?? 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function WebSprite({
  sprite, width, height, opacity,
}: { sprite: Sprite; width: number; height: number; opacity: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = sprite.w;
    cv.height = sprite.h;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, sprite.w, sprite.h);
    const rows = normalize(sprite);
    for (let y = 0; y < sprite.h; y++) {
      const row = rows[y];
      for (let x = 0; x < sprite.w; x++) {
        const ch = row[x];
        if (ch === '.' || ch === undefined) continue;
        const color = sprite.palette[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [sprite]);

  return React.createElement('canvas', {
    ref: (el: HTMLCanvasElement | null) => { ref.current = el; },
    style: {
      width,
      height,
      opacity,
      imageRendering: 'pixelated',
      display: 'block',
    },
  });
}
