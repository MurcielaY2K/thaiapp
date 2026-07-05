import React from 'react';
import { Text } from 'react-native';
import PixelSprite from './PixelSprite';
import { SPRITES, type SpriteName } from '../data/sprites';

// Avatar values are stored as strings (including in Supabase's avatar_emoji
// column). Pixel avatars use the 'px:<spriteName>' form; anything else is
// rendered as an emoji so profiles created before the pixel-art era keep
// working.
export function isPixelAvatar(avatar: string): boolean {
  return avatar.startsWith('px:') && avatar.slice(3) in SPRITES;
}

export default function PixelAvatar({ avatar, size }: { avatar: string; size: number }) {
  if (isPixelAvatar(avatar)) {
    return <PixelSprite sprite={SPRITES[avatar.slice(3) as SpriteName]} size={size} />;
  }
  return <Text style={{ fontSize: size * 0.82, lineHeight: size * 1.05 }}>{avatar}</Text>;
}
