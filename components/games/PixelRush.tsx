import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { RetroButton } from '../ui/RetroButton';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const GROUND_Y = 220;
const PLAYER_X = 60;
const OBSTACLE_START = width - 32;
const JUMP_HEIGHT = 90;

interface Obstacle {
  id: number;
  x: Animated.Value;
  height: number;
  emoji: string;
}

let obstacleId = 0;

interface Props {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

type Phase = 'menu' | 'playing' | 'gameover';

export function PixelRush({ onGameOver, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isJumping, setIsJumping] = useState(false);

  const playerY = useRef(new Animated.Value(0)).current;
  const scoreRef = useRef(0);
  const isJumpingRef = useRef(false);
  const isPlaying = useRef(false);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const collisionTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const playerYVal = useRef(0);

  useEffect(() => {
    const id = playerY.addListener(({ value }) => { playerYVal.current = value; });
    return () => playerY.removeListener(id);
  }, []);

  const endGame = useCallback(() => {
    isPlaying.current = false;
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (collisionTimer.current) clearInterval(collisionTimer.current);
    if (scoreTimer.current) clearInterval(scoreTimer.current);
    obstaclesRef.current = [];
    setObstacles([]);
    if (scoreRef.current > highScore) setHighScore(scoreRef.current);
    setPhase('gameover');
    onGameOver(scoreRef.current);
  }, [highScore, onGameOver]);

  const spawnObstacle = useCallback(() => {
    const types = [
      { emoji: '🌵', height: 36 },
      { emoji: '🪨', height: 24 },
      { emoji: '⚡', height: 48 },
      { emoji: '🔥', height: 32 },
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const obs: Obstacle = {
      id: obstacleId++,
      x: new Animated.Value(OBSTACLE_START),
      ...type,
    };
    obstaclesRef.current = [...obstaclesRef.current, obs];
    setObstacles([...obstaclesRef.current]);

    const speed = Math.max(900, 2800 - scoreRef.current * 10);
    Animated.timing(obs.x, {
      toValue: -60,
      duration: speed,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        obstaclesRef.current = obstaclesRef.current.filter(o => o.id !== obs.id);
        setObstacles([...obstaclesRef.current]);
      }
    });
  }, []);

  const checkCollisions = useCallback(() => {
    const PLAYER_FEET = GROUND_Y - playerYVal.current;
    const PLAYER_TOP = PLAYER_FEET - 36;

    obstaclesRef.current.forEach(obs => {
      const xVal = (obs.x as any)._value ?? 999;
      const isOverlappingX = xVal > PLAYER_X - 20 && xVal < PLAYER_X + 36;
      const isOverlappingY = PLAYER_FEET > GROUND_Y - obs.height;

      if (isOverlappingX && isOverlappingY && !isJumpingRef.current) {
        endGame();
      }
    });
  }, [endGame]);

  const jump = useCallback(() => {
    if (isJumpingRef.current || phase !== 'playing') return;
    isJumpingRef.current = true;
    setIsJumping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(playerY, { toValue: JUMP_HEIGHT, duration: 280, useNativeDriver: true }),
      Animated.timing(playerY, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start(() => {
      isJumpingRef.current = false;
      setIsJumping(false);
    });
  }, [phase, playerY]);

  const startGame = () => {
    scoreRef.current = 0;
    isJumpingRef.current = false;
    obstaclesRef.current = [];
    isPlaying.current = true;
    playerY.setValue(0);
    setScore(0);
    setIsJumping(false);
    setObstacles([]);
    setPhase('playing');

    spawnTimer.current = setInterval(spawnObstacle, 1800);
    collisionTimer.current = setInterval(checkCollisions, 40);
    scoreTimer.current = setInterval(() => {
      scoreRef.current += 1;
      setScore(s => s + 1);
    }, 200);
  };

  useEffect(() => () => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (collisionTimer.current) clearInterval(collisionTimer.current);
    if (scoreTimer.current) clearInterval(scoreTimer.current);
  }, []);

  if (phase === 'menu') return (
    <View style={styles.center}>
      <PixelText size={48}>⚡</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.green} glow>PIXEL RUSH</PixelText>
      <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
        Tap to jump over obstacles!{'\n'}How far can you go?
      </PixelText>
      <PixelText size={12} color={Colors.neon.green}>High Score: {highScore}</PixelText>
      <RetroButton label="Rush!" onPress={startGame} color={Colors.neon.green} size="lg" emoji="⚡" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  if (phase === 'gameover') return (
    <View style={styles.center}>
      <PixelText size={48}>💀</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.green} glow>WIPED OUT!</PixelText>
      <PixelText size={14} color={Colors.neon.yellow}>Distance: {score}m</PixelText>
      <PixelText size={12} color={Colors.neon.green}>+{score * 2} coins earned!</PixelText>
      {score >= highScore && score > 0 && (
        <PixelText size={12} color={Colors.neon.cyan}>🏆 New Record!</PixelText>
      )}
      <RetroButton label="Rush Again" onPress={startGame} color={Colors.neon.green} emoji="▶" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  return (
    <TouchableOpacity style={styles.game} onPress={jump} activeOpacity={1}>
      <View style={styles.hud}>
        <PixelText size={14} color={Colors.neon.green}>Dist: {score}m</PixelText>
        <PixelText size={12} color={Colors.ui.textDim}>TAP TO JUMP</PixelText>
      </View>

      <View style={styles.world}>
        {/* Ground */}
        <View style={styles.ground} />

        {/* Player */}
        <Animated.View
          style={[
            styles.player,
            { transform: [{ translateY: playerY.interpolate({ inputRange: [0, JUMP_HEIGHT], outputRange: [0, -JUMP_HEIGHT] }) }] },
          ]}
        >
          <PixelText size={32}>{isJumping ? '🦘' : '🐾'}</PixelText>
        </Animated.View>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <Animated.View
            key={obs.id}
            style={[
              styles.obstacle,
              { bottom: 8, transform: [{ translateX: obs.x }] },
            ]}
          >
            <PixelText style={{ fontSize: obs.height - 4 }}>{obs.emoji}</PixelText>
          </Animated.View>
        ))}

        {/* Scrolling ground tiles */}
        <View style={styles.groundDecor}>
          {Array.from({ length: 10 }).map((_, i) => (
            <PixelText key={i} size={10} color={Colors.ui.border}>▬</PixelText>
          ))}
        </View>
      </View>

      <View style={styles.tapHint}>
        <PixelText size={11} color={Colors.ui.textDim}>TAP ANYWHERE TO JUMP</PixelText>
      </View>
    </TouchableOpacity>
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
  world: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    position: 'relative',
  },
  ground: {
    position: 'absolute',
    bottom: 8,
    left: 0, right: 0,
    height: 3,
    backgroundColor: Colors.ui.border,
  },
  groundDecor: {
    position: 'absolute',
    bottom: 4,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  player: {
    position: 'absolute',
    left: PLAYER_X - 30,
    bottom: 10,
  },
  obstacle: {
    position: 'absolute',
  },
  tapHint: {
    padding: 12,
    alignItems: 'center',
  },
});
