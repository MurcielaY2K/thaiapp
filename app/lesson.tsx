import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getLessonById, getNextLesson, Lesson, WORLDS } from '../data/worlds';
import { VOCABULARY, Word } from '../data/vocabulary';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import PixelSprite from '../components/PixelSprite';
import { SPRITES } from '../data/sprites';

// Reference-only dictionary words never appear in lessons or as distractors.
const POOL = VOCABULARY.filter(w => w.category !== 'dictionary');

// Pass requirements — a lesson only counts as complete when truly learnt.
const PASS_LESSON = 0.7;
const PASS_CHECKPOINT = 0.8;

// Challenge modes. Higher world tiers mix in harder modes:
//  meaning: see Thai      → pick English   (tier 1+)
//  reverse: see English   → pick Thai      (tier 2+)
//  listen:  hear Thai     → pick English   (tier 3+)
//  reading: see phonetics → pick Thai      (tier 4)
type Mode = 'meaning' | 'reverse' | 'listen' | 'reading';
const TIER_MODES: Record<number, Mode[]> = {
  1: ['meaning', 'meaning', 'meaning'],
  2: ['meaning', 'meaning', 'reverse'],
  3: ['meaning', 'reverse', 'listen'],
  4: ['meaning', 'reverse', 'listen', 'reading'],
};
const TIER_QUESTIONS: Record<number, number> = { 1: 5, 2: 6, 3: 6, 4: 7 };
const TIER_CP_QUESTIONS: Record<number, number> = { 1: 10, 2: 10, 3: 12, 4: 12 };

// The self-reported skill level overlays the per-world difficulty tier:
//  beginner     — never reads Thai script. Only meaning (Thai→English) and
//                 listening, and romanization is ALWAYS shown for pronunciation.
//  intermediate — the world's own tier modes (romanization revealed on answer).
//  advanced     — one tier harder everywhere, more script reading.
type Level = 'beginner' | 'intermediate' | 'advanced' | null;

function effectiveModes(tier: number, level: Level): Mode[] {
  if (level === 'beginner') {
    return speechAvailable() ? ['meaning', 'meaning', 'listen'] : ['meaning'];
  }
  const t = level === 'advanced' ? Math.min(4, tier + 1) : tier;
  return TIER_MODES[t].filter(m => m !== 'listen' || speechAvailable());
}

interface Question {
  word: Word;
  mode: Mode;
  choices: string[];
  answer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speechAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}

function buildQuestions(lesson: Lesson, level: Level): Question[] {
  const world = WORLDS.find(w => w.id === lesson.worldId);
  const tier = world?.tier ?? 1;
  const words = lesson.vocabIds
    .map(id => POOL.find(w => w.id === id))
    .filter(Boolean) as Word[];

  const target = lesson.type === 'checkpoint' ? TIER_CP_QUESTIONS[tier] : TIER_QUESTIONS[tier];
  const count = Math.min(words.length, target);
  const selected = shuffle(words).slice(0, count);
  const modes = effectiveModes(tier, level);
  // Beginners get easy, whole-pool distractors; everyone else gets tougher
  // same-category look-alikes (advanced always, intermediate from tier 2 up).
  const hardDistractors = level === 'advanced' || (level !== 'beginner' && tier >= 2);

  return selected.map((word, i) => {
    const mode = modes[i % modes.length];
    const field: 'en' | 'th' = (mode === 'reverse' || mode === 'reading') ? 'th' : 'en';

    let pool = hardDistractors ? POOL.filter(w => w.category === word.category && w.id !== word.id) : [];
    if (pool.length < 3) pool = POOL.filter(w => w.id !== word.id);
    const seen = new Set([word[field]]);
    const distractors: string[] = [];
    for (const w of shuffle(pool)) {
      if (distractors.length >= 3) break;
      if (!seen.has(w[field])) { seen.add(w[field]); distractors.push(w[field]); }
    }
    return { word, mode, choices: shuffle([word[field], ...distractors]), answer: word[field] };
  });
}

function speakThai(text: string) {
  if (!speechAvailable()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  const thai = voices.find(v => v.lang.startsWith('th'));
  if (thai) u.voice = thai;
  window.speechSynthesis.speak(u);
}

const PROMPTS: Record<Mode, string> = {
  meaning: 'WHAT DOES THIS MEAN?',
  reverse: 'HOW DO YOU SAY THIS IN THAI?',
  listen: 'WHAT DID YOU HEAR?',
  reading: 'WHICH WORD READS LIKE THIS?',
};

type Phase = 'quiz' | 'pass' | 'fail' | 'hearts';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLessonById(lessonId ?? '');

  const { hearts, loseHeart, earnXP, completeLesson, setLessonStars, isPremium, skillLevel, lessonProgress } = useProgressStore();
  // Deep-link gate: a lesson is playable only when normal progression has
  // marked it available (or it's a completed replay). Without this, a crafted
  // /lesson?lessonId=… URL skips both progression and the Premium paywall.
  const storedState = lesson ? lessonProgress[lesson.id] : undefined;
  const isUnlocked = storedState === 'available' || storedState === 'complete';
  // Beginners always see the romanization for pronunciation — never Thai-only.
  const romAlways = skillLevel === 'beginner';

  const [questions, setQuestions] = useState(() => lesson ? buildQuestions(lesson, skillLevel) : []);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>('quiz');

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const heartShake = useRef(new Animated.Value(0)).current;

  const animateCardIn = useCallback(() => {
    cardScale.setValue(0.92);
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 140, friction: 8 }).start();
  }, [cardScale]);

  useEffect(() => {
    animateCardIn();
    const q = questions[qIdx];
    if (q && phase === 'quiz' && (q.mode === 'meaning' || q.mode === 'listen')) {
      const t = setTimeout(() => speakThai(q.word.th), 400);
      return () => clearTimeout(t);
    }
  }, [qIdx, questions]);

  const retry = () => {
    if (!lesson) return;
    setQuestions(buildQuestions(lesson, skillLevel));
    setQIdx(0);
    setSelected(null);
    setCorrect(0);
    setPhase('quiz');
  };

  const handleAnswer = (choice: string) => {
    if (selected) return;
    const q = questions[qIdx];
    const isCorrect = choice === q.answer;
    setSelected(choice);
    // For modes where Thai was hidden or unheard, say it now as feedback.
    if (q.mode !== 'meaning') speakThai(q.word.th);

    let ranOutOfHearts = false;
    if (isCorrect) {
      setCorrect(c => c + 1);
    } else {
      if (!isPremium) {
        ranOutOfHearts = hearts <= 1;
        loseHeart();
      }
      Animated.sequence([
        Animated.timing(heartShake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(heartShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (ranOutOfHearts) {
        setPhase('hearts');
      } else if (qIdx + 1 >= questions.length) {
        finishLesson(isCorrect ? correct + 1 : correct);
      } else {
        setSelected(null);
        setQIdx(i => i + 1);
      }
    }, 1100);
  };

  const finishLesson = (finalCorrect: number) => {
    if (!lesson) return;
    const pct = questions.length > 0 ? finalCorrect / questions.length : 0;
    const threshold = lesson.type === 'checkpoint' ? PASS_CHECKPOINT : PASS_LESSON;

    if (pct < threshold) {
      setCorrect(finalCorrect);
      setPhase('fail');
      return;
    }

    const stars = pct >= 0.9 ? 3 : pct >= 0.8 ? 2 : 1;
    const { lesson: nextLesson, isPremium: nextIsPremium } = getNextLesson(lesson.id);
    earnXP(lesson.xpReward);
    completeLesson(lesson.id, nextLesson?.id, nextIsPremium);
    setLessonStars(lesson.id, stars);
    setCorrect(finalCorrect);
    setPhase('pass');
  };

  if (!lesson || !isUnlocked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{!lesson ? 'Lesson not found' : '🔒 Lesson locked — complete the path to get here'}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase !== 'quiz') {
    return (
      <ResultScreen
        lesson={lesson}
        phase={phase}
        correct={correct}
        total={questions.length}
        canRetry={isPremium || hearts > 0}
        onRetry={retry}
      />
    );
  }

  const q = questions[qIdx];
  const isCorrect = selected === q.answer;
  const progress = qIdx / questions.length;
  const thaiChoices = q.mode === 'reverse' || q.mode === 'reading';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <Animated.View style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%` as any },
          ]} />
        </View>
        <Animated.View style={{ transform: [{ translateX: heartShake }] }}>
          <Text style={styles.hearts}>
            {isPremium ? '♾️' : `❤️ ${hearts}`}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.body}>
        {/* Question card */}
        <Animated.View style={[
          styles.questionCard,
          { transform: [{ scale: cardScale }] },
          Platform.OS === 'web' ? { boxShadow: `0 4px 0 0 ${Colors.borderStrong}` } as any : {},
        ]}>
          <Text style={styles.questionPrompt}>{PROMPTS[q.mode]}</Text>

          {q.mode === 'meaning' && (
            <>
              <TouchableOpacity onPress={() => speakThai(q.word.th)} activeOpacity={0.7}>
                <Text style={styles.thaiWord}>{q.word.th}</Text>
              </TouchableOpacity>
              {(romAlways || selected) && <Text style={styles.romText}>{q.word.rom}</Text>}
              <Text style={styles.speakerHint}>🔊 tap to hear</Text>
            </>
          )}

          {q.mode === 'reverse' && (
            <>
              <Text style={styles.enWord}>{q.word.en}</Text>
              {selected && <Text style={styles.romText}>{q.word.rom}</Text>}
            </>
          )}

          {q.mode === 'listen' && (
            <>
              <TouchableOpacity onPress={() => speakThai(q.word.th)} activeOpacity={0.7} style={styles.listenBtn}>
                <Text style={styles.listenIcon}>🔊</Text>
              </TouchableOpacity>
              {(romAlways || selected)
                ? <Text style={styles.thaiWordSmall}>{q.word.th} · {q.word.rom}</Text>
                : <Text style={styles.speakerHint}>tap to replay</Text>}
            </>
          )}

          {q.mode === 'reading' && (
            <>
              <Text style={styles.readingRom}>{q.word.rom}</Text>
              {selected && <Text style={styles.thaiWordSmall}>{q.word.th} — {q.word.en}</Text>}
            </>
          )}
        </Animated.View>

        {/* Choices */}
        <View style={styles.choices}>
          {q.choices.map(choice => {
            const isThisCorrect = choice === q.answer;
            const isThisSelected = choice === selected;
            let borderColor = Colors.borderGlow;
            let bgColor = Colors.card;
            let textColor = Colors.text;

            if (selected) {
              if (isThisCorrect) {
                bgColor = Colors.correctBg;
                borderColor = Colors.correct;
                textColor = Colors.correct;
              } else if (isThisSelected) {
                bgColor = Colors.wrongBg;
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
                <Text style={[
                  thaiChoices ? styles.choiceThai : styles.choiceText,
                  { color: textColor },
                ]}>
                  {choice}
                </Text>
                {selected && isThisCorrect && <Text style={styles.choiceMark}>✓</Text>}
                {selected && isThisSelected && !isCorrect && <Text style={styles.choiceMarkWrong}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.counterText}>{qIdx + 1} / {questions.length}</Text>
      </View>
    </SafeAreaView>
  );
}

function ResultScreen({ lesson, phase, correct, total, canRetry, onRetry }: {
  lesson: Lesson; phase: Exclude<Phase, 'quiz'>; correct: number; total: number;
  canRetry: boolean; onRetry: () => void;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = phase === 'pass';
  const stars = passed ? (pct >= 90 ? 3 : pct >= 80 ? 2 : 1) : 0;
  const threshold = lesson.type === 'checkpoint' ? PASS_CHECKPOINT : PASS_LESSON;
  const sprite = passed
    ? (stars === 3 ? SPRITES.garuda : stars === 2 ? SPRITES.lotus : SPRITES.naga)
    : SPRITES.nagaSleep;

  const popScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(popScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: popScale }] }}>
          <PixelSprite sprite={sprite} size={96} />
        </Animated.View>

        {passed ? (
          <>
            <Text style={styles.doneStars}>
              {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </Text>
            <Text style={styles.doneTitle}>
              {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great job!' : 'Passed!'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.doneTitle}>
              {phase === 'hearts' ? 'Out of hearts!' : 'Not quite!'}
            </Text>
            <Text style={styles.failHint}>
              {phase === 'hearts'
                ? 'Hearts refill over time — or go Premium for unlimited.'
                : `You need ${Math.round(threshold * 100)}% to pass this ${lesson.type === 'checkpoint' ? 'checkpoint' : 'lesson'}.`}
            </Text>
          </>
        )}
        <Text style={styles.doneSub}>{lesson.title}</Text>

        <View style={styles.doneStats}>
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>{pct}%</Text>
            <Text style={styles.doneStatLabel}>ACCURACY</Text>
          </View>
          <View style={styles.doneStatDiv} />
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>{passed ? `+${lesson.xpReward}` : '+0'}</Text>
            <Text style={styles.doneStatLabel}>XP</Text>
          </View>
          <View style={styles.doneStatDiv} />
          <View style={styles.doneStat}>
            <Text style={styles.doneStatValue}>{correct}/{total}</Text>
            <Text style={styles.doneStatLabel}>CORRECT</Text>
          </View>
        </View>

        {!passed && canRetry && (
          <TouchableOpacity
            style={[styles.continueBtn, Platform.OS === 'web' ? { boxShadow: `0 5px 0 0 ${Colors.emberDeep}` } as any : {}]}
            onPress={onRetry}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>TRY AGAIN</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            passed ? styles.continueBtn : styles.exitBtn,
            passed && Platform.OS === 'web' ? { boxShadow: `0 5px 0 0 ${Colors.emberDeep}` } as any : {},
          ]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={passed ? styles.continueBtnText : styles.exitBtnText}>
            {passed ? 'CONTINUE' : 'EXIT'}
          </Text>
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
  closeText: { color: Colors.textDim, fontSize: 18 },
  progressTrack: {
    flex: 1, height: 8, borderRadius: 4,
    backgroundColor: Colors.border, overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.ember,
    borderRadius: 4,
  },
  hearts: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.hud,
    minWidth: 44,
    textAlign: 'right',
  },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 20 },

  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    gap: 10,
    minHeight: 170,
    justifyContent: 'center',
  },
  questionPrompt: {
    color: Colors.textDim,
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 2,
  },
  thaiWord: {
    color: Colors.text,
    fontSize: 56,
    fontFamily: Fonts.body,
    fontWeight: '400',
    letterSpacing: 2,
    textAlign: 'center',
  },
  thaiWordSmall: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.body,
    textAlign: 'center',
  },
  enWord: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: Fonts.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  readingRom: {
    color: Colors.text,
    fontSize: 30,
    fontFamily: Fonts.mono,
    textAlign: 'center',
  },
  listenBtn: {
    width: 88, height: 88, borderRadius: 20,
    backgroundColor: Colors.ember,
    borderWidth: 2, borderColor: Colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: `0 4px 0 0 ${Colors.borderStrong}` } as any : {}),
  },
  listenIcon: { fontSize: 40 },
  romText: { color: Colors.lavenderDark, fontSize: 18, fontFamily: Fonts.mono },
  speakerHint: { color: Colors.textMuted, fontSize: 11, fontFamily: Fonts.body, marginTop: 4 },

  choices: { gap: 10 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  choiceText: { fontSize: 15, fontFamily: Fonts.body, fontWeight: '600', flex: 1 },
  choiceThai: { fontSize: 22, fontFamily: Fonts.body, fontWeight: '500', flex: 1 },
  choiceMark: { color: Colors.correct, fontSize: 18, fontWeight: '700' },
  choiceMarkWrong: { color: Colors.wrong, fontSize: 18, fontWeight: '700' },

  footer: { alignItems: 'center', paddingBottom: 24 },
  counterText: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.hud },

  errorText: { color: Colors.textDim, fontSize: 15, fontFamily: Fonts.body },
  backBtn: {
    backgroundColor: Colors.card, borderRadius: 6,
    paddingVertical: 12, paddingHorizontal: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  backBtnText: { color: Colors.text, fontSize: 14, fontFamily: Fonts.body },

  // Result screen
  doneStars: {
    color: Colors.gold,
    fontSize: 32,
    fontFamily: Fonts.hud,
    letterSpacing: 6,
  },
  doneTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Fonts.display,
    fontWeight: '700',
  },
  failHint: {
    color: Colors.textDim,
    fontSize: 13,
    fontFamily: Fonts.body,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 19,
  },
  doneSub: { color: Colors.textDim, fontSize: 14, fontFamily: Fonts.body },
  doneStats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    paddingVertical: 20,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 360,
  },
  doneStat: { flex: 1, alignItems: 'center', gap: 6 },
  doneStatValue: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: Fonts.hud,
  },
  doneStatLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontFamily: Fonts.hud,
    letterSpacing: 1,
  },
  doneStatDiv: { width: 1, backgroundColor: Colors.border },
  continueBtn: {
    backgroundColor: Colors.ember,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
  },
  continueBtnText: {
    color: Colors.onBrand,
    fontSize: 14,
    fontFamily: Fonts.hud,
    fontWeight: '700',
    letterSpacing: 2,
  },
  exitBtn: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  exitBtnText: {
    color: Colors.textDim,
    fontSize: 13,
    fontFamily: Fonts.hud,
    letterSpacing: 2,
  },
});
