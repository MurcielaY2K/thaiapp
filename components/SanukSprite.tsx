import React from 'react';
import { Image, Platform, StyleProp, ViewStyle } from 'react-native';

export type SanukSpriteName =
  | 'book' | 'check' | 'chedi' | 'cross' | 'crown' | 'flame' | 'gem'
  | 'ghost' | 'heart' | 'house' | 'kinnari' | 'krasue' | 'lantern' | 'lock'
  | 'lotus' | 'maeNak' | 'naga' | 'pencil' | 'pret' | 'search' | 'speaker'
  | 'star' | 'stone';

const SPRITE_MAP: Record<SanukSpriteName, any> = {
  book:    require('../assets/sprites/book.png'),
  check:   require('../assets/sprites/check.png'),
  chedi:   require('../assets/sprites/chedi.png'),
  cross:   require('../assets/sprites/cross.png'),
  crown:   require('../assets/sprites/crown.png'),
  flame:   require('../assets/sprites/flame.png'),
  gem:     require('../assets/sprites/gem.png'),
  ghost:   require('../assets/sprites/ghost.png'),
  heart:   require('../assets/sprites/heart.png'),
  house:   require('../assets/sprites/house.png'),
  kinnari: require('../assets/sprites/kinnari.png'),
  krasue:  require('../assets/sprites/krasue.png'),
  lantern: require('../assets/sprites/lantern.png'),
  lock:    require('../assets/sprites/lock.png'),
  lotus:   require('../assets/sprites/lotus.png'),
  maeNak:  require('../assets/sprites/maeNak.png'),
  naga:    require('../assets/sprites/naga.png'),
  pencil:  require('../assets/sprites/pencil.png'),
  pret:    require('../assets/sprites/pret.png'),
  search:  require('../assets/sprites/search.png'),
  speaker: require('../assets/sprites/speaker.png'),
  star:    require('../assets/sprites/star.png'),
  stone:   require('../assets/sprites/stone.png'),
};

interface Props {
  name: SanukSpriteName;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SanukSprite({ name, size = 32, style }: Props) {
  const webStyle = Platform.OS === 'web'
    ? { imageRendering: 'pixelated' as any }
    : {};

  return (
    <Image
      source={SPRITE_MAP[name]}
      style={[{ width: size, height: size }, webStyle, style as any]}
      resizeMode="contain"
    />
  );
}
