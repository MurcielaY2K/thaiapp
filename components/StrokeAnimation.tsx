import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, LayoutChangeEvent,
} from 'react-native';
import { Colors } from '../constants/colors';

// "Watch" mode. Instead of hand-authored stroke paths (which never matched the
// real glyphs), we animate a left-to-right "write-on" reveal of the actual
// font character. This is guaranteed correct for every consonant, vowel and
// numeral because it IS the font's glyph.

const REVEAL_MS = 1900;
const FONT = '"Noto Sans Thai", "Thonburi", -apple-system, sans-serif';

const GRID_COLOR      = 'rgba(255,255,255,0.07)';
const GRID_DASH_COLOR = 'rgba(255,255,255,0.14)';
const OUTLINE_COLOR   = 'rgba(255,255,255,0.16)';
const GHOST_FILL      = 'rgba(255,255,255,0.05)';
const INK_COLOR       = '#ff9f43';

interface Props {
  charId: string;
  char: string;
  size?: number;
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;
  ctx.lineWidth = 1;
  ctx.strokeStyle = GRID_COLOR;
  ctx.setLineDash([]);
  for (const pos of [size * 0.25, size * 0.75]) {
    ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
  }
  ctx.strokeStyle = GRID_DASH_COLOR;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, half); ctx.lineTo(size, half); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, size); ctx.stroke();
  ctx.setLineDash([]);
}

export default function StrokeAnimation({ charId, char, size: fixedSize }: Props) {
  const [measured, setMeasured] = useState(0);
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState(false);

  const size = fixedSize && fixedSize > 0 ? Math.round(fixedSize) : measured;

  const onLayout = (e: LayoutChangeEvent) => {
    if (!fixedSize) setMeasured(Math.round(e.nativeEvent.layout.width));
  };

  const cardStyle = fixedSize
    ? [styles.canvasCard, { width: size, height: size }]
    : styles.canvasCard;

  if (Platform.OS !== 'web') {
    return (
      <View style={cardStyle} onLayout={onLayout}>
        <View style={styles.ghostWrap}>
          <Text style={[styles.ghost, size ? { fontSize: size * 0.6 } : {}]}>{char}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.canvasOuter}>
      <View style={cardStyle} onLayout={onLayout}>
        {size > 0 && (
          <RevealCanvas
            key={`${charId}-${tick}`}
            char={char}
            size={size}
            onDone={() => setDone(true)}
          />
        )}
      </View>
      <View style={[styles.toolbar, fixedSize ? { width: size } : null]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>watch &amp; learn</Text>
        </View>
        {done && (
          <TouchableOpacity
            style={styles.replayBtn}
            onPress={() => { setDone(false); setTick(t => t + 1); }}
            activeOpacity={0.8}
          >
            <Text style={styles.replayText}>↺  Replay</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function RevealCanvas({
  char, size, onDone,
}: { char: string; size: number; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = size * dpr;
    cv.width = w;
    cv.height = w;
    cv.style.width = size + 'px';
    cv.style.height = size + 'px';
    const ctx = cv.getContext('2d')!;
    const cx = w / 2;
    const cy = w / 2;
    const fontSpec = `400 ${w * 0.66}px ${FONT}`;
    let start = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / REVEAL_MS);

      ctx.clearRect(0, 0, w, w);
      drawGrid(ctx, w);

      ctx.font = fontSpec;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Faint target glyph (the goal shape)
      ctx.fillStyle = GHOST_FILL;
      ctx.fillText(char, cx, cy);
      ctx.lineWidth = Math.max(1, dpr);
      ctx.strokeStyle = OUTLINE_COLOR;
      ctx.strokeText(char, cx, cy);

      // Revealed (inked) portion, clipped left → right
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * t, w);
      ctx.clip();
      ctx.fillStyle = INK_COLOR;
      ctx.fillText(char, cx, cy);
      ctx.restore();

      // Moving pen line at the reveal edge
      if (t < 1) {
        const x = w * t;
        ctx.strokeStyle = INK_COLOR;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(x, w * 0.12);
        ctx.lineTo(x, w * 0.88);
        ctx.stroke();
        rafRef.current = requestAnimationFrame(frame);
      } else {
        onDone();
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [char, size, onDone]);

  return React.createElement('canvas', {
    ref: (el: HTMLCanvasElement | null) => { ref.current = el; },
    style: { display: 'block', borderRadius: 20 },
  });
}

const styles = StyleSheet.create({
  canvasOuter: { width: '100%', alignItems: 'center' },
  canvasCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  ghostWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ghost: { color: OUTLINE_COLOR, textAlign: 'center', fontWeight: '300' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  badge: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { color: Colors.textDim, fontSize: 13, letterSpacing: 0.5 },
  replayBtn: {
    backgroundColor: 'rgba(255,159,67,0.14)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  replayText: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
});
