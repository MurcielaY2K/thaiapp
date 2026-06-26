import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform,
  Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSrsStore } from '../store/srsStore';
import { VOCABULARY } from '../data/vocabulary';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import PixelSprite from '../components/PixelSprite';
import { SPRITES } from '../data/sprites';

const ALL_ENGLISH = VOCABULARY.map(w => w.en);

function speak(text: string) {
  if (Platform.OS !== 'web') return;
  const w = window as any;
  if (!w.speechSynthesis) return;
  w.speechSynthesis.cancel();
  const u = new w.SpeechSynthesisUtterance(text);
  u.lang = 'th-TH'; u.rate = 0.75;
  const thai = (w.speechSynthesis.getVoices?.() ?? [])
    .find((v: any) => /th(-|_)?/i.test(v.lang));
  if (thai) u.voice = thai;
  w.speechSynthesis.speak(u);
}

function makeOptions(correct: string): string[] {
  const others = ALL_ENGLISH
    .filter(e => e !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [...others, correct].sort(() => Math.random() - 0.5);
}

export default function SessionScreen() {
  const { currentSession, recordAnswer, bumpStreak } = useSrsStore();

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>(() =>
    currentSession[0] ? makeOptions(currentSession[0].en) : []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(false);

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const comboScale = useRef(new Animated.Value(1)).current;

  const animateCard = () => {
    cardScale.setValue(0.92);
    Animated.spring(cardScale, {
      toValue: 1, useNativeDriver: true, tension: 120, friction: 8,
    }).start();
  };

  const animateCombo = () => {
    comboScale.setValue(1.5);
    Animated.spring(comboScale, {
      toValue: 1, useNativeDriver: true, tension: 200, friction: 6,
    }).start();
  };

  useEffect(() => {
    if (currentSession.length === 0) router.replace('/');
  }, []);

  useEffect(() => {
    const w = currentSession[index];
    if (w) {
      setOptions(makeOptions(w.en));
      setSelected(null);
      animateCard();
      // Auto-speak the Thai word after a short delay for the animation
      const t = setTimeout(() => speak(w.th), 400);
      return () => clearTimeout(t);
    }
  }, [index]);

  if (currentSession.length === 0) return null;

  const word = currentSession[index];

  const handleSelect = (option: string) => {
    if (selected !== null || !word) return;
    setSelected(option);
    const correct = option === word.en;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        correct
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }

    recordAnswer(word.id, correct);
    if (correct) {
      setScore(s => s + 1);
      setCombo(c => { const next = c + 1; if (next > 1) animateCombo(); return next; });
    } else {
      setCombo(0);
    }

    setTimeout(() => {
      if (index + 1 >= currentSession.length) {
        bumpStreak();
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 800);
  };

  if (done) {
    const wrong = currentSession.length - score;
    const pct = Math.round((score / currentSession.length) * 100);
    const perfect = wrong === 0;
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.done}>
          <PixelSprite sprite={perfect ? SPRITES.garuda : SPRITES.naga} size={120} />
          <Text style={styles.starsRow}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
          <Text style={styles.doneTitle}>
            {perfect ? 'Perfect! 🎉' : pct >= 60 ? 'Great work!' : 'Keep going!'}
          </Text>
          <View style={styles.doneScoreRow}>
            <Text style={styles.doneCorrect}>{score} correct</Text>
            {wrong > 0 && <Text style={styles.doneWrong}>  ·  {wrong} missed</Text>}
          </View>
          <Text style={styles.donePct}>{pct}%</Text>
          {wrong > 0 && (
            <Text style={styles.doneHint}>Missed words will come back sooner.</Text>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/')}>
            <Text style={styles.doneBtnText}>Done  →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = (index + 1) / currentSession.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar with progress and close */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/')} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={styles.progressText}>{index + 1}/{currentSession.length}</Text>
      </View>

      {/* Combo streak */}
      {combo >= 2 && (
        <Animated.View style={[styles.comboWrap, { transform: [{ scale: comboScale }] }]}>
          <Text style={styles.comboText}>🔥 {combo} streak</Text>
        </Animated.View>
      )}

      {/* Thai word card */}
      <Animated.View style={[styles.wordArea, { transform: [{ scale: cardScale }] }]}>
        <Text style={styles.categoryTag}>{word.category.toUpperCase()}</Text>
        <Text style={styles.thaiWord}>{word.th}</Text>
        <Text style={[styles.romText, selected && styles.romTextRevealed]}>
          {word.rom}
        </Text>
        <TouchableOpacity style={styles.speakBtn} onPress={() => speak(word.th)} activeOpacity={0.7}>
          <Text style={styles.speakBtnText}>🔊 tap to hear</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Answer options */}
      <View style={styles.options}>
        {options.map(opt => {
          const isCorrect = opt === word.en;
          const isSelected = selected === opt;
          const showCorrect = selected !== null && isCorrect;
          const showWrong = isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.option,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelect(opt)}
              disabled={selected !== null}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionText,
                showCorrect && styles.optionTextCorrect,
                showWrong && styles.optionTextWrong,
              ]}>
                {showCorrect ? '✓  ' : showWrong ? '✗  ' : ''}{opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 4,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderGlow,
  },
  closeBtnText: { color: Colors.textDim, fontSize: 13 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.lavender,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textDim,
    fontSize: 11,
    fontFamily: Fonts.hud,
    width: 40,
    textAlign: 'right',
  },

  comboWrap: {
    alignSelf: 'center',
    backgroundColor: 'rgba(251,146,60,0.12)',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.streak,
    marginTop: 4,
  },
  comboText: { color: Colors.streak, fontSize: 13, fontFamily: Fonts.hud },

  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  categoryTag: {
    color: Colors.textDim,
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 2.5,
  },
  thaiWord: {
    color: Colors.text,
    fontSize: 72,
    fontFamily: Fonts.body,
    fontWeight: '200',
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 90,
  },
  romText: {
    color: 'transparent',
    fontSize: 18,
    fontFamily: Fonts.body,
    letterSpacing: 0.5,
    marginTop: -4,
  },
  romTextRevealed: { color: Colors.lavender },

  speakBtn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
  },
  speakBtnText: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.body },

  options: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 10,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderGlow,
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: Colors.correctBg,
    borderColor: Colors.correct,
  },
  optionWrong: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.wrong,
  },
  optionText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.body,
    fontWeight: '600',
  },
  optionTextCorrect: { color: Colors.correct },
  optionTextWrong: { color: Colors.wrong },

  // Done screen
  done: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  starsRow: { fontSize: 32, letterSpacing: 6, color: Colors.gold, fontFamily: Fonts.hud },
  doneTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: Fonts.display,
    fontWeight: '700',
    textAlign: 'center',
  },
  donePct: {
    color: Colors.lavender,
    fontSize: 48,
    fontFamily: Fonts.hud,
    letterSpacing: 2,
  },
  doneScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneCorrect: { color: Colors.correct, fontSize: 16, fontFamily: Fonts.hud },
  doneWrong: { color: Colors.textDim, fontSize: 16, fontFamily: Fonts.hud },
  doneHint: {
    color: Colors.textDim,
    fontSize: 12,
    fontFamily: Fonts.body,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: Colors.lavender,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 56,
    marginTop: 8,
  },
  doneBtnText: {
    color: Colors.bg,
    fontSize: 14,
    fontFamily: Fonts.hud,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
