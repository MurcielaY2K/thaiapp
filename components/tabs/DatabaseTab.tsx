import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { VOCABULARY, Word } from '../../data/vocabulary';
import { Colors } from '../../constants/colors';

const CATEGORIES = ['all', 'greetings', 'numbers', 'time', 'food', 'places', 'colors', 'family', 'verbs', 'adjectives'];

const CAT_EMOJI: Record<string, string> = {
  all: '🔍', greetings: '🙏', numbers: '🔢', time: '⏰',
  food: '🍜', places: '📍', colors: '🎨', family: '👨‍👩‍👧',
  verbs: '🏃', adjectives: '⚖️',
};

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
  return (
    <TouchableOpacity style={styles.row} onPress={() => speak(word.th)} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.thai}>{word.th}</Text>
        <Text style={styles.rom}>{word.rom}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.en}>{word.en}</Text>
        <View style={[styles.catBadge, { backgroundColor: catColor(word.category) + '20' }]}>
          <Text style={[styles.catText, { color: catColor(word.category) }]}>
            {CAT_EMOJI[word.category] ?? '•'} {word.category}
          </Text>
        </View>
      </View>
      <Text style={styles.speaker}>🔊</Text>
    </TouchableOpacity>
  );
}

function catColor(cat: string) {
  const MAP: Record<string, string> = {
    greetings: '#ff9f43', numbers: '#a78bfa', time: '#60a5fa',
    food: '#34d399', places: '#f59e0b', colors: '#ec4899',
    family: '#fb923c', verbs: '#6ee7b7', adjectives: '#c4b5fd',
  };
  return MAP[cat] ?? Colors.textDim;
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
        renderItem={({ item: c }) => (
          <TouchableOpacity
            style={[styles.catChip, cat === c && styles.catChipActive]}
            onPress={() => setCat(c)}
            activeOpacity={0.75}
          >
            <Text style={[styles.catChipText, cat === c && styles.catChipTextActive]}>
              {CAT_EMOJI[c]} {c === 'all' ? 'All' : c}
            </Text>
          </TouchableOpacity>
        )}
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
  heading: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  count: { color: Colors.textDim, fontSize: 14 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, color: Colors.text, fontSize: 15 },
  clear: { color: Colors.textDim, fontSize: 16, paddingHorizontal: 4 },

  catBar: { flexGrow: 0, marginBottom: 6 },
  cats: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
  catChipText: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: Colors.accent },

  list: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowLeft: { width: 110, gap: 3 },
  thai: { color: Colors.text, fontSize: 20, fontWeight: '500' },
  rom: { color: Colors.textDim, fontSize: 12 },
  rowRight: { flex: 1, gap: 4 },
  en: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  catBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  catText: { fontSize: 10, fontWeight: '600' },
  speaker: { fontSize: 18, opacity: 0.6 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: Colors.textDim, fontSize: 16 },
});
