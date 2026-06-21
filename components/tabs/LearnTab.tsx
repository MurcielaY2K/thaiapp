import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { WORLDS, ALL_LESSONS, Lesson, World } from '../../data/worlds';
import { useProgressStore, LessonState } from '../../store/progressStore';
import { Colors } from '../../constants/colors';
import HeartsBar from '../HeartsBar';
import XPBar from '../XPBar';
import PremiumModal from '../PremiumModal';

const SCREEN_W = Dimensions.get('window').width;
const NODE_SIZE = 64;

// Zigzag horizontal positions (fraction of screen width)
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
  lesson, world, zigIdx, state, onPress,
}: {
  lesson: Lesson; world: World; zigIdx: number;
  state: LessonState; onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'available') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
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

  const bg = isComplete
    ? world.color
    : isAvailable
      ? world.color
      : Colors.card;

  const borderColor = isComplete || isAvailable ? world.color : Colors.border;

  return (
    <View style={[styles.nodeRow, { height: NODE_SIZE + 28 }]}>
      {/* Connecting line */}
      <View style={[styles.connLine, { borderColor: borderColor, opacity: 0.3 }]} />

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
              opacity: isLocked && !isPremLocked ? 0.45 : 1,
            },
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
          {isAvailable && (
            <View style={[styles.glowRing, { borderColor: world.color }]} />
          )}
        </TouchableOpacity>
        <Text style={[
          styles.nodeLabel,
          { color: isAvailable || isComplete ? Colors.text : Colors.textDim },
        ]} numberOfLines={1}>
          {lesson.title}
        </Text>
        {isAvailable && (
          <View style={[styles.startBubble, { backgroundColor: world.color }]}>
            <Text style={styles.startText}>START</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function WorldHeader({ world }: { world: World }) {
  return (
    <View style={[styles.worldHeader, { borderColor: world.color + '40' }]}>
      <View style={[styles.worldEmoji, { backgroundColor: world.color + '20' }]}>
        <Text style={styles.worldEmojiText}>{world.emoji}</Text>
      </View>
      <View style={styles.worldText}>
        <View style={styles.worldTitleRow}>
          <Text style={styles.worldTitle}>{world.title}</Text>
          {world.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
            </View>
          )}
        </View>
        <Text style={styles.worldSub}>{world.subtitle}</Text>
      </View>
    </View>
  );
}

export default function LearnTab() {
  const { lessonProgress, isPremium, load, isLoaded, seedProgress } = useProgressStore();
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
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.topTitle}>ภาษาไทย</Text>
          <Text style={styles.topSub}>Thai</Text>
        </View>
        <HeartsBar />
      </View>

      <View style={styles.xpWrap}>
        <XPBar />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LIST_ITEMS.map((item, idx) => {
          if (item.type === 'header') {
            return <WorldHeader key={`h-${item.world.id}`} world={item.world} />;
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
  topLeft: { gap: 1 },
  topTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  topSub: { color: Colors.textDim, fontSize: 11, letterSpacing: 3 },

  xpWrap: { paddingHorizontal: 20, paddingBottom: 12 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 24 },

  // World header
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
  },
  worldEmoji: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  worldEmojiText: { fontSize: 26 },
  worldText: { flex: 1, gap: 3 },
  worldTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  worldTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  worldSub: { color: Colors.textDim, fontSize: 12 },
  premiumBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  premiumBadgeText: { color: '#ffd700', fontSize: 10, fontWeight: '700' },

  // Nodes
  nodeRow: {
    position: 'relative',
    width: '100%',
  },
  connLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  node: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  nodeCheckpoint: {
    width: NODE_SIZE + 12,
    height: NODE_SIZE + 12,
    borderRadius: (NODE_SIZE + 12) / 2,
  },
  glowRing: {
    position: 'absolute',
    width: NODE_SIZE + 16,
    height: NODE_SIZE + 16,
    borderRadius: (NODE_SIZE + 16) / 2,
    borderWidth: 2,
    opacity: 0.5,
    top: -8, left: -8,
  },
  nodeIcon: { fontSize: 26 },
  nodeCheckMark: { color: '#fff', fontSize: 28, fontWeight: '800' },
  nodeLabel: {
    marginTop: 6, fontSize: 11, fontWeight: '600',
    textAlign: 'center', width: NODE_SIZE + 30,
    marginLeft: -15,
  },
  startBubble: {
    marginTop: 4, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'center',
  },
  startText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});
