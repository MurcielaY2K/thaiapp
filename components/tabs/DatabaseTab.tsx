import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { VOCABULARY, Word } from '../../data/vocabulary';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

const CATEGORIES = ['all', 'greetings', 'numbers', 'time', 'food', 'places', 'colors', 'family', 'verbs', 'adjectives'];

const CAT_EMOJI: Record<string, string> = {
  all: '🔍', greetings: '🙏', numbers: '🔢', time: '⏰',
  food: '🍜', places: '📍', colors: '🎨', family: '👨‍👩‍👧',
  verbs: '🏃', adjectives: '⚖️',
};

// Spirit Realm category colors
const CAT_COLORS: Record<string, string> = {
  greetings:  Colors.teal,
  numbers:    Colors.lavender,
  time:       Colors.sky,
  food:       Colors.mint,
  places:     Colors.gold,
  colors:     Colors.blush,
  family:     Colors.peach,
  verbs:      Colors.mintDim,
  adjectives: Colors.lavenderDim,
};

function catColor(cat: string): string {
  return CAT_COLORS[cat] ?? Colors.textDim;
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  const thai = voices.find(v => v.lang.startsWith('th'));
  if (thai) u.voice = thai;
  window.speechSynthesis.speak(u);
}

function WordRow({ word }: { word: Word }) {
  const color = catColor(word.category);
  return (
    <TouchableOpacity style={styles.row} onPress={() => speak(word.th)} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.thai}>{word.th}</Text>
        <Text style={styles.rom}>{word.rom}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.en}>{word.en}</Text>
        <View style={[styles.catBadge, { backgroundColor: color + '18' }]}>
          <Text style={[styles.catText, { color }]}>
            {CAT_EMOJI[word.category] ?? '•'} {word.category}
          </Text>
        </View>
      </View>
      <Text style={styles.speaker}>🔊</Text>
    </TouchableOpacity>
  );
}

export default function DatabaseTab() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return VOCABULARY.filter(w => {
      const matchCat = cat === 'all' || w.category === cat;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        w.th.includes(q) ||
        w.rom.toLowerCase().includes(q) ||
        w.en.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>Vocabulary</Text>
        <Text style={styles.count}>{filtered.length} words</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search Thai, phonetic or English…"
          placeholderTextColor={Colors.textDim}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={c => c}
        contentContainerStyle={styles.cats}
        renderItem={({ item: c }) => {
          const isActive = cat === c;
          const color = catColor(c);
          return (
            <TouchableOpacity
              style={[
                styles.catChip,
                isActive && { backgroundColor: color + '20', borderColor: color },
              ]}
              onPress={() => setCat(c)}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.catChipText,
                isActive && { color, fontFamily: Fonts.hud },
              ]}>
                {CAT_EMOJI[c]} {c === 'all' ? 'All' : c}
              </Text>
            </TouchableOpacity>
          );
        }}
        style={styles.catBar}
      />

      <FlatList
        data={filtered}
        keyExtractor={w => w.id}
        renderItem={({ item }) => <WordRow word={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No words found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  heading: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.display,
    fontWeight: '700',
  },
  count: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.mono },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
  },
  searchIcon: { fontSize: 14 },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontFamily: Fonts.body },
  clear: { color: Colors.textDim, fontSize: 14, paddingHorizontal: 4 },

  catBar: { flexGrow: 0, marginBottom: 6 },
  cats: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 4, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipText: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.body },

  list: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowLeft: { width: 110, gap: 3 },
  thai: { color: Colors.text, fontSize: 20, fontFamily: Fonts.body, fontWeight: '500' },
  rom: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.mono },
  rowRight: { flex: 1, gap: 4 },
  en: { color: Colors.text, fontSize: 14, fontFamily: Fonts.body, fontWeight: '600' },
  catBadge: { alignSelf: 'flex-start', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 10, fontFamily: Fonts.hud },
  speaker: { fontSize: 18, opacity: 0.5 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: Colors.textDim, fontSize: 15, fontFamily: Fonts.body },
});
