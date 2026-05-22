import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { RetroButton } from '../ui/RetroButton';
import { Colors } from '../../constants/colors';

type Direction = '←' | '→' | '↑' | '↓';
const DIRECTIONS: Direction[] = ['←', '→', '↑', '↓'];
const DIR_COLORS: Record<Direction, string> = {
  '←': Colors.neon.cyan,
  '→': Colors.neon.pink,
  '↑': Colors.neon.yellow,
  '↓': Colors.neon.purple,
};
const DIR_EMOJI: Record<Direction, string> = {
  '←': '⬅️',
  '→': '➡️',
  '↑': '⬆️',
  '↓': '⬇️',
};

interface Note {
  id: number;
  dir: Direction;
  y: Animated.Value;
  hit: boolean;
}

let noteId = 0;

const SEQUENCES = [
  ['←', '→', '↑', '↓'],
  ['↑', '↑', '←', '→'],
  ['→', '↓', '→', '↑'],
  ['←', '↓', '↑', '→'],
];

interface Props {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

type Phase = 'menu' | 'playing' | 'gameover';

export function DanceBattle({ onGameOver, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [notes, setNotes] = useState<Note[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const notesRef = useRef<Note[]>([]);
  const isPlaying = useRef(false);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sequenceIdx = useRef(0);
  const noteInSequence = useRef(0);

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 600);
  };

  const endGame = useCallback(() => {
    isPlaying.current = false;
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (gameTimer.current) clearInterval(gameTimer.current);
    notesRef.current = [];
    setNotes([]);
    if (scoreRef.current > highScore) setHighScore(scoreRef.current);
    setPhase('gameover');
    onGameOver(scoreRef.current);
  }, [highScore, onGameOver]);

  const spawnNote = useCallback(() => {
    const seq = SEQUENCES[sequenceIdx.current % SEQUENCES.length];
    const dir = seq[noteInSequence.current % seq.length] as Direction;
    noteInSequence.current++;
    if (noteInSequence.current >= seq.length) {
      noteInSequence.current = 0;
      sequenceIdx.current++;
    }

    const note: Note = {
      id: noteId++,
      dir,
      y: new Animated.Value(-40),
      hit: false,
    };
    notesRef.current = [...notesRef.current, note];
    setNotes([...notesRef.current]);

    const speed = Math.max(700, 1600 - scoreRef.current * 5);
    Animated.timing(note.y, {
      toValue: 300,
      duration: speed,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !note.hit) {
        // missed
        comboRef.current = 0;
        setCombo(0);
        notesRef.current = notesRef.current.filter(n => n.id !== note.id);
        setNotes([...notesRef.current]);
        showFeedback('MISS!', Colors.ui.danger);
      }
    });
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    sequenceIdx.current = 0;
    noteInSequence.current = 0;
    notesRef.current = [];
    isPlaying.current = true;
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
    setNotes([]);
    setPhase('playing');

    spawnTimer.current = setInterval(spawnNote, 1000);
    gameTimer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const pressDir = (dir: Direction) => {
    if (phase !== 'playing') return;

    const TARGET_Y = 220;
    const closest = notesRef.current
      .filter(n => n.dir === dir && !n.hit)
      .sort((a, b) => {
        const ay = Math.abs(((a.y as any)._value ?? 0) - TARGET_Y);
        const by = Math.abs(((b.y as any)._value ?? 0) - TARGET_Y);
        return ay - by;
      })[0];

    if (!closest) return;

    const yVal = (closest.y as any)._value ?? 0;
    const dist = Math.abs(yVal - TARGET_Y);

    if (dist < 30) {
      closest.hit = true;
      notesRef.current = notesRef.current.filter(n => n.id !== closest.id);
      setNotes([...notesRef.current]);

      comboRef.current++;
      setCombo(comboRef.current);
      const points = dist < 12 ? 20 : 10;
      const bonus = Math.floor(comboRef.current / 3) * 5;
      scoreRef.current += points + bonus;
      setScore(scoreRef.current);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (dist < 12) {
        showFeedback('PERFECT! ✨', Colors.neon.yellow);
      } else {
        showFeedback(`GOOD! ×${comboRef.current}`, Colors.neon.green);
      }
    }
  };

  useEffect(() => () => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (gameTimer.current) clearInterval(gameTimer.current);
  }, []);

  if (phase === 'menu') return (
    <View style={styles.center}>
      <PixelText size={48}>💃</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.pink} glow>DANCE BATTLE</PixelText>
      <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
        Hit the arrows as they reach{'\n'}the target zone! Build combos!
      </PixelText>
      <PixelText size={12} color={Colors.neon.green}>High Score: {highScore}</PixelText>
      <RetroButton label="Dance!" onPress={startGame} color={Colors.neon.pink} size="lg" emoji="🕺" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  if (phase === 'gameover') return (
    <View style={styles.center}>
      <PixelText size={48}>🎭</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.pink} glow>DANCE OVER!</PixelText>
      <PixelText size={14} color={Colors.neon.yellow}>Score: {score}</PixelText>
      <PixelText size={12} color={Colors.neon.green}>+{Math.floor(score / 2)} coins earned!</PixelText>
      {score >= highScore && score > 0 && (
        <PixelText size={12} color={Colors.neon.cyan}>🏆 New High Score!</PixelText>
      )}
      <RetroButton label="Dance Again" onPress={startGame} color={Colors.neon.pink} emoji="▶" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  return (
    <View style={styles.game}>
      <View style={styles.hud}>
        <PixelText size={12} color={Colors.neon.pink}>⏱ {timeLeft}s</PixelText>
        <PixelText size={12} color={Colors.neon.yellow}>Score: {score}</PixelText>
        <PixelText size={12} color={Colors.neon.cyan}>×{combo} combo</PixelText>
      </View>

      {/* Note lanes */}
      <View style={styles.laneArea}>
        {DIRECTIONS.map(dir => (
          <View key={dir} style={styles.lane}>
            {/* Target zone */}
            <View style={[styles.targetZone, { borderColor: DIR_COLORS[dir] }]}>
              <PixelText size={18} color={DIR_COLORS[dir]}>{dir}</PixelText>
            </View>
            {/* Falling notes */}
            {notes
              .filter(n => n.dir === dir)
              .map(note => (
                <Animated.View
                  key={note.id}
                  style={[
                    styles.note,
                    { borderColor: DIR_COLORS[dir], transform: [{ translateY: note.y }] },
                  ]}
                >
                  <PixelText size={16} color={DIR_COLORS[dir]}>{dir}</PixelText>
                </Animated.View>
              ))}
          </View>
        ))}

        {/* Feedback */}
        {feedback && (
          <View style={styles.feedbackBox}>
            <PixelText size={18} color={feedback.color} glow>{feedback.text}</PixelText>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.btnGrid}>
        <View style={styles.btnRow}>
          {(['↑'] as Direction[]).map(dir => (
            <TouchableOpacity
              key={dir}
              style={[styles.dirBtn, { borderColor: DIR_COLORS[dir] }]}
              onPress={() => pressDir(dir)}
            >
              <PixelText size={22} color={DIR_COLORS[dir]}>{DIR_EMOJI[dir]}</PixelText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.btnRow}>
          {(['←', '↓', '→'] as Direction[]).map(dir => (
            <TouchableOpacity
              key={dir}
              style={[styles.dirBtn, { borderColor: DIR_COLORS[dir] }]}
              onPress={() => pressDir(dir)}
            >
              <PixelText size={22} color={DIR_COLORS[dir]}>{DIR_EMOJI[dir]}</PixelText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 14, padding: 24,
  },
  game: { flex: 1 },
  hud: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  laneArea: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 12,
    gap: 4,
    position: 'relative',
  },
  lane: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    overflow: 'visible',
    position: 'relative',
    alignItems: 'center',
  },
  targetZone: {
    position: 'absolute',
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: Colors.bg.mid,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  note: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBox: {
    position: 'absolute',
    top: '40%',
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  btnGrid: {
    padding: 12,
    gap: 8,
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dirBtn: {
    width: 64,
    height: 64,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});
