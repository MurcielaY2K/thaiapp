import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { SkillLevel } from '../store/progressStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

interface Option {
  level: SkillLevel;
  emoji: string;
  title: string;
  blurb: string;
  bullets: string[];
  tint: string;
}

const OPTIONS: Option[] = [
  {
    level: 'beginner',
    emoji: '🌱',
    title: 'Beginner',
    blurb: 'New to Thai — start from zero.',
    bullets: [
      'Every word shows its pronunciation (romanization)',
      'Gentle lessons: meaning & listening only',
      'No reading Thai script yet',
    ],
    tint: Colors.realmGrove, // olive
  },
  {
    level: 'intermediate',
    emoji: '🔥',
    title: 'Intermediate',
    blurb: 'You know some words and the script basics.',
    bullets: [
      'Mixed challenges that get harder as you go',
      'Translate both ways + listening',
      'Pronunciation shown after you answer',
    ],
    tint: Colors.realmMarket, // lavender
  },
  {
    level: 'advanced',
    emoji: '⚡',
    title: 'Advanced',
    blurb: 'You read Thai and want a real workout.',
    bullets: [
      'Hardest challenge mix, including script reading',
      'Tougher look-alike answer choices',
      'Minimal pronunciation hints',
    ],
    tint: Colors.realmSummit, // red
  },
];

export default function LevelPicker({ onPick }: { onPick: (level: SkillLevel) => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>ยินดีต้อนรับ · WELCOME</Text>
        <Text style={styles.title}>What's your Thai level?</Text>
        <Text style={styles.sub}>
          We'll tailor your lessons to match. You can change this anytime in your Profile.
        </Text>

        {OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.level}
            style={[
              styles.card,
              { backgroundColor: opt.tint },
              Platform.OS === 'web' ? { boxShadow: `0 5px 0 0 ${Colors.borderStrong}` } as any : {},
            ]}
            activeOpacity={0.9}
            onPress={() => onPick(opt.level)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardEmoji}>{opt.emoji}</Text>
              <Text style={styles.cardTitle}>{opt.title}</Text>
            </View>
            <Text style={styles.cardBlurb}>{opt.blurb}</Text>
            <View style={styles.bullets}>
              {opt.bullets.map(b => (
                <View key={b} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>▪</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chooseBtn}>
              <Text style={styles.chooseText}>CHOOSE {opt.title.toUpperCase()} ›</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 32, gap: 0 },
  kicker: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.hud, letterSpacing: 2, marginBottom: 8 },
  title: { color: Colors.text, fontSize: 26, fontFamily: Fonts.display, fontWeight: '700', marginBottom: 8 },
  sub: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, lineHeight: 19, marginBottom: 22 },

  card: {
    borderRadius: 18, borderWidth: 2, borderColor: Colors.borderStrong,
    padding: 18, marginBottom: 18, gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardEmoji: { fontSize: 30 },
  cardTitle: { color: Colors.text, fontSize: 22, fontFamily: Fonts.display, fontWeight: '700' },
  cardBlurb: { color: 'rgba(23,21,15,0.72)', fontSize: 13, fontFamily: Fonts.body, fontWeight: '600' },
  bullets: { gap: 5, marginTop: 4 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletDot: { color: Colors.text, fontSize: 12, lineHeight: 18 },
  bulletText: { flex: 1, color: Colors.text, fontSize: 12.5, fontFamily: Fonts.body, lineHeight: 18 },
  chooseBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: Colors.borderStrong, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  chooseText: { color: '#ffffff', fontSize: 11, fontFamily: Fonts.hud, letterSpacing: 0.5 },
});
