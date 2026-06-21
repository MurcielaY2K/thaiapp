import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { REWARDS } from '../data/rewards';
import { Colors } from '../constants/colors';

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
    <Animated.View style={[styles.toast, { transform: [{ translateY: slide }] }]}>
      <Text style={styles.icon}>{reward.icon}</Text>
      <View style={styles.text}>
        <Text style={styles.title}>Reward Unlocked!</Text>
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
    backgroundColor: '#1a1a2e',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff9f43',
    shadowColor: '#ff9f43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 50,
  },
  icon: { fontSize: 32 },
  text: { flex: 1, gap: 2 },
  title: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  name: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  unlocks: { color: Colors.textDim, fontSize: 11 },
  star: { fontSize: 20 },
});
