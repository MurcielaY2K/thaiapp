import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, SafeAreaView, TouchableOpacity,
  Animated, Dimensions, PanResponder, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { PixelText } from '../../components/pixel/PixelText';
import { RetroButton } from '../../components/ui/RetroButton';
import { Colors } from '../../constants/colors';
import { MINI_GAMES } from '../../constants/petData';

const { width } = Dimensions.get('window');
const GAME_WIDTH = width - 32;
const CATCHER_W = 60;
const ITEM_SIZE = 28;

type GameState = 'menu' | 'playing' | 'gameover';

interface FallingItem {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  emoji: string;
  isBad: boolean;
}

let itemCounter = 0;

export default function GamesScreen() {
  const { pet, earnCoins } = usePetStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);
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
    catcherX.addListener(({ value }) => { catcherXVal.current = value; });
    return () => catcherX.removeAllListeners();
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
    Animated.timing(item.y, {
      toValue: 320,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isPlaying.current) {
        fallingItems.current = fallingItems.current.filter(i => i.id !== item.id);
        setRenderItems([...fallingItems.current]);
      }
    });
  }, []);

  const checkCollisions = useCallback(() => {
    const catcherLeft = catcherXVal.current;
    const catcherRight = catcherLeft + CATCHER_W;
    const catcherTop = 280;

    fallingItems.current.forEach(item => {
      const itemXVal = (item.x as any)._value ?? 0;
      const itemYVal = (item.y as any)._value ?? 0;

      if (
        itemYVal >= catcherTop - 10 &&
        itemYVal <= catcherTop + 20 &&
        itemXVal + ITEM_SIZE > catcherLeft &&
        itemXVal < catcherRight
      ) {
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
  }, []);

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

  const endGame = () => {
    isPlaying.current = false;
    if (spawnLoop.current) clearInterval(spawnLoop.current);
    if (gameLoop.current) clearInterval(gameLoop.current);
    fallingItems.current = [];
    setRenderItems([]);

    const earned = scoreRef.current * 5;
    earnCoins(earned);
    if (scoreRef.current > highScore) setHighScore(scoreRef.current);
    setGameState('gameover');
  };

  useEffect(() => {
    return () => {
      if (spawnLoop.current) clearInterval(spawnLoop.current);
      if (gameLoop.current) clearInterval(gameLoop.current);
    };
  }, []);

  if (!pet) return null;
  const petLevel = pet.stats.level;

  if (activeGame === 'treat_catch') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.gameHeader}>
          <RetroButton label="← Back" onPress={() => { endGame(); setActiveGame(null); setGameState('menu'); }} color={Colors.ui.textDim} size="sm" />
          <PixelText variant="title" size={14} color={Colors.neon.yellow}>TREAT CATCH</PixelText>
          <View style={styles.liveRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <PixelText key={i} size={14}>{i < lives ? '❤️' : '🖤'}</PixelText>
            ))}
          </View>
        </View>

        {gameState === 'menu' && (
          <View style={styles.gameCenter}>
            <PixelText size={48}>🦴</PixelText>
            <PixelText variant="title" size={18} color={Colors.neon.yellow} glow>TREAT CATCH</PixelText>
            <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
              Slide to catch falling treats!{'\n'}Avoid the bad items 💩
            </PixelText>
            <PixelText size={12} color={Colors.neon.green}>High Score: {highScore}</PixelText>
            <RetroButton label="Play!" onPress={startGame} color={Colors.neon.green} size="lg" emoji="▶" />
          </View>
        )}

        {gameState === 'playing' && (
          <View style={styles.gameArea} {...panResponder.panHandlers}>
            <View style={styles.scoreRow}>
              <PixelText size={14} color={Colors.neon.yellow}>Score: {score}</PixelText>
            </View>
            {renderItems.map(item => (
              <Animated.Text
                key={item.id}
                style={[
                  styles.fallingItem,
                  { transform: [{ translateX: item.x }, { translateY: item.y }] },
                ]}
              >
                {item.emoji}
              </Animated.Text>
            ))}
            <Animated.View
              style={[styles.catcher, { transform: [{ translateX: catcherX }] }]}
            >
              <PixelText size={32}>🧺</PixelText>
            </Animated.View>
          </View>
        )}

        {gameState === 'gameover' && (
          <View style={styles.gameCenter}>
            <PixelText size={48}>🎯</PixelText>
            <PixelText variant="title" size={18} color={Colors.neon.pink} glow>GAME OVER</PixelText>
            <PixelText size={14} color={Colors.neon.yellow}>Score: {score}</PixelText>
            <PixelText size={12} color={Colors.neon.green}>+{score * 5} coins earned!</PixelText>
            {score > highScore - score && (
              <PixelText size={12} color={Colors.neon.cyan}>🏆 New High Score!</PixelText>
            )}
            <RetroButton label="Play Again" onPress={startGame} color={Colors.neon.pink} emoji="▶" />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PixelText variant="title" size={18} color={Colors.neon.cyan} glow>🎮  MINI GAMES</PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>Win coins & make {pet.name} happy!</PixelText>
        </View>

        <View style={styles.gameList}>
          {MINI_GAMES.map(game => {
            const locked = petLevel < game.unlockLevel;
            return (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, locked && styles.gameCardLocked]}
                onPress={() => {
                  if (locked) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    return;
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setActiveGame(game.id);
                  setGameState('menu');
                }}
                disabled={locked}
              >
                <PixelText size={36}>{game.emoji}</PixelText>
                <View style={styles.gameInfo}>
                  <PixelText size={14} color={locked ? Colors.ui.textDim : Colors.ui.textBright}>
                    {game.name}
                  </PixelText>
                  <PixelText size={11} color={Colors.ui.textDim}>{game.description}</PixelText>
                  {locked && (
                    <PixelText size={10} color={Colors.ui.warning}>
                      🔒  Unlock at level {game.unlockLevel}
                    </PixelText>
                  )}
                </View>
                {!locked && (
                  <PixelText size={18} color={Colors.neon.cyan}>▶</PixelText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
    gap: 4,
  },
  gameList: {
    padding: 16,
    gap: 12,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 14,
    gap: 14,
    shadowColor: Colors.neon.cyan,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  gameCardLocked: {
    opacity: 0.5,
    borderColor: Colors.bg.mid,
    shadowOpacity: 0,
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
  },
  liveRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gameArea: {
    flex: 1,
    backgroundColor: Colors.bg.mid,
    margin: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    position: 'relative',
  },
  scoreRow: {
    padding: 8,
    alignItems: 'center',
  },
  fallingItem: {
    position: 'absolute',
    fontSize: ITEM_SIZE,
  },
  catcher: {
    position: 'absolute',
    bottom: 20,
    width: CATCHER_W,
  },
  gameCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
});
