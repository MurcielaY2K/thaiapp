import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { WORLDS, ALL_LESSONS, Lesson, World } from '../../data/worlds';
import { useProgressStore, LessonState } from '../../store/progressStore';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import HeartsBar from '../HeartsBar';
import XPBar from '../XPBar';
import PremiumModal from '../PremiumModal';
import PixelSprite from '../PixelSprite';
import SpiritHero from '../SpiritHero';
import { SPRITES, type SpriteName } from '../../data/sprites';

// Each world gets a pixel-art guardian in its header.
const WORLD_SPRITE: Record<string, SpriteName> = {
  w1: 'naga',
  w2: 'lotus',
  w3: 'chedi',
  w4: 'garuda',
  w5: 'hanuman',
};

const SCREEN_W = Dimensions.get('window').width;
const NODE_SIZE = 64;

const ZIGZAG = [0.08, 0.32, 0.56, 0.32];

interface NodeItem {
  type: 'lesson';
  lesson: Lesson;
  world: World;
  zigIdx: number;
}
interface HeaderItem {
  type: 'header';
  world: World;
}
type ListItem = NodeItem | HeaderItem;

function buildList(): ListItem[] {
  const items: ListItem[] = [];
  let zigIdx = 0;
  for (const world of WORLDS) {
    items.push({ type: 'header', world });
    for (const lesson of world.lessons) {
      items.push({ type: 'lesson', lesson, world, zigIdx: zigIdx % ZIGZAG.length });
      if (lesson.type !== 'checkpoint') zigIdx++;
    }
  }
  return items;
}

const LIST_ITEMS = buildList();

function getEffectiveState(
  lesson: Lesson,
  world: World,
  lessonProgress: Record<string, LessonState>,
  isPremium: boolean,
): LessonState {
  const stored = lessonProgress[lesson.id];
  if (stored) return stored;
  if (world.isPremium && !isPremium) return 'premium-locked';
  return 'locked';
}

function LessonNode({
  lesson, world, zigIdx, state, stars, onPress,
}: {
  lesson: Lesson; world: World; zigIdx: number;
  state: LessonState; stars: number; onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'available') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state]);

  const left = ZIGZAG[zigIdx] * SCREEN_W;
  const isComplete = state === 'complete';
  const isAvailable = state === 'available';
  const isLocked = state === 'locked' || state === 'premium-locked';
  const isPremLocked = state === 'premium-locked';
  const isCheckpoint = lesson.type === 'checkpoint';

  const bg = isComplete ? Colors.realmGrove : isAvailable ? Colors.ember : Colors.card;
  const borderColor = isComplete || isAvailable ? Colors.borderStrong : Colors.border;

  return (
    <View style={[styles.nodeRow, { height: NODE_SIZE + (isCheckpoint ? 72 : 58) }]}>
      <View style={[styles.connLine, { borderColor: Colors.borderGlow }]} />

      <Animated.View style={[
        { transform: [{ scale: isAvailable ? pulse : 1 }] },
        { position: 'absolute', left, top: 8 },
      ]}>
        <TouchableOpacity
          style={[
            styles.node,
            isCheckpoint && styles.nodeCheckpoint,
            {
              backgroundColor: bg,
              borderColor,
              opacity: isLocked && !isPremLocked ? 0.35 : 1,
            },
            Platform.OS === 'web' && (isAvailable || isComplete) ? {
              boxShadow: `0 4px 0 0 ${Colors.borderStrong}`,
            } as any : {},
          ]}
          onPress={onPress}
          activeOpacity={0.8}
          disabled={isLocked && !isPremLocked}
        >
          {isComplete ? (
            <Text style={styles.nodeCheckMark}>✓</Text>
          ) : isPremLocked ? (
            <Text style={styles.nodeIcon}>👑</Text>
          ) : (
            <Text style={styles.nodeIcon}>{lesson.icon}</Text>
          )}

        </TouchableOpacity>
        <Text style={[
          styles.nodeLabel,
          { color: isAvailable || isComplete ? Colors.text : Colors.textMuted },
          { fontFamily: Fonts.body },
        ]} numberOfLines={1}>
          {lesson.title}
        </Text>
        {isAvailable && (
          <View style={styles.startBubble}>
            <Text style={styles.startText}>START</Text>
          </View>
        )}
        {isComplete && stars > 0 && (
          <Text style={styles.nodeStars}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
        )}
      </Animated.View>
    </View>
  );
}

function WorldHeader({ world, done, stars }: { world: World; done: number; stars: number }) {
  const spriteName = WORLD_SPRITE[world.id];
  const sprite = spriteName ? SPRITES[spriteName] : null;
  const total = world.lessons.length;
  return (
    <View style={[
      styles.worldHeader,
      { backgroundColor: world.realmTint },
      Platform.OS === 'web' ? {
        boxShadow: `0 4px 0 0 ${Colors.borderStrong}`,
      } as any : {},
    ]}>
      <View style={styles.worldTop}>
        <View style={styles.worldEmoji}>
          {sprite
            ? <PixelSprite sprite={sprite} size={36} />
            : <Text style={styles.worldEmojiText}>{world.emoji}</Text>}
        </View>
        {world.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
          </View>
        )}
      </View>
      <Text style={styles.worldTitle}>{world.title}</Text>
      <Text style={styles.worldSub}>{world.subtitle}</Text>
      <View style={styles.worldMeta}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>📚 {total} lessons</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>✓ {done}/{total} done</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>★ {stars}/{total * 3}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipText}>{'🌶️'.repeat(world.tier)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LearnTab() {
  const { lessonProgress, lessonStars, isPremium, load, isLoaded, seedProgress, xp, level, dailyXp, dailyGoal } = useProgressStore();
  const [premiumVisible, setPremiumVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded) load();
  }, []);

  useEffect(() => {
    if (isLoaded) seedProgress(ALL_LESSONS[0].id);
  }, [isLoaded]);

  const handleNodePress = (lesson: Lesson, world: World, state: LessonState) => {
    if (state === 'premium-locked' || (world.isPremium && !isPremium && state !== 'complete' && state !== 'available')) {
      setPremiumVisible(true);
      return;
    }
    if (state === 'available' || state === 'complete') {
      router.push(`/lesson?lessonId=${lesson.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.topTitle}>ภาษาไทย</Text>
          <Text style={styles.topSub}>LEARN THAI</Text>
        </View>
        <HeartsBar />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.heroLabel}>TOTAL XP</Text>
        <Text style={styles.heroValue}>{xp.toLocaleString()}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>LV {level}</Text>
          </View>
          <View style={[styles.heroChip, { backgroundColor: Colors.realmGrove }]}>
            <Text style={styles.heroChipText}>⚡ {dailyXp.earned}/{dailyGoal} today</Text>
          </View>
        </View>
      </View>

      <View style={styles.xpWrap}>
        <XPBar />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SpiritHero width={SCREEN_W} />
        {LIST_ITEMS.map((item, idx) => {
          if (item.type === 'header') {
            const done = item.world.lessons.filter(l => lessonProgress[l.id] === 'complete').length;
            const starSum = item.world.lessons.reduce((acc, l) => acc + (lessonStars[l.id] ?? 0), 0);
            return <WorldHeader key={`h-${item.world.id}`} world={item.world} done={done} stars={starSum} />;
          }
          const { lesson, world, zigIdx } = item;
          const state = getEffectiveState(lesson, world, lessonProgress, isPremium);
          return (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              world={world}
              zigIdx={zigIdx}
              state={state}
              stars={lessonStars[lesson.id] ?? 0}
              onPress={() => handleNodePress(lesson, world, state)}
            />
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      <PremiumModal visible={premiumVisible} onClose={() => setPremiumVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topLeft: { gap: 2 },
  topTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: Fonts.body,
    fontWeight: '700',
  },
  topSub: {
    color: Colors.textDim,
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 3,
  },

  xpWrap: { paddingHorizontal: 20, paddingBottom: 12 },

  heroBlock: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10, gap: 2 },
  heroLabel: {
    color: Colors.textDim, fontSize: 10,
    fontFamily: Fonts.hud, letterSpacing: 2,
  },
  heroValue: {
    color: Colors.text, fontSize: 52, lineHeight: 56,
    fontFamily: Fonts.hud,
  },
  heroMeta: { flexDirection: 'row', gap: 8, marginTop: 6 },
  heroChip: {
    backgroundColor: Colors.realmMarket,
    borderRadius: 999,
    borderWidth: 1.5, borderColor: Colors.borderStrong,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  heroChipText: { color: Colors.text, fontSize: 10, fontFamily: Fonts.hud },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0, paddingBottom: 24 },

  worldHeader: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    gap: 4,
  },
  worldTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  worldEmoji: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 2, borderColor: Colors.borderStrong,
  },
  worldEmojiText: { fontSize: 26 },
  worldTitle: {
    color: Colors.text, fontSize: 20,
    fontFamily: Fonts.display, fontWeight: '700',
  },
  worldSub: { color: 'rgba(23,21,15,0.68)', fontSize: 13, fontFamily: Fonts.body },
  worldMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 999,
    borderWidth: 1.5, borderColor: Colors.borderStrong,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  metaChipText: { color: Colors.text, fontSize: 10, fontFamily: Fonts.hud },
  premiumBadge: {
    backgroundColor: Colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: {
    color: '#f5d43e',
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 0.5,
  },

  nodeRow: { position: 'relative', width: '100%' },
  connLine: {
    position: 'absolute',
    left: '50%',
    top: 0, bottom: 0,
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.2,
  },
  node: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeCheckpoint: {
    width: NODE_SIZE + 12,
    height: NODE_SIZE + 12,
    borderRadius: 6,
  },
  glowRing: {
    position: 'absolute',
    width: NODE_SIZE + 16, height: NODE_SIZE + 16,
    borderRadius: 6,
    borderWidth: 2,
    opacity: 0.4,
    top: -8, left: -8,
  },
  nodeIcon: { fontSize: 26 },
  nodeCheckMark: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  nodeLabel: {
    marginTop: 6, fontSize: 11,
    textAlign: 'center', width: NODE_SIZE + 30,
    marginLeft: -15,
  },
  startBubble: {
    marginTop: 4, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'center',
    backgroundColor: Colors.borderStrong,
  },
  startText: {
    color: '#ffffff', fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 1,
  },
  nodeStars: {
    marginTop: 2, fontSize: 11, color: Colors.gold,
    textAlign: 'center', width: NODE_SIZE + 30, marginLeft: -15,
    letterSpacing: 1,
  },
});
