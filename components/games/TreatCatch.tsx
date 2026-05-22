import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Animated, Dimensions, PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { RetroButton } from '../ui/RetroButton';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const GAME_WIDTH = width - 32;
const CATCHER_W = 60;
const ITEM_SIZE = 28;

interface FallingItem {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  emoji: string;
  isBad: boolean;
}

let itemCounter = 0;

interface Props {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

type GameState = 'menu' | 'playing' | 'gameover';

export function TreatCatch({ onGameOver, onBack }: Props) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  const catcherX = useRef(new Animated.Value(GAME_WIDTH / 2 - CATCHER_W / 2)).current;
  const catcherXVal = useRef(GAME_WIDTH / 2 - CATCHER_W / 2);
  const fallingItems = useRef<FallingItem[]>([]);
  const [renderItems, setRenderItems] = useState<FallingItem[]>([]);
  const gameLoop = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnLoop = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const isPlaying = useRef(false);

  useEffect(() => {
    const id = catcherX.addListener(({ value }) => { catcherXVal.current = value; });
    return () => catcherX.removeListener(id);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, state) => {
        const newX = Math.max(0, Math.min(GAME_WIDTH - CATCHER_W, catcherXVal.current + state.dx));
        catcherX.setValue(newX);
        catcherXVal.current = newX;
      },
    })
  ).current;

  const spawnItem = useCallback(() => {
    const isBad = Math.random() < 0.2;
    const emojis = isBad ? ['💩', '🌶️', '⚡'] : ['🦴', '🐟', '🍖', '⭐', '🍎'];
    const item: FallingItem = {
      id: itemCounter++,
      x: new Animated.Value(Math.random() * (GAME_WIDTH - ITEM_SIZE)),
      y: new Animated.Value(-ITEM_SIZE),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      isBad,
    };
    fallingItems.current = [...fallingItems.current, item];
    setRenderItems([...fallingItems.current]);

    const duration = Math.max(1200, 2500 - scoreRef.current * 15);
    Animated.timing(item.y, { toValue: 340, duration, useNativeDriver: true }).start(({ finished }) => {
      if (finished && isPlaying.current) {
        fallingItems.current = fallingItems.current.filter(i => i.id !== item.id);
        setRenderItems([...fallingItems.current]);
      }
    });
  }, []);

  const endGame = useCallback(() => {
    isPlaying.current = false;
    if (spawnLoop.current) clearInterval(spawnLoop.current);
    if (gameLoop.current) clearInterval(gameLoop.current);
    fallingItems.current = [];
    setRenderItems([]);
    if (scoreRef.current > highScore) setHighScore(scoreRef.current);
    setGameState('gameover');
    onGameOver(scoreRef.current * 5);
  }, [highScore, onGameOver]);

  const checkCollisions = useCallback(() => {
    const catcherLeft = catcherXVal.current;
    const catcherRight = catcherLeft + CATCHER_W;
    const catcherTop = 290;

    fallingItems.current.forEach(item => {
      const xVal = (item.x as any)._value ?? 0;
      const yVal = (item.y as any)._value ?? 0;
      if (yVal >= catcherTop - 10 && yVal <= catcherTop + 20 && xVal + ITEM_SIZE > catcherLeft && xVal < catcherRight) {
        fallingItems.current = fallingItems.current.filter(i => i.id !== item.id);
        setRenderItems([...fallingItems.current]);
        if (item.isBad) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) endGame();
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }
    });
  }, [endGame]);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    fallingItems.current = [];
    isPlaying.current = true;
    setScore(0);
    setLives(3);
    setRenderItems([]);
    setGameState('playing');
    spawnLoop.current = setInterval(spawnItem, 1000);
    gameLoop.current = setInterval(checkCollisions, 50);
  };

  useEffect(() => () => {
    if (spawnLoop.current) clearInterval(spawnLoop.current);
    if (gameLoop.current) clearInterval(gameLoop.current);
  }, []);

  if (gameState === 'menu') return (
    <View style={styles.center}>
      <PixelText size={48}>🦴</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.yellow} glow>TREAT CATCH</PixelText>
      <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
        Slide to catch falling treats!{'\n'}Avoid the bad items 💩
      </PixelText>
      <PixelText size={12} color={Colors.neon.green}>High Score: {highScore}</PixelText>
      <RetroButton label="Play!" onPress={startGame} color={Colors.neon.green} size="lg" emoji="▶" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  if (gameState === 'gameover') return (
    <View style={styles.center}>
      <PixelText size={48}>🎯</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.pink} glow>GAME OVER</PixelText>
      <PixelText size={14} color={Colors.neon.yellow}>Score: {score}</PixelText>
      <PixelText size={12} color={Colors.neon.green}>+{score * 5} coins earned!</PixelText>
      {score >= highScore && score > 0 && (
        <PixelText size={12} color={Colors.neon.cyan}>🏆 New High Score!</PixelText>
      )}
      <RetroButton label="Play Again" onPress={startGame} color={Colors.neon.pink} emoji="▶" />
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
        <PixelText size={14} color={Colors.neon.yellow}>Score: {score}</PixelText>
      </View>

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {renderItems.map(item => (
          <Animated.Text
            key={item.id}
            style={[styles.fallingItem, { transform: [{ translateX: item.x }, { translateY: item.y }] }]}
          >
            {item.emoji}
          </Animated.Text>
        ))}
        <Animated.View style={[styles.catcher, { transform: [{ translateX: catcherX }] }]}>
          <PixelText size={32}>🧺</PixelText>
        </Animated.View>
      </View>

      <PixelText size={11} color={Colors.ui.textDim} style={styles.hint}>
        SLIDE TO MOVE  •  CATCH TREATS  •  AVOID 💩
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  game: { flex: 1 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  liveRow: { flexDirection: 'row', gap: 4 },
  gameArea: {
    flex: 1,
    backgroundColor: Colors.bg.mid,
    marginHorizontal: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    position: 'relative',
  },
  fallingItem: { position: 'absolute', fontSize: ITEM_SIZE },
  catcher: { position: 'absolute', bottom: 20, width: CATCHER_W },
  hint: { textAlign: 'center', paddingVertical: 10, letterSpacing: 1 },
});
