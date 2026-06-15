import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, LayoutChangeEvent,
} from 'react-native';
import { STROKE_DATA, type StrokeSet } from '../data/strokes';
import { Colors } from '../constants/colors';

type Pt = [number, number];

// Drawing constants
const COORD = 100;       // stroke data is in 0–100 space
const LINE_W_RATIO = 0.065;   // line width as fraction of canvas size
const DOT_R_RATIO = 0.045;    // start-dot radius

// Timing (ms)
const STROKE_MS = 1400;
const PAUSE_MS  = 550;

// Colors
const GUIDE_COLOR      = 'rgba(255,255,255,0.10)';
const DONE_COLOR       = 'rgba(255,159,67,0.45)';
const ACTIVE_COLOR     = '#ff9f43';
const NUM_BG           = '#ff9f43';
const NUM_FG           = '#0d0d1a';
const GRID_COLOR       = 'rgba(255,255,255,0.07)';
const GRID_DASH_COLOR  = 'rgba(255,255,255,0.14)';

// ── helpers ─────────────────────────────────────────────────────────────────

function scale(pt: Pt, s: number): Pt {
  return [pt[0] * s, pt[1] * s];
}

function smoothStroke(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  s: number,
) {
  if (pts.length === 0) return;
  if (pts.length === 1) {
    const [x, y] = scale(pts[0], s);
    ctx.beginPath();
    ctx.arc(x, y, (LINE_W_RATIO * s) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  const [x0, y0] = scale(pts[0], s);
  ctx.moveTo(x0, y0);
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = scale(pts[i], s);
    const [bx, by] = scale(pts[i + 1], s);
    ctx.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2);
  }
  const [lx, ly] = scale(pts[pts.length - 1], s);
  ctx.lineTo(lx, ly);
  ctx.stroke();
}

function partialStroke(stroke: Pt[], t: number): Pt[] {
  if (t <= 0) return [stroke[0]];
  if (t >= 1) return stroke;
  const span = stroke.length - 1;
  const pos  = t * span;
  const idx  = Math.floor(pos);
  const frac = pos - idx;
  const out  = stroke.slice(0, idx + 1);
  const p1   = stroke[idx];
  const p2   = stroke[idx + 1];
  out.push([p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac]);
  return out;
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number) {
  const half = size / 2;
  ctx.lineWidth = 1;
  // Solid quarters
  ctx.strokeStyle = GRID_COLOR;
  ctx.setLineDash([]);
  for (const pos of [size * 0.25, size * 0.75]) {
    ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
  }
  // Dashed center cross
  ctx.strokeStyle = GRID_DASH_COLOR;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, half); ctx.lineTo(size, half); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, size); ctx.stroke();
  ctx.setLineDash([]);
}

function drawGhost(ctx: CanvasRenderingContext2D, char: string, size: number) {
  ctx.font = `300 ${size * 0.72}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = GUIDE_COLOR;
  ctx.fillText(char, size / 2, size / 2);
}

function drawStrokeNum(
  ctx: CanvasRenderingContext2D,
  pt: Pt, n: number, s: number,
  active: boolean,
) {
  const [x, y] = scale(pt, s);
  const r = DOT_R_RATIO * s;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = active ? NUM_BG : 'rgba(255,159,67,0.55)';
  ctx.fill();
  ctx.font = `bold ${r * 1.25}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = NUM_FG;
  ctx.fillText(String(n), x, y);
}

// ── main component ───────────────────────────────────────────────────────────

interface Props {
  charId: string;
  char: string;
}

export default function StrokeAnimation({ charId, char }: Props) {
  const [size, setSize] = useState(0);
  const [tick, setTick] = useState(0);      // forces re-render when replay hits

  const onLayout = (e: LayoutChangeEvent) =>
    setSize(Math.round(e.nativeEvent.layout.width));

  if (Platform.OS !== 'web') {
    // Native fallback: just show the ghost
    return (
      <View style={styles.wrap} onLayout={onLayout}>
        <Text style={[styles.ghost, size ? { fontSize: size * 0.6 } : {}]}>{char}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {size > 0 && (
        <WebCanvas
          key={`${charId}-${tick}`}
          charId={charId}
          char={char}
          size={size}
          onReplay={() => setTick(t => t + 1)}
        />
      )}
    </View>
  );
}

// ── web canvas sub-component (web only) ─────────────────────────────────────

function WebCanvas({
  charId, char, size, onReplay,
}: Props & { size: number; onReplay: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef(0);
  const [done, setDone] = useState(false);

  const strokes: StrokeSet = STROKE_DATA[charId] ?? [];
  const hasData = strokes.length > 0;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const s   = (size / COORD) * dpr;          // coordinate → physical pixel scale
    const w   = size * dpr;

    // Timing state stored on canvas element to survive closure
    const c = canvas as any;
    if (c.__animDone) return;

    const now = performance.now();
    if (!c.__startTime) c.__startTime = now;

    const elapsed = now - c.__startTime;

    // Compute which stroke we're on and its progress
    const TOTAL_MS = strokes.length * (STROKE_MS + PAUSE_MS);
    let strokeIdx = 0;
    let strokeT   = 1;
    let inPause   = false;

    if (!hasData) {
      // No stroke data: fade-reveal the ghost character over 1.5s
      const t = Math.min(1, elapsed / 1500);
      ctx.clearRect(0, 0, w, w);
      drawGrid(ctx, w);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + t * 0.5})`;
      ctx.font = `300 ${w * 0.72}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, w / 2, w / 2);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        c.__animDone = true;
        setDone(true);
      }
      return;
    }

    if (elapsed >= TOTAL_MS) {
      // Animation complete
      ctx.clearRect(0, 0, w, w);
      drawGrid(ctx, w);
      drawGhost(ctx, char, w);
      // Draw all strokes complete
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = LINE_W_RATIO * w;
      ctx.fillStyle = DONE_COLOR;
      ctx.strokeStyle = DONE_COLOR;
      for (const stroke of strokes) smoothStroke(ctx, stroke, s);
      // Draw all stroke start numbers
      for (let i = 0; i < strokes.length; i++) {
        drawStrokeNum(ctx, strokes[i][0], i + 1, s, false);
      }
      c.__animDone = true;
      setDone(true);
      return;
    }

    // Find current stroke
    let t = elapsed;
    for (let i = 0; i < strokes.length; i++) {
      if (t <= STROKE_MS) {
        strokeIdx = i;
        strokeT   = t / STROKE_MS;
        inPause   = false;
        break;
      }
      t -= STROKE_MS;
      if (t <= PAUSE_MS) {
        strokeIdx = i;
        strokeT   = 1;
        inPause   = true;
        break;
      }
      t -= PAUSE_MS;
      // stroke fully done, move to next
      strokeIdx = i + 1;
      strokeT   = 0;
    }

    // Draw frame
    ctx.clearRect(0, 0, w, w);
    drawGrid(ctx, w);
    drawGhost(ctx, char, w);

    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = LINE_W_RATIO * w;

    // Completed strokes (faded)
    ctx.fillStyle   = DONE_COLOR;
    ctx.strokeStyle = DONE_COLOR;
    for (let i = 0; i < strokeIdx; i++) {
      smoothStroke(ctx, strokes[i], s);
    }

    // Active stroke (full color)
    ctx.fillStyle   = ACTIVE_COLOR;
    ctx.strokeStyle = ACTIVE_COLOR;
    const current = partialStroke(strokes[strokeIdx], strokeT);
    smoothStroke(ctx, current, s);

    // Start-number dots for completed strokes
    for (let i = 0; i < strokeIdx; i++) {
      drawStrokeNum(ctx, strokes[i][0], i + 1, s, false);
    }
    // Active stroke number
    drawStrokeNum(ctx, strokes[strokeIdx][0], strokeIdx + 1, s, true);

    rafRef.current = requestAnimationFrame(animate);
  }, [charId, char, size, strokes, hasData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set physical resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, animate]);

  const canvasEl = React.createElement('canvas', {
    ref: (el: HTMLCanvasElement | null) => { canvasRef.current = el; },
    style: { display: 'block', borderRadius: 20 },
  });

  return (
    <View style={styles.canvasOuter}>
      {/* rounded background + border */}
      <View style={styles.canvasCard}>
        {canvasEl}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Stroke count badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {hasData ? `${strokes.length} stroke${strokes.length > 1 ? 's' : ''}` : 'trace guide'}
          </Text>
        </View>

        {done && (
          <TouchableOpacity
            style={styles.replayBtn}
            onPress={onReplay}
            activeOpacity={0.8}
          >
            <Text style={styles.replayText}>↺  Replay</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1,
  },
  ghost: {
    color: GUIDE_COLOR,
    textAlign: 'center',
    fontWeight: '300',
  },
  canvasOuter: {
    width: '100%',
  },
  canvasCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
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
  badgeText: {
    color: Colors.textDim,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  replayBtn: {
    backgroundColor: 'rgba(255,159,67,0.14)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  replayText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
