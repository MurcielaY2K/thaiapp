import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RoomTheme } from '../../types';
import { ROOM_THEMES } from '../../constants/petData';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
}

interface Props {
  theme: RoomTheme;
  children: React.ReactNode;
}

export function PixelBackground({ theme, children }: Props) {
  const { bgColors } = ROOM_THEMES[theme];
  const stars = useRef<Star[]>(
    Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 3 + 1,
      opacity: new Animated.Value(Math.random()),
    }))
  ).current;

  useEffect(() => {
    stars.forEach((star, i) => {
      const twinkle = Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 800 + i * 100,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3,
            duration: 600 + i * 80,
            useNativeDriver: true,
          }),
        ])
      );
      twinkle.start();
    });
  }, []);

  const showStars = theme === 'moon' || theme === 'cyber_city' || theme === 'bedroom';

  return (
    <LinearGradient
      colors={bgColors as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      {showStars && stars.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              backgroundColor: theme === 'cyber_city' ? '#00e5ff' : '#f0e6ff',
            },
          ]}
        />
      ))}
      <GroundDecoration theme={theme} />
      {children}
    </LinearGradient>
  );
}

function GroundDecoration({ theme }: { theme: RoomTheme }) {
  if (theme === 'park') {
    return (
      <View style={styles.ground}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.tree, { left: (i * width) / 7 }]}>
            <View style={styles.treeTop} />
            <View style={styles.treeTrunk} />
          </View>
        ))}
      </View>
    );
  }
  if (theme === 'cyber_city') {
    return (
      <View style={styles.cityline}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.building,
              {
                height: 60 + (i % 3) * 30,
                width: 28 + (i % 2) * 12,
                backgroundColor: '#001a33',
                borderTopColor: '#00e5ff',
              },
            ]}
          />
        ))}
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    borderRadius: 1,
  },
  ground: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tree: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  treeTop: {
    width: 14,
    height: 18,
    backgroundColor: '#1a6b1a',
    borderRadius: 2,
  },
  treeTrunk: {
    width: 6,
    height: 8,
    backgroundColor: '#8b4513',
  },
  cityline: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  building: {
    borderTopWidth: 2,
  },
});
