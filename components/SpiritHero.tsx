import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import PixelSprite from './PixelSprite';
import { SPRITES } from '../data/sprites';
import { Colors } from '../constants/colors';

// Floating Naga guardian over a pixel mountain horizon — the signature
// Spirit Realm banner shown atop the Learn screen. align="right" nudges the
// guardian toward the right edge so stats can overlay the left side.
export default function SpiritHero({ width, align = 'center' }: { width: number; align?: 'center' | 'right' }) {
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.8, duration: 1600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.4, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View style={[styles.band, { width }]}>
      {/* Star specks */}
      <View style={[styles.star, { top: 18, left: '18%' }]} />
      <View style={[styles.star, { top: 30, left: '72%' }]} />
      <View style={[styles.star, { top: 12, left: '50%' }]} />
      <View style={[styles.starSm, { top: 44, left: '34%' }]} />
      <View style={[styles.starSm, { top: 22, left: '86%' }]} />

      {/* Mountain horizon */}
      <View style={styles.horizon}>
        <PixelSprite sprite={SPRITES.mountains} size={width} opacity={0.45} />
      </View>

      {/* Glow halo behind the guardian */}
      <Animated.View style={[styles.halo, align === 'right' && styles.haloRight, { opacity: glow }]} />

      {/* Floating Naga guardian */}
      <Animated.View style={[styles.naga, align === 'right' && styles.nagaRight, { transform: [{ translateY }] }]}>
        <PixelSprite sprite={SPRITES.naga} size={88} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: Colors.bgDeep,
  },
  horizon: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    bottom: 36,
    width: 130, height: 130,
    borderRadius: 65,
    backgroundColor: Colors.lavender,
    ...(Platform.OS === 'web' ? { filter: 'blur(28px)' } as any : {}),
  },
  naga: {
    position: 'absolute',
    bottom: 30,
  },
  haloRight: { alignSelf: 'auto', right: 8 },
  nagaRight: { alignSelf: 'auto', right: 28 },
  star: {
    position: 'absolute',
    width: 3, height: 3,
    backgroundColor: Colors.lavender,
    opacity: 0.8,
  },
  starSm: {
    position: 'absolute',
    width: 2, height: 2,
    backgroundColor: Colors.sky,
    opacity: 0.6,
  },
});
