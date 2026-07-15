import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { speakThai, speakThaiAsync, stopSpeaking } from '../lib/audio';
import { Colors } from '../constants/colors';
import PixelSprite from '../components/PixelSprite';
import { SPRITES } from '../data/sprites';
import { READING_LESSONS, type Sentence, type Token } from '../data/reading';
import { PHRASE_CATEGORIES } from '../data/phrases';

function speak(text: string, rate = 0.75) {
  speakThai(text, rate);
}

const SPEEDS = [
  { label: '0.5×', rate: 0.5 },
  { label: '0.75×', rate: 0.75 },
  { label: '1×', rate: 1.0 },
];

type Selected = { s: number; t: number } | null;
// 'stories' for the illustrated lessons, otherwise a category key
type Tab = 'stories' | string;

export default function ReadScreen() {
  const [tab, setTab] = useState<Tab>('stories');
  const [lessonIdx, setLessonIdx] = useState(0);
  const [showPhonemic, setShowPhonemic] = useState(true);
  const [showTranslate, setShowTranslate] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);
  const [speedIdx, setSpeedIdx] = useState(1); // default 0.75×
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(false);
  const rate = SPEEDS[speedIdx].rate;

  const lesson = READING_LESSONS[lessonIdx];
  const category = useMemo(
    () => PHRASE_CATEGORIES.find(c => c.key === tab) ?? null,
    [tab]
  );

  const sentences: Sentence[] = tab === 'stories' ? lesson.sentences : (category?.sentences ?? []);

  const selectedToken: Token | null = useMemo(() => {
    if (!selected) return null;
    return sentences[selected.s]?.tokens[selected.t] ?? null;
  }, [selected, sentences]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setSelected(null);
  };

  const goLesson = (next: number) => {
    setLessonIdx((next + READING_LESSONS.length) % READING_LESSONS.length);
    setSelected(null);
  };

  const tapWord = (s: number, t: number, token: Token) => {
    if (playing) stopReading();
    setSelected({ s, t });
    speak(token.th, rate);
  };

  const stopReading = () => {
    playRef.current = false;
    stopSpeaking();
    setPlaying(false);
  };

  // Read every sentence word-by-word, highlighting each token as it's spoken.
  const readAll = async () => {
    if (playing) { stopReading(); return; }
    setPlaying(true);
    playRef.current = true;
    for (let s = 0; s < sentences.length; s++) {
      const toks = sentences[s].tokens;
      for (let t = 0; t < toks.length; t++) {
        if (!playRef.current) return;
        setSelected({ s, t });
        await speakThaiAsync(toks[t].th, rate);
      }
    }
    playRef.current = false;
    setPlaying(false);
  };

  // Stop any playback when switching tab / lesson / leaving the screen.
  useEffect(() => () => stopReading(), []);
  useEffect(() => { stopReading(); }, [tab, lessonIdx]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.close} onPress={() => router.replace('/')}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Read</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Tab label="📜 Stories" active={tab === 'stories'} onPress={() => switchTab('stories')} />
          {PHRASE_CATEGORIES.map(c => (
            <Tab
              key={c.key}
              label={`${c.icon} ${c.label}`}
              active={tab === c.key}
              onPress={() => switchTab(c.key)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'stories' ? (
          <>
            {/* Lesson nav */}
            <View style={styles.lessonNav}>
              <TouchableOpacity style={styles.navArrow} onPress={() => goLesson(lessonIdx - 1)}>
                <Text style={styles.navArrowText}>‹</Text>
              </TouchableOpacity>
              <View style={styles.lessonTitleWrap}>
                <Text style={styles.title}>{lesson.title}</Text>
                <Text style={styles.titleEn}>{lesson.titleEn} · {lessonIdx + 1}/{READING_LESSONS.length}</Text>
              </View>
              <TouchableOpacity style={styles.navArrow} onPress={() => goLesson(lessonIdx + 1)}>
                <Text style={styles.navArrowText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Illustration */}
            <View style={styles.scene}>
              <View style={styles.sky} pointerEvents="none">
                <View style={styles.sunWrap}>
                  <PixelSprite sprite={SPRITES.sun} size={34} opacity={0.95} />
                </View>
              </View>
              <View style={styles.ground} />
              <View style={styles.sceneRow} pointerEvents="none">
                {lesson.scene.map((item, i) => (
                  <PixelSprite
                    key={i}
                    sprite={SPRITES[item.sprite]}
                    size={item.size}
                    opacity={item.opacity ?? 1}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          category && (
            <View style={styles.catHeader}>
              <Text style={styles.catIcon}>{category.icon}</Text>
              <View>
                <Text style={styles.title}>{category.th}</Text>
                <Text style={styles.titleEn}>{category.label} · everyday phrases</Text>
              </View>
            </View>
          )
        )}

        {/* Toggles */}
        <View style={styles.toggles}>
          <Toggle label="Phonetic" on={showPhonemic} onPress={() => setShowPhonemic(v => !v)} />
          <Toggle label="Translate" on={showTranslate} onPress={() => setShowTranslate(v => !v)} />
          <TouchableOpacity
            style={styles.speedBtn}
            onPress={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)}
            activeOpacity={0.8}
          >
            <Text style={styles.speedBtnText}>🐢 {SPEEDS[speedIdx].label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.readAll, playing && styles.readAllStop]}
            onPress={readAll}
            activeOpacity={0.8}
          >
            <Text style={[styles.readAllText, playing && styles.readAllStopText]}>
              {playing ? '■  Stop' : '▶  Read all'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected word bar */}
        <View style={[styles.wordBar, !selectedToken && styles.wordBarEmpty]}>
          {selectedToken ? (
            <>
              <Text style={styles.wordBarTh}>{selectedToken.th}</Text>
              <Text style={styles.wordBarRom}>{selectedToken.rom}</Text>
              <Text style={styles.wordBarEn}>{selectedToken.en}</Text>
            </>
          ) : (
            <Text style={styles.wordBarHint}>Tap a word to hear it and see its meaning</Text>
          )}
        </View>

        {/* Sentences */}
        <View style={styles.sentences}>
          {sentences.map((sentence, s) => (
            <SentenceRow
              key={s}
              sentence={sentence}
              sIndex={s}
              showPhonemic={showPhonemic}
              showTranslate={showTranslate}
              selected={selected}
              onTapWord={tapWord}
              onSpeak={() => { if (playing) stopReading(); speak(sentence.tokens.map(tk => tk.th).join(''), rate); }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SentenceRow({
  sentence, sIndex, showPhonemic, showTranslate, selected, onTapWord, onSpeak,
}: {
  sentence: Sentence;
  sIndex: number;
  showPhonemic: boolean;
  showTranslate: boolean;
  selected: Selected;
  onTapWord: (s: number, t: number, token: Token) => void;
  onSpeak: () => void;
}) {
  return (
    <View style={styles.sentenceCard}>
      <View style={styles.sentenceMain}>
        <View style={styles.wordWrap}>
          {sentence.tokens.map((token, t) => {
            const isSel = selected?.s === sIndex && selected?.t === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.word, isSel && styles.wordSelected]}
                onPress={() => onTapWord(sIndex, t, token)}
                activeOpacity={0.7}
              >
                <Text style={[styles.wordTh, isSel && styles.wordThSelected]}>{token.th}</Text>
                {showPhonemic && (
                  <Text style={[styles.wordRom, isSel && styles.wordRomSelected]}>{token.rom}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.speakBtn} onPress={onSpeak} activeOpacity={0.7}>
          <Text style={styles.speakIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      {showTranslate && <Text style={styles.translation}>{sentence.en}</Text>}
    </View>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.toggle, on && styles.toggleOn]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleDot, on && styles.toggleDotOn]} />
      <Text style={[styles.toggleLabel, on && styles.toggleLabelOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  close: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  closeText: { color: Colors.textDim, fontSize: 16 },
  screenTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', letterSpacing: 1 },

  tabs: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: 'rgba(255,159,67,0.14)', borderColor: Colors.accent },
  tabText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.accent },

  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 36 },

  lessonNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  lessonTitleWrap: { flex: 1, alignItems: 'center' },
  navArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  navArrowText: { color: Colors.accent, fontSize: 22, lineHeight: 24, fontWeight: '700' },

  title: { color: Colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  titleEn: { color: Colors.textDim, fontSize: 13, textAlign: 'center', marginTop: 2, letterSpacing: 0.5 },

  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4, paddingVertical: 6 },
  catIcon: { fontSize: 40 },

  scene: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: '#16213a',
    justifyContent: 'flex-end',
  },
  sky: { ...StyleSheet.absoluteFillObject },
  sunWrap: { position: 'absolute', top: 16, right: 20 },
  ground: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 30,
    backgroundColor: '#1f7a44',
  },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 18,
  },

  toggles: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap', rowGap: 10 },
  speedBtn: {
    marginLeft: 'auto',
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  speedBtnText: { color: Colors.textDim, fontSize: 13, fontWeight: '700' },
  readAllStop: { backgroundColor: Colors.wrong },
  readAllStopText: { color: '#fff' },
  toggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  toggleOn: { backgroundColor: 'rgba(255,159,67,0.14)', borderColor: Colors.accent },
  toggleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  toggleDotOn: { backgroundColor: Colors.accent },
  toggleLabel: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
  toggleLabelOn: { color: Colors.accent },
  readAll: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  readAllText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },

  wordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    minHeight: 46,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  wordBarEmpty: { borderColor: Colors.border },
  wordBarTh: { color: Colors.text, fontSize: 22, fontWeight: '600' },
  wordBarRom: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  wordBarEn: { color: Colors.textDim, fontSize: 14, flexShrink: 1 },
  wordBarHint: { color: Colors.textDim, fontSize: 13, fontStyle: 'italic' },

  sentences: { marginTop: 16, gap: 12 },
  sentenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  sentenceMain: { flexDirection: 'row', alignItems: 'flex-start' },
  wordWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 6 },
  word: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  wordSelected: { backgroundColor: 'rgba(255,159,67,0.18)' },
  wordTh: { color: Colors.text, fontSize: 28, fontWeight: '400' },
  wordThSelected: { color: Colors.accent },
  wordRom: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
  wordRomSelected: { color: Colors.accent },
  speakBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    marginLeft: 8,
  },
  speakIcon: { fontSize: 16 },
  translation: {
    color: Colors.textDim,
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
