import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSrsStore } from '../store/srsStore';
import { VOCABULARY } from '../data/vocabulary';
import { Colors } from '../constants/colors';

const ALL_ENGLISH = VOCABULARY.map(w => w.en);

function makeOptions(correct: string): string[] {
  const others = ALL_ENGLISH
    .filter(e => e !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [...others, correct].sort(() => Math.random() - 0.5);
}

export default function SessionScreen() {
  const { currentSession, recordAnswer } = useSrsStore();

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>(() =>
    currentSession[0] ? makeOptions(currentSession[0].en) : []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentSession.length === 0) router.replace('/');
  }, []);

  useEffect(() => {
    const w = currentSession[index];
    if (w) {
      setOptions(makeOptions(w.en));
      setSelected(null);
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
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (index + 1 >= currentSession.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 700);
  };

  if (done) {
    const wrong = currentSession.length - score;
    const perfect = wrong === 0;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.done}>
          <Text style={styles.doneEmoji}>{perfect ? '🎉' : '✓'}</Text>
          <Text style={styles.doneTitle}>
            {perfect ? 'Perfect!' : 'Session done!'}
          </Text>
          <View style={styles.doneScoreRow}>
            <Text style={styles.doneCorrect}>{score} correct</Text>
            {wrong > 0 && <Text style={styles.doneWrong}>  ·  {wrong} missed</Text>}
          </View>
          {wrong > 0 && (
            <Text style={styles.doneHint}>Missed words will come back sooner.</Text>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = (index + 1) / currentSession.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={styles.progressText}>{index + 1} / {currentSession.length}</Text>

      {/* Thai word */}
      <View style={styles.wordArea}>
        <Text style={styles.thaiWord}>{word.th}</Text>
      </View>

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
                {opt}
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
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    color: Colors.textDim,
    fontSize: 13,
    textAlign: 'right',
    paddingHorizontal: 24,
    paddingTop: 10,
    letterSpacing: 1,
  },
  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  thaiWord: {
    color: Colors.text,
    fontSize: 60,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 3,
  },
  options: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 12,
  },
  option: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 19,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: 'rgba(46,204,113,0.12)',
    borderColor: Colors.correct,
  },
  optionWrong: {
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderColor: Colors.wrong,
  },
  optionText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '500',
  },
  optionTextCorrect: { color: Colors.correct },
  optionTextWrong: { color: Colors.wrong },
  // Done screen
  done: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
    backgroundColor: Colors.bg,
  },
  doneEmoji: { fontSize: 72, marginBottom: 8 },
  doneTitle: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  doneScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneCorrect: { color: Colors.correct, fontSize: 18, fontWeight: '600' },
  doneWrong: { color: Colors.textDim, fontSize: 18 },
  doneHint: {
    color: Colors.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 56,
    marginTop: 12,
    shadowColor: Colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '700',
  },
});
