import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { RetroButton } from '../ui/RetroButton';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const ROAD_W = width - 32;
const LANE_COUNT = 3;
const LANE_W = ROAD_W / LANE_COUNT;
const CAR_H = 48;
const PLAYER_H = 52;

interface ObstacleCar {
  id: number;
  lane: number;
  y: Animated.Value;
  emoji: string;
}

let obstacleId = 0;

interface Props {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

type State = 'menu' | 'playing' | 'gameover';

export function RetroRace({ onGameOver, onBack }: Props) {
  const [gameState, setGameState] = useState<State>('menu');
  const [playerLane, setPlayerLane] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [obstacles, setObstacles] = useState<ObstacleCar[]>([]);

  const playerLaneRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const isPlaying = useRef(false);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const collisionTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const obstaclesRef = useRef<ObstacleCar[]>([]);

  const endGame = useCallback(() => {
    isPlaying.current = false;
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (collisionTimer.current) clearInterval(collisionTimer.current);
    if (scoreTimer.current) clearInterval(scoreTimer.current);
    obstaclesRef.current = [];
    setObstacles([]);
    if (scoreRef.current > highScore) setHighScore(scoreRef.current);
    setGameState('gameover');
    onGameOver(scoreRef.current * 3);
  }, [highScore, onGameOver]);

  const spawnObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const emojis = ['🚗', '🚕', '🚙', '🏎️', '🚓'];
    const car: ObstacleCar = {
      id: obstacleId++,
      lane,
      y: new Animated.Value(-CAR_H),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    };
    obstaclesRef.current = [...obstaclesRef.current, car];
    setObstacles([...obstaclesRef.current]);

    const speed = Math.max(900, 2200 - scoreRef.current * 8);
    Animated.timing(car.y, {
      toValue: 360,
      duration: speed,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        obstaclesRef.current = obstaclesRef.current.filter(c => c.id !== car.id);
        setObstacles([...obstaclesRef.current]);
      }
    });
  }, []);

  const checkCollisions = useCallback(() => {
    const PLAYER_Y = 290;
    obstaclesRef.current.forEach(car => {
      const yVal = (car.y as any)._value ?? -99;
      if (
        car.lane === playerLaneRef.current &&
        yVal >= PLAYER_Y - 20 &&
        yVal <= PLAYER_Y + 20
      ) {
        obstaclesRef.current = obstaclesRef.current.filter(c => c.id !== car.id);
        setObstacles([...obstaclesRef.current]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) endGame();
      }
    });
  }, [endGame]);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    playerLaneRef.current = 1;
    isPlaying.current = true;
    obstaclesRef.current = [];
    setScore(0);
    setLives(3);
    setPlayerLane(1);
    setObstacles([]);
    setGameState('playing');

    spawnTimer.current = setInterval(spawnObstacle, 1400);
    collisionTimer.current = setInterval(checkCollisions, 60);
    scoreTimer.current = setInterval(() => {
      scoreRef.current += 1;
      setScore(s => s + 1);
    }, 400);
  };

  const moveLeft = () => {
    const next = Math.max(0, playerLaneRef.current - 1);
    playerLaneRef.current = next;
    setPlayerLane(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveRight = () => {
    const next = Math.min(LANE_COUNT - 1, playerLaneRef.current + 1);
    playerLaneRef.current = next;
    setPlayerLane(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => () => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (collisionTimer.current) clearInterval(collisionTimer.current);
    if (scoreTimer.current) clearInterval(scoreTimer.current);
  }, []);

  const laneX = (lane: number) => lane * LANE_W + LANE_W / 2 - 16;

  if (gameState === 'menu') return (
    <View style={styles.center}>
      <PixelText size={48}>🏎️</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.cyan} glow>RETRO RACE</PixelText>
      <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
        Dodge the traffic!{'\n'}Use ← → to switch lanes.
      </PixelText>
      <PixelText size={12} color={Colors.neon.green}>High Score: {highScore}</PixelText>
      <RetroButton label="Race!" onPress={startGame} color={Colors.neon.cyan} size="lg" emoji="🚦" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  if (gameState === 'gameover') return (
    <View style={styles.center}>
      <PixelText size={48}>💥</PixelText>
      <PixelText variant="title" size={18} color={Colors.ui.danger} glow>CRASH!</PixelText>
      <PixelText size={14} color={Colors.neon.yellow}>Distance: {score}</PixelText>
      <PixelText size={12} color={Colors.neon.green}>+{score * 3} 🪙 coins earned!</PixelText>
      <RetroButton label="Race Again" onPress={startGame} color={Colors.neon.cyan} emoji="▶" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  return (
    <View style={styles.game}>
      <View style={styles.hud}>
        <View style={styles.liveRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PixelText key={i} size={14}>{i < lives ? '❤️' : '🖤'}</PixelText>
          ))}
        </View>
        <PixelText size={14} color={Colors.neon.cyan}>Dist: {score}</PixelText>
      </View>

      {/* Road */}
      <View style={styles.road}>
        {/* Lane dividers */}
        {[1, 2].map(i => (
          <View key={i} style={[styles.laneDivider, { left: i * LANE_W }]} />
        ))}

        {/* Obstacles */}
        {obstacles.map(car => (
          <Animated.Text
            key={car.id}
            style={[
              styles.obstacleCar,
              {
                left: laneX(car.lane),
                transform: [{ translateY: car.y }],
              },
            ]}
          >
            {car.emoji}
          </Animated.Text>
        ))}

        {/* Player */}
        <View style={[styles.playerCar, { left: laneX(playerLane) }]}>
          <PixelText size={32}>🐾</PixelText>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={moveLeft}>
          <PixelText size={28} color={Colors.neon.cyan}>◄</PixelText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={moveRight}>
          <PixelText size={28} color={Colors.neon.cyan}>►</PixelText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  game: {
    flex: 1,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveRow: { flexDirection: 'row', gap: 4 },
  road: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    position: 'relative',
  },
  laneDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.ui.border,
    opacity: 0.4,
  },
  obstacleCar: {
    position: 'absolute',
    fontSize: 30,
    top: 0,
  },
  playerCar: {
    position: 'absolute',
    bottom: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  controlBtn: {
    width: 80,
    height: 60,
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
