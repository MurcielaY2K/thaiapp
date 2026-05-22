import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import type { Pet, EvolutionStage, PetMood } from '../../types';

interface Props {
  pet: Pet;
  size?: number;
}

// Each pixel is rendered as a View with a background color.
// Sprites are defined as 2D color arrays (null = transparent).

type Row = (string | null)[];
type Sprite = Row[];

function buildSprite(pet: Pet): Sprite {
  const { primary, secondary, accent, eyes, outline } = pet.pixelColors;
  const isNeglected = pet.neglectStreak > 0;
  const isGremlin = isNeglected && pet.stats.happiness < 30;

  if (pet.evolutionStage === 'egg') {
    return eggSprite(primary, accent, outline);
  }
  if (isGremlin) {
    return gremlinSprite(primary, eyes, outline);
  }
  return petSprite(pet.evolutionStage, pet.mood, primary, secondary, accent, eyes, outline, pet.species);
}

function eggSprite(p: string, a: string, o: string): Sprite {
  return [
    [null, null, o,  o,  o,  null, null],
    [null, o,    p,  p,  p,  o,    null],
    [o,    p,    p,  a,  p,  p,    o   ],
    [o,    p,    a,  p,  a,  p,    o   ],
    [o,    p,    p,  p,  p,  p,    o   ],
    [null, o,    p,  p,  p,  o,    null],
    [null, null, o,  o,  o,  null, null],
  ];
}

function gremlinSprite(p: string, e: string, o: string): Sprite {
  const g = '#3a3a3a';
  return [
    [null, o,  o,  null, o,  o,  null],
    [null, o,  g,  o,    g,  o,  null],
    [o,    g,  e,  g,    e,  g,  o   ],
    [o,    g,  g,  g,    g,  g,  o   ],
    [o,    g,  o,  o,    o,  g,  o   ],
    [null, o,  g,  g,    g,  o,  null],
    [null, null, o, o,   o,  null,null],
  ];
}

function petSprite(
  stage: EvolutionStage,
  mood: PetMood,
  p: string, s: string, a: string, e: string, o: string,
  species: Pet['species'],
): Sprite {
  const isBig = stage === 'adult' || stage === 'legend';
  const isHappy = mood === 'happy' || mood === 'ecstatic';
  const isSad = mood === 'sad' || mood === 'angry';

  if (species === 'cat') return catSprite(p, s, a, e, o, isHappy, isSad, isBig);
  if (species === 'bird') return birdSprite(p, s, a, e, o, isHappy);
  if (species === 'rabbit') return rabbitSprite(p, s, a, e, o, isHappy);
  if (species === 'reptile') return reptileSprite(p, s, a, e, o, isHappy);
  return dogSprite(p, s, a, e, o, isHappy, isSad, isBig);
}

function dogSprite(p: string, s: string, a: string, e: string, o: string, happy: boolean, sad: boolean, big: boolean): Sprite {
  const mouth = happy ? a : sad ? '#ff4757' : s;
  if (big) {
    return [
      [o,    p,  p,  null, null, p,  p,  o   ],
      [p,    p,  p,  p,    p,   p,  p,  p   ],
      [p,    e,  p,  p,    p,   p,  e,  p   ],
      [p,    p,  p,  p,    p,   p,  p,  p   ],
      [p,    p,  mouth,p,  p,  mouth,p, p   ],
      [null, p,  p,  s,    s,   p,  p,  null],
      [null, o,  o,  null, null, o,  o,  null],
    ];
  }
  return [
    [null, o,  p,  null, p,  o,  null],
    [null, p,  p,  p,    p,  p,  null],
    [null, p,  e,  p,    e,  p,  null],
    [null, p,  p,  p,    p,  p,  null],
    [null, p,  mouth, p, mouth, p, null],
    [null, p,  s,  s,    s,  p,  null],
    [null, o,  o,  null, o,  o,  null],
  ];
}

function catSprite(p: string, s: string, a: string, e: string, o: string, happy: boolean, sad: boolean, big: boolean): Sprite {
  const mouth = happy ? a : s;
  return [
    [o,  p,  null, null, null, p,  o  ],
    [p,  p,  p,    null, p,    p,  p  ],
    [p,  p,  e,    p,    e,    p,  p  ],
    [p,  p,  p,    mouth,p,    p,  p  ],
    [null,p, p,    p,    p,    p,  null],
    [null,o, p,    p,    p,    o,  null],
    [null,null,o,  null, o,   null,null],
  ];
}

function birdSprite(p: string, s: string, a: string, e: string, o: string, happy: boolean): Sprite {
  const beak = '#ff9500';
  return [
    [null, null, o,  o,  o,  null, null],
    [null, o,    p,  p,  p,  o,    null],
    [o,    p,    e,  p,  e,  p,    o   ],
    [o,    p,    p, beak,p,  p,    o   ],
    [o,    s,    p,  p,  p,  s,    o   ],
    [null, o,    s,  p,  s,  o,    null],
    [null, null, o,  o,  o,  null, null],
  ];
}

function rabbitSprite(p: string, s: string, a: string, e: string, o: string, happy: boolean): Sprite {
  const mouth = happy ? a : s;
  return [
    [null, o,  null, null, null, o,  null],
    [null, p,  null, null, null, p,  null],
    [null, o,  p,    p,    p,   o,   null],
    [o,    p,  e,    p,    e,   p,   o   ],
    [o,    p,  p,   mouth, p,   p,   o   ],
    [null, o,  p,    p,    p,   o,   null],
    [null, null, o,  o,   o,  null,  null],
  ];
}

function reptileSprite(p: string, s: string, a: string, e: string, o: string, happy: boolean): Sprite {
  const sc = '#1a6b1a'; // scale accent
  const mouth = happy ? a : s;
  return [
    [null, o,  o,   null, o,   o,   null],
    [o,    p,  sc,  p,    sc,  p,   o   ],
    [o,    sc, e,   p,    e,  sc,   o   ],
    [o,    p,  sc, mouth, sc,  p,   o   ],
    [null, o,  p,   sc,   p,   o,   null],
    [null, null, o, p,    o,   null, null],
    [null, null, null, o, null, null, null],
  ];
}

// Personality-driven animation configs
const PERSONALITY_ANIM = {
  hyperactive: { bounceH: -10, bounceDur: 300, blinkDelay: 1200 },
  lazy:        { bounceH: -2,  bounceDur: 1200, blinkDelay: 6000 },
  chaotic:     { bounceH: -8,  bounceDur: 400,  blinkDelay: 800  },
  dramatic:    { bounceH: -8,  bounceDur: 700,  blinkDelay: 2000 },
  affectionate:{ bounceH: -5,  bounceDur: 700,  blinkDelay: 2500 },
  jealous:     { bounceH: -4,  bounceDur: 900,  blinkDelay: 3000 },
  intelligent: { bounceH: -3,  bounceDur: 800,  blinkDelay: 4000 },
  weird:       { bounceH: -6,  bounceDur: 550,  blinkDelay: 700  },
};

export function PixelPet({ pet, size = 120 }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  const anim = PERSONALITY_ANIM[pet.personality] ?? PERSONALITY_ANIM.affectionate;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: anim.bounceH, duration: anim.bounceDur, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: anim.bounceDur, useNativeDriver: true }),
      ])
    );
    bounce.start();

    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(anim.blinkDelay),
        Animated.timing(blinkAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ])
    );
    blink.start();

    // Chaotic and weird pets get a sideways wobble
    if (pet.personality === 'chaotic' || pet.personality === 'weird') {
      const wobble = Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 4, duration: 180, useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: -4, duration: 180, useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
      wobble.start();
    }

    return () => {
      bounce.stop();
      blink.stop();
    };
  }, [pet.personality]);

  const sprite = buildSprite(pet);
  const pixelSize = Math.floor(size / 7);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }, { translateX: wobbleAnim }] }]}>
      {sprite.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((color, ci) => (
            <View
              key={ci}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color ?? 'transparent',
                },
              ]}
            />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    // no border for clean pixel look
  },
});
