import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { REWARDS } from '../data/rewards';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

interface Props {
  rewardIds: string[];
  onDone: () => void;
}

export default function RewardToast({ rewardIds, onDone }: Props) {
  const slide = useRef(new Animated.Value(-120)).current;
  const [idx, setIdx] = React.useState(0);

  const reward = REWARDS.find(r => r.id === rewardIds[idx]);

  useEffect(() => {
    if (!reward) return;
    slide.setValue(-120);
    Animated.sequence([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }),
      Animated.delay(2400),
      Animated.timing(slide, { toValue: -120, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      if (idx + 1 < rewardIds.length) {
        setIdx(i => i + 1);
      } else {
        onDone();
      }
    });
  }, [idx, reward]);

  if (!reward) return null;

  return (
    <Animated.View style={[
      styles.toast,
      { transform: [{ translateY: slide }] },
      Platform.OS === 'web' ? {
        boxShadow: '0 0 24px rgba(251,191,36,0.4)',
      } as any : {},
    ]}>
      <Text style={styles.icon}>{reward.icon}</Text>
      <View style={styles.text}>
        <Text style={styles.title}>REWARD UNLOCKED</Text>
        <Text style={styles.name}>{reward.title}</Text>
        <Text style={styles.unlocks} numberOfLines={1}>
          {reward.unlocks.map(u => u.label).join(' · ')}
        </Text>
      </View>
      <Text style={styles.star}>✨</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0, left: 16, right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 50,
  },
  icon: { fontSize: 32 },
  text: { flex: 1, gap: 2 },
  title: {
    color: Colors.gold,
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 1.5,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.display,
    fontWeight: '700',
  },
  unlocks: {
    color: Colors.textDim,
    fontSize: 11,
    fontFamily: Fonts.body,
  },
  star: { fontSize: 20 },
});
