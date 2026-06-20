import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, PanResponder, LayoutChangeEvent,
  TouchableOpacity, Platform, GestureResponderEvent, Animated, Easing,
} from 'react-native';
import { Colors } from '../constants/colors';

type Point = { x: number; y: number };

const STROKE = 14;
const FONT = '"Noto Sans Thai", "Thonburi", -apple-system, sans-serif';
const GRID_COLOR      = 'rgba(255,255,255,0.07)';
const GRID_DASH_COLOR = 'rgba(255,255,255,0.14)';
const GHOST_COLOR     = 'rgba(255,255,255,0.15)';
const HIT_COLOR       = 'rgba(46,204,113,0.40)';
const MISS_COLOR      = 'rgba(231,76,60,0.38)';

function speak(text: string, lang = 'th-TH') {
  if (Platform.OS !== 'web') return;
  const w = window as any;
  if (!w.speechSynthesis) return;
  w.speechSynthesis.cancel();
  const u = new w.SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.7;
  if (lang.startsWith('th')) {
    const thai = (w.speechSynthesis.getVoices?.() ?? [])
      .find((v: any) => /th(-|_)?/i.test(v.lang));
    if (thai) u.voice = thai;
  }
  w.speechSynthesis.speak(u);
}

export default function TraceCanvas({ char, charName, size }: { char: string; charName?: string; size?: number }) {
  if (Platform.OS === 'web') return <WebTrace char={char} charName={charName} fixedSize={size} />;
  return <NativeTrace char={char} size={size} />;
}

// ── Web: canvas + pointer capture + accuracy scanner ─────────────────────────

type ScanState = 'idle' | 'scanning' | 'done';

function WebTrace({ char, charName, fixedSize }: { char: string; charName?: string; fixedSize?: number }) {
  const [measured, setMeasured]     = useState(0);
  const [showGuide, setShowGuide]   = useState(true);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [scanState, setScanState]   = useState<ScanState>('idle');
  const [accuracy, setAccuracy]     = useState<number | null>(null);

  const size = fixedSize && fixedSize > 0 ? Math.round(fixedSize) : measured;

  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const strokesRef  = useRef<Point[][]>([]);
  const drawingRef  = useRef(false);
  const showRef     = useRef(true);
  const scanRafRef  = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    if (!fixedSize) setMeasured(Math.round(e.nativeEvent.layout.width));
  };

  // ── draw everything onto main canvas ───────────────────────────────────────
  const redraw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !size) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.width; // already in physical px
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, w, w);

    // grid
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeStyle = GRID_COLOR;
    for (const p of [w * 0.25, w * 0.75]) {
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, w); ctx.stroke();
    }
    ctx.strokeStyle = GRID_DASH_COLOR;
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.beginPath(); ctx.moveTo(0, w / 2); ctx.lineTo(w, w / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, w); ctx.stroke();
    ctx.setLineDash([]);

    // ghost — auto-scale font so wide vowels (เอะ etc.) don't overflow
    if (showRef.current) {
      ctx.fillStyle = GHOST_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let ghostSize = w * 0.66;
      ctx.font = `300 ${ghostSize}px ${FONT}`;
      const gw = ctx.measureText(char).width;
      if (gw > w * 0.85) ghostSize = Math.floor(ghostSize * (w * 0.85) / gw);
      ctx.font = `300 ${ghostSize}px ${FONT}`;
      ctx.fillText(char, w / 2, w / 2);
    }

    // user ink
    ctx.strokeStyle = Colors.accent;
    ctx.fillStyle   = Colors.accent;
    ctx.lineWidth   = STROKE * dpr;
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
  }, [size, char]);

  // ── pointer setup ──────────────────────────────────────────────────────────
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
      setHasStrokes(true);
      setScanState('idle');
      setAccuracy(null);
      redraw();
    };
    const move = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const cur = strokesRef.current[strokesRef.current.length - 1];
      const p = pos(e);
      const last = cur[cur.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= 2) { cur.push(p); redraw(); }
    };
    const up = () => { drawingRef.current = false; };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    return () => {
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
    };
  }, [size, char, redraw]);

  // new character → reset
  useEffect(() => {
    cancelAnimationFrame(scanRafRef.current);
    strokesRef.current = [];
    setHasStrokes(false);
    setScanState('idle');
    setAccuracy(null);
    redraw();
  }, [char]);

  useEffect(() => { showRef.current = showGuide; redraw(); }, [showGuide, redraw]);

  // ── accuracy scanner ───────────────────────────────────────────────────────
  const startScan = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !size || scanState === 'scanning') return;
    cancelAnimationFrame(scanRafRef.current);
    setScanState('scanning');
    setAccuracy(null);

    const dpr = window.devicePixelRatio || 1;
    const w   = cv.width;
    const ctx = cv.getContext('2d')!;

    // Snapshot the current drawing (grid + ghost + ink)
    const snapshot = ctx.getImageData(0, 0, w, w);

    // Build reference hit-zone: character drawn thick (forgiving)
    const refCv = document.createElement('canvas');
    refCv.width = w; refCv.height = w;
    const refCtx = refCv.getContext('2d')!;
    refCtx.fillStyle   = '#fff';
    refCtx.strokeStyle = '#fff';
    refCtx.textAlign = 'center';
    refCtx.textBaseline = 'middle';
    let refFontSize = w * 0.66;
    refCtx.font = `300 ${refFontSize}px ${FONT}`;
    const refTW = refCtx.measureText(char).width;
    if (refTW > w * 0.85) refFontSize = Math.floor(refFontSize * (w * 0.85) / refTW);
    refCtx.font = `300 ${refFontSize}px ${FONT}`;
    refCtx.lineWidth = STROKE * dpr * 3.0; // very generous acceptance zone (finger tracing)
    refCtx.strokeText(char, w / 2, w / 2);
    refCtx.fillText(char, w / 2, w / 2);
    const refData = refCtx.getImageData(0, 0, w, w).data;

    // Build user-ink-only canvas
    const inkCv = document.createElement('canvas');
    inkCv.width = w; inkCv.height = w;
    const inkCtx = inkCv.getContext('2d')!;
    inkCtx.fillStyle   = '#fff';
    inkCtx.strokeStyle = '#fff';
    inkCtx.lineWidth   = STROKE * dpr;
    inkCtx.lineCap = 'round'; inkCtx.lineJoin = 'round';
    for (const s of strokesRef.current) {
      if (s.length === 1) {
        inkCtx.beginPath();
        inkCtx.arc(s[0].x * dpr, s[0].y * dpr, (STROKE * dpr) / 2, 0, Math.PI * 2);
        inkCtx.fill();
        continue;
      }
      inkCtx.beginPath();
      inkCtx.moveTo(s[0].x * dpr, s[0].y * dpr);
      for (let i = 1; i < s.length; i++) inkCtx.lineTo(s[i].x * dpr, s[i].y * dpr);
      inkCtx.stroke();
    }
    const inkData = inkCtx.getImageData(0, 0, w, w).data;

    // Pre-compute per-column results
    const cols = w;
    const rows = w;
    const colResult: ('hit' | 'miss' | 'empty')[] = new Array(cols);
    let refCols = 0, hitCols = 0;
    for (let x = 0; x < cols; x++) {
      let hasRef = false, hasInk = false;
      for (let y = 0; y < rows; y++) {
        const i = (y * cols + x) * 4;
        if (refData[i + 3] > 20) hasRef = true;
        if (inkData[i + 3] > 20) hasInk = true;
        if (hasRef && hasInk) break;
      }
      if (!hasRef) { colResult[x] = 'empty'; continue; }
      refCols++;
      if (hasInk) { colResult[x] = 'hit'; hitCols++; } else colResult[x] = 'miss';
    }
    // Forgiving curve: tracing with a finger on glass is imprecise, so reward
    // coverage generously rather than demanding pixel-perfect overlap.
    const raw = refCols > 0 ? (hitCols / refCols) * 100 : 0;
    const finalAccuracy = Math.min(100, Math.round(raw * 1.18 + 8));

    // Animate the scan
    const SPEED = Math.ceil(cols / 55); // finish in ~55 frames
    let scanX = 0;

    const step = () => {
      ctx.putImageData(snapshot, 0, 0);

      // Draw color overlay up to scanX
      for (let x = 0; x < scanX; x++) {
        const r = colResult[x];
        if (r === 'empty') continue;
        ctx.fillStyle = r === 'hit' ? HIT_COLOR : MISS_COLOR;
        ctx.fillRect(x, 0, 1, w);
      }

      // Scan line
      if (scanX < cols) {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = Math.max(1, dpr);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, w);
        ctx.stroke();
      }

      scanX += SPEED;
      if (scanX <= cols) {
        scanRafRef.current = requestAnimationFrame(step);
      } else {
        setAccuracy(finalAccuracy);
        setScanState('done');
      }
    };
    scanRafRef.current = requestAnimationFrame(step);
  }, [size, char, scanState]);

  const clear = () => {
    cancelAnimationFrame(scanRafRef.current);
    strokesRef.current = [];
    setHasStrokes(false);
    setScanState('idle');
    setAccuracy(null);
    redraw();
  };

  const canvasEl = React.createElement('canvas', {
    ref: (el: HTMLCanvasElement | null) => { canvasRef.current = el; },
    style: { display: 'block', borderRadius: 20, touchAction: 'none' },
  });

  const celebAnim = useRef(new Animated.Value(0)).current;
  const prevAccuracy = useRef<number | null>(null);

  useEffect(() => {
    if (accuracy !== null && accuracy >= 65 && prevAccuracy.current === null) {
      celebAnim.setValue(0);
      Animated.sequence([
        Animated.timing(celebAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(celebAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
    prevAccuracy.current = accuracy;
  }, [accuracy]);

  const scoreColor =
    accuracy == null ? Colors.text :
    accuracy >= 65   ? Colors.correct :
    accuracy >= 35   ? Colors.accent  :
    Colors.wrong;

  const canvasBoxStyle = fixedSize
    ? [styles.canvas, { width: size, height: size }]
    : styles.canvas;

  return (
    <View style={styles.wrap}>
      <View style={canvasBoxStyle} onLayout={onLayout}>
        {size > 0 && canvasEl}

        {/* Score badge — overlays the canvas so layout height never shifts */}
        {accuracy !== null && (
          <View style={styles.scoreBadge}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{accuracy}%</Text>
            <Text style={styles.scoreLabel}>
              {accuracy >= 65 ? '🎉 Great!' : accuracy >= 35 ? '👍 Good effort' : '💪 Keep practicing'}
            </Text>
          </View>
        )}

        {/* Celebration burst */}
        {accuracy !== null && accuracy >= 65 && (
          <Animated.Text style={[styles.celebEmoji, {
            opacity: celebAnim,
            transform: [{ scale: celebAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.4] }) }],
          }]}>
            ✨
          </Animated.Text>
        )}
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        <Tool label="Clear" icon="◳" onPress={clear} />
        <Tool label={showGuide ? 'Hide' : 'Show'} icon="👁" onPress={() => setShowGuide(g => !g)} />
        {hasStrokes && scanState !== 'scanning' && (
          <Tool
            label={scanState === 'done' ? 'Re-scan' : 'Check'}
            icon="⟵⟶"
            onPress={startScan}
            accent
          />
        )}
        <Tool label="Listen" icon="🔊" onPress={() => speak(charName ?? char, charName ? 'en-US' : 'th-TH')} />
      </View>
    </View>
  );
}

// ── Native fallback ───────────────────────────────────────────────────────────
function NativeTrace({ char, size }: { char: string; size?: number }) {
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

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => addPoint(e, true),
    onPanResponderMove: (e) => addPoint(e, false),
  })).current;

  const clear = () => { strokesRef.current = []; force(); };
  const dots: Point[] = [];
  for (const s of strokesRef.current) for (const p of s) dots.push(p);

  return (
    <View style={styles.wrap}>
      <View style={[styles.canvas, size ? { width: size, height: size } : null]}>
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

function Tool({
  label, icon, onPress, accent,
}: { label: string; icon: string; onPress: () => void; accent?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.tool, accent && styles.toolAccent]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={[styles.toolLabel, accent && styles.toolLabelAccent]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
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
  scoreBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(13,13,26,0.82)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreNum: { fontSize: 20, fontWeight: '700' },
  scoreLabel: { color: Colors.textDim, fontSize: 14 },
  celebEmoji: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 52,
    textAlign: 'center',
  },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  tool: {
    alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, minWidth: 68,
  },
  toolAccent: { backgroundColor: 'rgba(255,159,67,0.12)', borderColor: Colors.accent },
  toolIcon: { fontSize: 18, color: Colors.text },
  toolLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 0.5 },
  toolLabelAccent: { color: Colors.accent },
});
