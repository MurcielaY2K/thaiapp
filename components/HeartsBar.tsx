import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProgressStore } from '../store/progressStore';

const MAX_HEARTS = 5;
const HEART_REFILL_MS = 30 * 60 * 1000;

export default function HeartsBar() {
  const { hearts, isPremium, lastHeartRefill } = useProgressStore();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (isPremium || hearts >= MAX_HEARTS) { setTimeLeft(''); return; }
    const update = () => {
      const elapsed = Date.now() - lastHeartRefill;
      const remaining = HEART_REFILL_MS - (elapsed % HEART_REFILL_MS);
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [hearts, isPremium, lastHeartRefill]);

  return (
    <View style={styles.row}>
      {isPremium ? (
        <Text style={styles.infinityHeart}>♾️</Text>
      ) : (
        Array.from({ length: MAX_HEARTS }).map((_, i) => (
          <Text key={i} style={[styles.heart, i >= hearts && styles.empty]}>
            {i < hearts ? '❤️' : '🖤'}
          </Text>
        ))
      )}
      {!isPremium && hearts < MAX_HEARTS && timeLeft ? (
        <Text style={styles.timer}>{timeLeft}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heart: { fontSize: 18 },
  infinityHeart: { fontSize: 20 },
  empty: { opacity: 0.3 },
  timer: { color: '#f87171', fontSize: 11, fontWeight: '700', marginLeft: 6 },
});
