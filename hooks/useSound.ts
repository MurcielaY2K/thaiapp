import { useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 8-bit sound simulation via frequency patterns.
// In production, swap these for real .mp3 assets.
// expo-av can play audio from URIs or local assets.

const SOUND_ENABLED_KEY = '@petagotchi_sound';

type SoundKey = 'tap' | 'feed' | 'play' | 'hug' | 'evolve' | 'gameStart' | 'gameover' | 'coin' | 'error' | 'levelUp';

// Placeholder — maps to nothing until actual audio assets are added.
// The hook provides a clean API so wiring in real sounds is a one-liner per key.
const SOUND_ASSETS: Partial<Record<SoundKey, any>> = {};

let soundEnabled = true;
AsyncStorage.getItem(SOUND_ENABLED_KEY).then(v => {
  soundEnabled = v !== 'false';
});

export function useSound() {
  const sounds = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});

  const play = useCallback(async (key: SoundKey) => {
    if (!soundEnabled) return;
    const asset = SOUND_ASSETS[key];
    if (!asset) return; // no asset yet — silent

    try {
      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true, volume: 0.6 });
      sounds.current[key] = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // silently fail — no audio crashes the game
    }
  }, []);

  const toggleSound = useCallback(async () => {
    soundEnabled = !soundEnabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, soundEnabled ? 'true' : 'false');
    return soundEnabled;
  }, []);

  const isSoundEnabled = () => soundEnabled;

  return { play, toggleSound, isSoundEnabled };
}
