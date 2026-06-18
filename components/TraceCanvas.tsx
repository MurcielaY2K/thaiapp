import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, PanResponder, LayoutChangeEvent,
  TouchableOpacity, Platform, GestureResponderEvent,
} from 'react-native';
import { Colors } from '../constants/colors';

type Point = { x: number; y: number };

const STROKE = 14;
const FONT = '"Noto Sans Thai", "Thonburi", -apple-system, sans-serif';
const GRID_COLOR      = 'rgba(255,255,255,0.07)';
const GRID_DASH_COLOR = 'rgba(255,255,255,0.14)';
const GHOST_COLOR     = 'rgba(255,255,255,0.16)';

function speak(text: string) {
  if (Platform.OS !== 'web') return;
  const w = window as any;
  if (!w.speechSynthesis) return;
  w.speechSynthesis.cancel();
  const u = new w.SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = 0.7;
  const voices = w.speechSynthesis.getVoices?.() ?? [];
  const thai = voices.find((v: any) => /th(-|_)?/i.test(v.lang));
  if (thai) u.voice = thai;
  w.speechSynthesis.speak(u);
}

export default function TraceCanvas({ char }: { char: string }) {
  if (Platform.OS === 'web') return <WebTrace char={char} />;
  return <NativeTrace char={char} />;
}

// ── Web: real <canvas> with touch-action:none so the page never scrolls ──────
function WebTrace({ char }: { char: string }) {
  const [size, setSize] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const drawingRef = useRef(false);
  const showGuideRef = useRef(true);

  const onLayout = (e: LayoutChangeEvent) =>
    setSize(Math.round(e.nativeEvent.layout.width));

  useEffect(() => { showGuideRef.current = showGuide; redraw(); }, [showGuide]);

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv || !size) return;
    const dpr = window.devicePixelRatio || 1;
    const w = size * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, w, w);

    // grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID_COLOR;
    ctx.setLineDash([]);
    for (const pos of [w * 0.25, w * 0.75]) {
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(w, pos); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, w); ctx.stroke();
    }
    ctx.strokeStyle = GRID_DASH_COLOR;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, w / 2); ctx.lineTo(w, w / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, w); ctx.stroke();
    ctx.setLineDash([]);

    // ghost
    if (showGuideRef.current) {
      ctx.fillStyle = GHOST_COLOR;
      ctx.font = `300 ${w * 0.66}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, w / 2, w / 2);
    }

    // ink
    ctx.strokeStyle = Colors.accent;
    ctx.fillStyle = Colors.accent;
    ctx.lineWidth = STROKE * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokesRef.current) {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0].x * dpr, s[0].y * dpr, (STROKE * dpr) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(s[0].x * dpr, s[0].y * dpr);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x * dpr, s[i].y * dpr);
      ctx.stroke();
    }
  };

  // Set up canvas + pointer listeners
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !size) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = size * dpr;
    cv.height = size * dpr;
    cv.style.width = size + 'px';
    cv.style.height = size + 'px';
    redraw();

    const pos = (e: PointerEvent): Point => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      drawingRef.current = true;
      strokesRef.current.push([pos(e)]);
      cv.setPointerCapture?.(e.pointerId);
      redraw();
    };
    const move = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const cur = strokesRef.current[strokesRef.current.length - 1];
      const p = pos(e);
      const last = cur[cur.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= 2) {
        cur.push(p);
        redraw();
      }
    };
    const up = () => { drawingRef.current = false; };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', up);
    return () => {
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
      cv.removeEventListener('pointerleave', up);
    };
  }, [size, char]);

  // New character → wipe ink
  useEffect(() => { strokesRef.current = []; redraw(); }, [char]);

  const clear = () => { strokesRef.current = []; redraw(); };

  const canvasEl = React.createElement('canvas', {
    ref: (el: HTMLCanvasElement | null) => { canvasRef.current = el; },
    style: { display: 'block', borderRadius: 20, touchAction: 'none' },
  });

  return (
    <View>
      <View style={styles.canvas} onLayout={onLayout}>
        {size > 0 && canvasEl}
      </View>
      <View style={styles.tools}>
        <Tool label="Clear" icon="◳" onPress={clear} />
        <Tool label={showGuide ? 'Hide' : 'Show'} icon="👁" onPress={() => setShowGuide(g => !g)} />
        <Tool label="Listen" icon="🔊" onPress={() => speak(char)} />
      </View>
    </View>
  );
}

// ── Native fallback (View-based ink) ─────────────────────────────────────────
function NativeTrace({ char }: { char: string }) {
  const strokesRef = useRef<Point[][]>([]);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [showGuide, toggleGuide] = useReducer((x: boolean) => !x, true);

  const addPoint = (e: GestureResponderEvent, newStroke: boolean) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    const strokes = strokesRef.current;
    if (newStroke) { strokes.push([{ x, y }]); force(); return; }
    const cur = strokes[strokes.length - 1];
    if (!cur) return;
    const last = cur[cur.length - 1];
    if (Math.hypot(x - last.x, y - last.y) >= 2.2) { cur.push({ x, y }); force(); }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => addPoint(e, true),
      onPanResponderMove: (e) => addPoint(e, false),
    })
  ).current;

  const clear = () => { strokesRef.current = []; force(); };

  const dots: Point[] = [];
  for (const s of strokesRef.current) for (const p of s) dots.push(p);

  return (
    <View>
      <View style={styles.canvas}>
        <View style={[styles.gridLine, { top: '25%' }]} />
        <View style={[styles.gridLineDashed, { top: '50%' }]} />
        <View style={[styles.gridLine, { top: '75%' }]} />
        <View style={[styles.gridLineV, { left: '50%' }]} />
        {showGuide && (
          <View style={styles.ghostWrap} pointerEvents="none">
            <Text style={styles.ghost}>{char}</Text>
          </View>
        )}
        <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
          {dots.map((p, i) => (
            <View key={i} style={[styles.dot, { left: p.x - STROKE / 2, top: p.y - STROKE / 2 }]} />
          ))}
        </View>
      </View>
      <View style={styles.tools}>
        <Tool label="Clear" icon="◳" onPress={clear} />
        <Tool label={showGuide ? 'Hide' : 'Show'} icon="👁" onPress={toggleGuide} />
      </View>
    </View>
  );
}

function Tool({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tool} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  gridLineDashed: {
    position: 'absolute', left: 0, right: 0, height: 1,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed',
  },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  ghostWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ghost: { fontSize: 200, lineHeight: 240, color: GHOST_COLOR, fontWeight: '300' },
  dot: { position: 'absolute', width: STROKE, height: STROKE, borderRadius: STROKE / 2, backgroundColor: Colors.accent },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 18 },
  tool: {
    alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 18,
    borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, minWidth: 78,
  },
  toolIcon: { fontSize: 20, color: Colors.text },
  toolLabel: { fontSize: 12, color: Colors.textDim, letterSpacing: 0.5 },
});
