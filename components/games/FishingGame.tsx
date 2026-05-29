import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { PixelText } from '../pixel/PixelText';
import { RetroButton } from '../ui/RetroButton';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const POND_W = width - 48;

interface Fish {
  id: number;
  emoji: string;
  x: Animated.Value;
  y: number;
  rarity: 'common' | 'rare' | 'legendary';
  coins: number;
}

const FISH_TYPES = [
  { emoji: '🐟', rarity: 'common' as const, coins: 5, weight: 60 },
  { emoji: '🐠', rarity: 'common' as const, coins: 8, weight: 20 },
  { emoji: '🐡', rarity: 'rare' as const, coins: 20, weight: 12 },
  { emoji: '🦈', rarity: 'rare' as const, coins: 35, weight: 5 },
  { emoji: '🐙', rarity: 'legendary' as const, coins: 100, weight: 2 },
  { emoji: '💎', rarity: 'legendary' as const, coins: 200, weight: 1 },
];

function pickFish(): (typeof FISH_TYPES)[0] {
  const total = FISH_TYPES.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISH_TYPES) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FISH_TYPES[0];
}

interface Props {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

type Phase = 'menu' | 'casting' | 'waiting' | 'biting' | 'reeling' | 'result';

let fishId = 0;

export function FishingGame({ onGameOver, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalCoins, setTotalCoins] = useState(0);
  const [catchCount, setCatchCount] = useState(0);
  const [lastCatch, setLastCatch] = useState<{ emoji: string; coins: number; rarity: string } | null>(null);
  const [fishInPond, setFishInPond] = useState<Fish[]>([]);

  const hookX = useRef(new Animated.Value(POND_W / 2)).current;
  const hookY = useRef(new Animated.Value(0)).current;
  const coinsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const biteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fishTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use a ref to avoid stale closure in setTimeout
  const reelWindowRef = useRef(false);
  const phaseRef = useRef<Phase>('menu');

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const spawnFish = useCallback(() => {
    const type = pickFish();
    const fish: Fish = {
      id: fishId++,
      ...type,
      y: 30 + Math.random() * 60,
      x: new Animated.Value(-40),
    };
    setFishInPond(prev => [...prev, fish]);

    const dir = Math.random() > 0.5 ? 1 : -1;
    const startX = dir > 0 ? -40 : POND_W + 40;
    fish.x.setValue(startX);

    Animated.timing(fish.x, {
      toValue: dir > 0 ? POND_W + 40 : -40,
      duration: 3000 + Math.random() * 2000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setFishInPond(prev => prev.filter(f => f.id !== fish.id));
      }
    });
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fishTimerRef.current) clearInterval(fishTimerRef.current);
    if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
    setFishInPond([]);
    setPhaseSync('result');
    onGameOver(coinsRef.current);
  }, [onGameOver]);

  const castLine = () => {
    if (phaseRef.current !== 'casting') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.timing(hookY, { toValue: 100, duration: 400, useNativeDriver: true }).start(() => {
      setPhaseSync('waiting');

      const biteDelay = 1500 + Math.random() * 3500;
      biteTimerRef.current = setTimeout(() => {
        setPhaseSync('biting');
        reelWindowRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Miss window: 2s to reel in
        biteTimerRef.current = setTimeout(() => {
          if (reelWindowRef.current) {
            reelWindowRef.current = false;
            hookY.setValue(0);
            setPhaseSync('casting');
          }
        }, 2000);
      }, biteDelay);
    });
  };

  const reelIn = () => {
    if (phaseRef.current !== 'biting') return;
    reelWindowRef.current = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.timing(hookY, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      const caught = pickFish();
      coinsRef.current += caught.coins;
      setTotalCoins(c => c + caught.coins);
      setCatchCount(c => c + 1);
      setLastCatch({ emoji: caught.emoji, coins: caught.coins, rarity: caught.rarity });
      setPhaseSync('casting');

      setTimeout(() => setLastCatch(null), 1500);
    });
  };

  const startGame = () => {
    coinsRef.current = 0;
    reelWindowRef.current = false;
    setTotalCoins(0);
    setCatchCount(0);
    setTimeLeft(60);
    setFishInPond([]);
    setPhaseSync('casting');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    fishTimerRef.current = setInterval(spawnFish, 1800);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fishTimerRef.current) clearInterval(fishTimerRef.current);
    if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
  }, []);

  if (phase === 'menu') return (
    <View style={styles.center}>
      <PixelText size={48}>🎣</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.cyan} glow>PIXEL FISHING</PixelText>
      <PixelText size={13} color={Colors.ui.textDim} style={{ textAlign: 'center' }}>
        Cast your line, wait for a bite,{'\n'}then tap REEL! to catch fish!
      </PixelText>
      <View style={styles.rarityGuide}>
        {FISH_TYPES.map(f => (
          <View key={f.emoji} style={styles.rarityRow}>
            <PixelText size={18}>{f.emoji}</PixelText>
            <PixelText size={11} color={f.rarity === 'legendary' ? Colors.neon.yellow : f.rarity === 'rare' ? Colors.neon.cyan : Colors.ui.textDim}>
              {f.rarity} • +{f.coins} 🪙
            </PixelText>
          </View>
        ))}
      </View>
      <RetroButton label="Cast Off!" onPress={startGame} color={Colors.neon.cyan} size="lg" emoji="🎣" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  if (phase === 'result') return (
    <View style={styles.center}>
      <PixelText size={48}>🏆</PixelText>
      <PixelText variant="title" size={18} color={Colors.neon.yellow} glow>FISHING DONE!</PixelText>
      <PixelText size={14} color={Colors.ui.text}>Caught: {catchCount} fish</PixelText>
      <PixelText size={16} color={Colors.neon.yellow}>+{coinsRef.current} 🪙 coins!</PixelText>
      <RetroButton label="Fish Again" onPress={startGame} color={Colors.neon.cyan} emoji="🎣" />
      <RetroButton label="← Back" onPress={onBack} color={Colors.ui.textDim} size="sm" />
    </View>
  );

  return (
    <View style={styles.game}>
      {/* HUD */}
      <View style={styles.hud}>
        <PixelText size={13} color={Colors.neon.cyan}>⏱ {timeLeft}s</PixelText>
        <PixelText size={13} color={Colors.neon.yellow}>🪙 {totalCoins}</PixelText>
        <PixelText size={13} color={Colors.ui.textDim}>🐟 ×{catchCount}</PixelText>
      </View>

      {/* Pond */}
      <View style={styles.pond}>
        {/* Fish swimming */}
        {fishInPond.map(fish => (
          <Animated.Text
            key={fish.id}
            style={[styles.swimFish, { transform: [{ translateX: fish.x }], top: fish.y }]}
          >
            {fish.emoji}
          </Animated.Text>
        ))}

        {/* Hook line */}
        <Animated.View style={[styles.hookLine, { transform: [{ translateY: hookY }] }]}>
          <View style={styles.line} />
          <PixelText size={20}>🪝</PixelText>
        </Animated.View>

        {/* Catch flash */}
        {lastCatch && (
          <View style={styles.catchFlash}>
            <PixelText size={32}>{lastCatch.emoji}</PixelText>
            <PixelText size={12} color={Colors.neon.yellow}>+{lastCatch.coins} 🪙</PixelText>
          </View>
        )}
      </View>

      {/* Action button */}
      <View style={styles.actionArea}>
        {phase === 'casting' && (
          <TouchableOpacity style={styles.bigBtn} onPress={castLine}>
            <PixelText size={16} color={Colors.neon.cyan} glow>CAST LINE 🎣</PixelText>
          </TouchableOpacity>
        )}
        {phase === 'waiting' && (
          <View style={styles.waitingBox}>
            <PixelText size={14} color={Colors.ui.textDim}>Waiting for a bite...</PixelText>
            <PixelText size={11} color={Colors.ui.textDim}>🐟 🐟 🐟</PixelText>
          </View>
        )}
        {phase === 'biting' && (
          <TouchableOpacity style={[styles.bigBtn, styles.biteBtn]} onPress={reelIn}>
            <PixelText size={22} color={Colors.neon.yellow} glow>⚡ REEL IN! ⚡</PixelText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  rarityGuide: {
    width: '100%',
    gap: 6,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
  },
  rarityRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  game: { flex: 1 },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pond: {
    flex: 1,
    backgroundColor: '#001a33',
    marginHorizontal: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#004488',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  swimFish: {
    position: 'absolute',
    fontSize: 24,
  },
  hookLine: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: Colors.ui.textDim,
  },
  catchFlash: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,224,102,0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neon.yellow,
    padding: 12,
  },
  actionArea: {
    padding: 16,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  bigBtn: {
    backgroundColor: Colors.bg.mid,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.neon.cyan,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: Colors.neon.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  biteBtn: {
    borderColor: Colors.neon.yellow,
    shadowColor: Colors.neon.yellow,
    backgroundColor: 'rgba(255,224,102,0.1)',
  },
  waitingBox: {
    alignItems: 'center',
    gap: 6,
  },
});
