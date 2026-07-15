import React, { useRef, useEffect } from 'react';
import { Platform, Text } from 'react-native';

// Draws an emoji into a tiny offscreen canvas, then upscales it with
// nearest-neighbor sampling — every emoji comes out with the app's chunky
// pixel-art look without hand-drawing a sprite per lesson icon.
// Native (no DOM canvas) falls back to the plain glyph.

function WebPixelEmoji({ emoji, size, grid }: { emoji: string; size: number; grid: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const off = document.createElement('canvas');
    off.width = grid;
    off.height = grid;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.clearRect(0, 0, grid, grid);
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = `${grid - 2}px sans-serif`;
    octx.fillText(emoji, grid / 2, grid / 2 + 0.5);

    // Render at device resolution so the pixels stay crisp on retina, but
    // sample from the tiny grid with smoothing off for hard pixel edges.
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, grid, grid, 0, 0, canvas.width, canvas.height);
  }, [emoji, size, grid]);

  return React.createElement('canvas', {
    ref,
    style: { width: size, height: size },
    'aria-label': emoji,
    role: 'img',
  });
}

export default function PixelEmoji({ emoji, size = 28, grid = 14 }: {
  emoji: string;
  size?: number;
  grid?: number; // sampling resolution: lower = chunkier
}) {
  // 12px sampling made some glyphs unrecognizable; 14 keeps the chunk but
  // preserves enough shape to read at a glance.

  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return <Text style={{ fontSize: size * 0.85 }}>{emoji}</Text>;
  }
  return <WebPixelEmoji emoji={emoji} size={size} grid={grid} />;
}
