import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getLessonById, getNextLesson, Lesson } from '../data/worlds';
import { VOCABULARY, Word } from '../data/vocabulary';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';

const SCREEN_W = Dimensions.get('window').width;
const QUESTIONS_PER_LESSON = 5;
const DISTRACTOR_POOL = VOCABULARY;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(lesson: Lesson): { word: Word; choices: string[] }[] {
  const words = lesson.vocabIds
    .map(id => VOCABULARY.find(w => w.id === id))
    .filter(Boolean) as Word[];

  const count = lesson.type === 'checkpoint'
    ? Math.min(words.length, 10)
    : Math.min(words.length, QUESTIONS_PER_LESSON);

  const selected = shuffle(words).slice(0, count);

  return selected.map(word => {
    const distractors = shuffle(
      DISTRACTOR_POOL.filter(w => w.id !== word.id)
    ).slice(0, 3).map(w => w.en);
    const choices = shuffle([word.en, ...distractors]);
    return { word, choices };
  });
}

function speakThai(text: string) {
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

type Phase = 'quiz' | 'done';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLessonById(lessonId ?? '');

  const { hearts, loseHeart, earnXP, completeLesson, isPremium } = useProgressStore();

  const [questions] = useState(() => lesson ? buildQuestions(lesson) : []);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>('quiz');

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const heartShake = useRef(new Animated.Value(0)).current;

  const animateCardIn = useCallback(() => {
    cardScale.setValue(0.92);
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 140, friction: 8 }).start();
  }, [cardScale]);

  useEffect(() => {
    animateCardIn();
    if (questions[qIdx]) {
      const t = setTimeout(() => speakThai(questions[qIdx].word.th), 400);
      return () => clearTimeout(t);
    }
  }, [qIdx]);

  const handleAnswer = (choice: string) => {
    if (selected) return;
    const isCorrect = choice === questions[qIdx].word.en;
    setSelected(choice);

    if (isCorrect) {
      setCorrect(c => c + 1);
    } else {
      if (!isPremium) loseHeart();
      Animated.sequence([
        Animated.timing(heartShake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    feedbackOpacity.setValue(0);
    Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    setTimeout(() => {
      feedbackOpacity.setValue(0);
      if (qIdx + 1 >= questions.length) {
        finishLesson(isCorrect ? correct + 1 : correct);
      } else {
        setSelected(null);
        setQIdx(i => i + 1);
      }
    }, 1100);
  };

  const finishLesson = (finalCorrect: number) => {
    if (!lesson) return;
    const { lesson: nextLesson, isPremium: nextIsPremium } = getNextLesson(lesson.id);
    earnXP(lesson.xpReward);
    completeLesson(lesson.id, nextLesson?.id, nextIsPremium);
    setPhase('done');
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'done') {
    return <DoneScreen lesson={lesson} correct={correct} total={questions.length} />;
  }

  const q = questions[qIdx];
  const isCorrect = selected === q.word.en;
  const progress = (qIdx) / questions.length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
        </View>
        <Animated.View style={{ transform: [{ translateX: heartShake }] }}>
          <Text style={styles.hearts}>
            {isPremium ? '♾️' : `❤️ ${hearts}`}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.body}>
        {/* Question card */}
        <Animated.View style={[styles.questionCard, { transform: [{ scale: cardScale }] }]}>
          <Text style={styles.questionPrompt}>What does this mean?</Text>
          <TouchableOpacity onPress={() => speakThai(q.word.th)} activeOpacity={0.7}>
            <Text style={styles.thaiWord}>{q.word.th}</Text>
          </TouchableOpacity>
          {selected && (
            <Text style={styles.romText}>{q.word.rom}</Text>
          )}
          <Text style={styles.speakerHint}>🔊 tap to hear</Text>
        </Animated.View>

        {/* Choices */}
        <View style={styles.choices}>
          {q.choices.map(choice => {
            let bgColor = Colors.card;
            let borderColor = Colors.border;
            let textColor = Colors.text;
            if (selected) {
              if (choice === q.word.en) {
                bgColor = '#1a3d2a';
                borderColor = Colors.correct;
                textColor = Colors.correct;
              } else if (choice === selected && !isCorrect) {
                bgColor = '#3d1a1a';
                borderColor = Colors.wrong;
                textColor = Colors.wrong;
              }
            }
            return (
              <TouchableOpacity
                key={choice}
                style={[styles.choice, { backgroundColor: bgColor, borderColor }]}
                onPress={() => handleAnswer(choice)}
                activeOpacity={0.8}
                disabled={!!selected}
              >
                <Text style={[styles.choiceText, { color: textColor }]}>{choice}</Text>
                {selected && choice === q.word.en && (
                  <Text style={styles.choiceMark}>✓</Text>
                )}
                {selected && choice === selected && !isCorrect && (
                  <Text style={styles.choiceMarkWrong}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Question counter */}
      <View style={styles.footer}>
        <Text style={styles.counterText}>{qIdx + 1} / {questions.length}</Text>
      </View>
    </SafeAreaView>
  );
}

function DoneScreen({ lesson, correct, total }: { lesson: Lesson; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.doneStars}>{Array.from({ length: stars }).map(() => '⭐').join('')}</Text>
        <Text style={styles.doneTitle}>Lesson Complete!</Text>
        <Text style={styles.doneSub}>{lesson.title}</Text>

        <View style={styles.doneStats}>
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>{pct}%</Text>
            <Text style={styles.doneStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.doneStatDiv} />
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>+{lesson.xpReward}</Text>
            <Text style={styles.doneStatLabel}>XP earned</Text>
          </View>
          <View style={styles.doneStatDiv} />
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>{correct}/{total}</Text>
            <Text style={styles.doneStatLabel}>Correct</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: { padding: 6 },
  closeText: { color: Colors.textDim, fontSize: 20, fontWeight: '600' },
  progressTrack: {
    flex: 1, height: 10, borderRadius: 5,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 5 },
  hearts: { color: Colors.text, fontSize: 15, fontWeight: '700', minWidth: 44, textAlign: 'right' },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 24 },

  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 10,
  },
  questionPrompt: { color: Colors.textDim, fontSize: 14, letterSpacing: 0.5 },
  thaiWord: { color: Colors.text, fontSize: 64, fontWeight: '300', letterSpacing: 4 },
  romText: { color: Colors.accent, fontSize: 18 },
  speakerHint: { color: Colors.textDim, fontSize: 12, marginTop: 4 },

  choices: { gap: 10 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  choiceText: { fontSize: 16, fontWeight: '600', flex: 1 },
  choiceMark: { color: Colors.correct, fontSize: 20, fontWeight: '700' },
  choiceMarkWrong: { color: Colors.wrong, fontSize: 20, fontWeight: '700' },

  footer: { alignItems: 'center', paddingBottom: 24 },
  counterText: { color: Colors.textDim, fontSize: 13 },

  errorText: { color: Colors.textDim, fontSize: 16 },
  backBtn: {
    backgroundColor: Colors.card, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  backBtnText: { color: Colors.text, fontSize: 15 },

  // Done screen
  doneStars: { fontSize: 48, letterSpacing: 4 },
  doneTitle: { color: Colors.text, fontSize: 32, fontWeight: '800' },
  doneSub: { color: Colors.textDim, fontSize: 16 },
  doneStats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 360,
  },
  doneStat: { flex: 1, alignItems: 'center', gap: 6 },
  doneStatValue: { color: Colors.accent, fontSize: 28, fontWeight: '800' },
  doneStatLabel: { color: Colors.textDim, fontSize: 12, letterSpacing: 0.5 },
  doneStatDiv: { width: 1, backgroundColor: Colors.border },
  continueBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
