import React, { useMemo, useReducer, useRef } from 'react';
import {
  View, Text, StyleSheet, PanResponder, LayoutChangeEvent,
  TouchableOpacity, Platform, GestureResponderEvent,
} from 'react-native';
import { Colors } from '../constants/colors';

type Point = { x: number; y: number };

const STROKE = 14;          // visual thickness of the user's ink
const MIN_DIST = 2.2;       // min px between captured points

function speak(text: string) {
  // Web speech synthesis — works in mobile Safari/Chrome with a Thai voice.
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
  const strokesRef = useRef<Point[][]>([]);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [showGuide, toggleGuide] = useReducer((x: boolean) => !x, true);
  const sizeRef = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    sizeRef.current = e.nativeEvent.layout.width;
  };

  const addPoint = (e: GestureResponderEvent, newStroke: boolean) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    const strokes = strokesRef.current;
    if (newStroke) {
      strokes.push([{ x, y }]);
      force();
      return;
    }
    const cur = strokes[strokes.length - 1];
    if (!cur) return;
    const last = cur[cur.length - 1];
    if (Math.hypot(x - last.x, y - last.y) >= MIN_DIST) {
      cur.push({ x, y });
      force();
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => addPoint(e, true),
        onPanResponderMove: (e) => addPoint(e, false),
      }),
    []
  );

  const clear = () => {
    strokesRef.current = [];
    force();
  };

  // Flatten all points into ink dots. Dense enough to read as continuous lines.
  const dots: Point[] = [];
  for (const s of strokesRef.current) for (const p of s) dots.push(p);

  return (
    <View>
      <View style={styles.canvas} onLayout={onLayout}>
        {/* Practice grid */}
        <View style={[styles.gridLine, { top: '25%' }]} />
        <View style={[styles.gridLineDashed, { top: '50%' }]} />
        <View style={[styles.gridLine, { top: '75%' }]} />
        <View style={[styles.gridLineV, { left: '50%' }]} />

        {/* Ghost character to trace over */}
        {showGuide && (
          <View style={styles.ghostWrap} pointerEvents="none">
            <Text style={styles.ghost}>{char}</Text>
          </View>
        )}

        {/* Drawing layer (captures touch, holds ink) */}
        <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
          {dots.map((p, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { left: p.x - STROKE / 2, top: p.y - STROKE / 2 },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        <Tool label="Clear" icon="◳" onPress={clear} />
        <Tool label={showGuide ? 'Hide' : 'Show'} icon="👁" onPress={toggleGuide} />
        {Platform.OS === 'web' && (
          <Tool label="Listen" icon="🔊" onPress={() => speak(char)} />
        )}
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
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gridLineDashed: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ghostWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    fontSize: 200,
    lineHeight: 240,
    color: 'rgba(255,255,255,0.16)',
    fontWeight: '300',
  },
  dot: {
    position: 'absolute',
    width: STROKE,
    height: STROKE,
    borderRadius: STROKE / 2,
    backgroundColor: Colors.accent,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 18,
  },
  tool: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 78,
  },
  toolIcon: { fontSize: 20, color: Colors.text },
  toolLabel: { fontSize: 12, color: Colors.textDim, letterSpacing: 0.5 },
});
