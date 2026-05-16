import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard } from '@engine/types';
import { useGame } from '../context/GameContext';

type QuizMode = 'thai_to_english' | 'english_to_thai' | 'romanization';

interface QuizQuestion {
  card: VocabCard;
  mode: QuizMode;
  prompt: string;
  promptSub?: string;
  options: string[];
  correctIndex: number;
}

const QUIZ_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(correct: VocabCard, pool: VocabCard[], field: 'englishMeaning' | 'thai' | 'romanization'): string[] {
  const sameCategory = pool.filter(c => c.id !== correct.id && c.category === correct.category);
  const fallback = pool.filter(c => c.id !== correct.id);
  const candidates = sameCategory.length >= 3 ? sameCategory : fallback;
  return shuffle(candidates).slice(0, 3).map(c => c[field] as string);
}

function buildQuestion(card: VocabCard, mode: QuizMode, pool: VocabCard[]): QuizQuestion {
  if (mode === 'thai_to_english') {
    const correct = card.englishMeaning;
    const dists = distractors(card, pool, 'englishMeaning');
    const options = shuffle([correct, ...dists]);
    return { card, mode, prompt: card.thai, promptSub: card.romanization, options, correctIndex: options.indexOf(correct) };
  }
  if (mode === 'english_to_thai') {
    const correct = card.thai;
    const dists = distractors(card, pool, 'thai');
    const options = shuffle([correct, ...dists]);
    return { card, mode, prompt: card.englishMeaning, options, correctIndex: options.indexOf(correct) };
  }
  // romanization
  const correct = card.romanization;
  const dists = distractors(card, pool, 'romanization');
  const options = shuffle([correct, ...dists]);
  return { card, mode, prompt: card.thai, promptSub: card.englishMeaning, options, correctIndex: options.indexOf(correct) };
}

const MODES: { id: QuizMode; icon: string; title: string; desc: string }[] = [
  { id: 'thai_to_english', icon: '🇹🇭', title: 'Thai → English', desc: 'Read Thai, choose the meaning' },
  { id: 'english_to_thai', icon: '🔤', title: 'English → Thai', desc: 'Read English, pick the Thai word' },
  { id: 'romanization',    icon: '🔊', title: 'Pronunciation',  desc: 'Match Thai to its romanization' },
];

export function Quiz({ onExit }: { onExit: () => void }) {
  const { profile } = useGame();
  const [phase, setPhase] = useState<'setup' | 'question' | 'feedback' | 'complete'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = (() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    const filtered = VOCABULARY.filter(c => unlocked.includes(c.region));
    return filtered.length >= 12 ? filtered : VOCABULARY;
  })();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const startQuiz = useCallback((mode: QuizMode) => {
    const picks = shuffle(pool).slice(0, QUIZ_SIZE);
    setQuestions(picks.map(c => buildQuestion(c, mode, pool)));
    setCurrent(0);
    setResults([]);
    setSelectedIdx(null);
    setPhase('question');
  }, [pool]);

  const answer = useCallback((idx: number) => {
    if (phase !== 'question') return;
    const q = questions[current];
    const correct = idx === q.correctIndex;
    setSelectedIdx(idx);
    setResults(r => [...r, correct]);
    setPhase('feedback');

    timerRef.current = setTimeout(() => {
      setSelectedIdx(null);
      const next = current + 1;
      if (next >= questions.length) {
        setPhase('complete');
      } else {
        setCurrent(next);
        setPhase('question');
      }
    }, correct ? 800 : 1500);
  }, [phase, questions, current]);

  if (phase === 'setup') return <SetupScreen onSelect={startQuiz} onExit={onExit} />;
  if (phase === 'complete') {
    const score = results.filter(Boolean).length;
    return <ScoreScreen score={score} total={questions.length} questions={questions} results={results} onRetry={() => setPhase('setup')} onExit={onExit} />;
  }

  const q = questions[current];
  const progress = current / questions.length;
  const isEnglishToThai = q.mode === 'english_to_thai';

  return (
    <div style={s.root}>
      {/* Top bar */}
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>
        <span style={s.counter}>{current + 1}/{questions.length}</span>
      </div>

      {/* Score dots */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px', justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < results.length ? (results[i] ? 'var(--success)' : 'var(--error)') : i === current ? 'var(--primary)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Prompt */}
      <div style={s.promptArea}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {q.mode === 'thai_to_english' ? 'What does this mean?' : q.mode === 'english_to_thai' ? 'How do you write this in Thai?' : 'How is this pronounced?'}
        </div>
        <div style={{ fontSize: isEnglishToThai ? 28 : 58, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', marginBottom: 8 }}>
          {q.prompt}
        </div>
        {q.promptSub && (
          <div style={{ fontSize: 16, color: 'var(--text-muted)', textAlign: 'center' }}>{q.promptSub}</div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
          {q.card.category.replace(/_/g, ' ')} · {q.card.tone} tone
        </div>
      </div>

      {/* Options */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--surface)';
          let border = '1px solid var(--border)';
          let color = 'var(--text)';
          if (phase === 'feedback' && selectedIdx !== null) {
            if (i === q.correctIndex) { bg = 'rgba(16,185,129,0.15)'; border = '2px solid var(--success)'; color = 'var(--success)'; }
            else if (i === selectedIdx && i !== q.correctIndex) { bg = 'rgba(239,68,68,0.15)'; border = '2px solid var(--error)'; color = 'var(--error)'; }
          }
          const isLongThai = q.mode === 'english_to_thai';
          return (
            <button
              key={i}
              className={phase === 'feedback' && selectedIdx === i && i !== q.correctIndex ? 'shake' : ''}
              style={{ background: bg, border, borderRadius: 14, padding: '14px 18px', color, fontWeight: 600, fontSize: isLongThai ? 22 : 15, textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => answer(i)}
              disabled={phase === 'feedback'}
            >
              <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 20, fontWeight: 500 }}>{['A', 'B', 'C', 'D'][i]}</span>
              <span style={{ flex: 1 }}>{opt}</span>
              {phase === 'feedback' && i === q.correctIndex && <span>✓</span>}
              {phase === 'feedback' && i === selectedIdx && i !== q.correctIndex && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Hint on wrong answer */}
      {phase === 'feedback' && selectedIdx !== null && selectedIdx !== q.correctIndex && (
        <div style={{ margin: '0 20px 16px', background: 'var(--surface-hi)', borderRadius: 12, padding: 14, borderLeft: '3px solid var(--info)' }}>
          {q.card.exampleSentence && (
            <div style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>"{q.card.exampleSentence.englishNatural}"</div>
          )}
          {q.card.culturalNote && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>💡 {q.card.culturalNote}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SetupScreen({ onSelect, onExit }: { onSelect: (m: QuizMode) => void; onExit: () => void }) {
  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Quiz Mode</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ flex: 1, padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Test your skills</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>10 questions · Choose a mode</div>
        </div>
        {MODES.map(m => (
          <button key={m.id} style={s.modeCard} onClick={() => onSelect(m.id)}>
            <span style={{ fontSize: 32 }}>{m.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreScreen({ score, total, questions, results, onRetry, onExit }: {
  score: number; total: number; questions: QuizQuestion[]; results: boolean[];
  onRetry: () => void; onExit: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '💪';
  const label = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Not bad!' : 'Keep practicing!';

  return (
    <div style={{ ...s.root, overflow: 'hidden' }}>
      <div className="scroll" style={{ flex: 1, padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="anim-scale" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{label}</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--gold)' : 'var(--warning)', marginTop: 8 }}>
            {score}/{total}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{pct}% correct</div>
        </div>

        {/* Review wrong answers */}
        {results.some(r => !r) && (
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Review Missed Words
            </div>
            {questions.map((q, i) => results[i] ? null : (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--error)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{q.card.thai}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.card.romanization}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>{q.card.englishMeaning}</div>
                    {q.card.englishAlternatives?.slice(0, 1).map(a => (
                      <div key={a} style={{ fontSize: 11, color: 'var(--text-muted)' }}>also: {a}</div>
                    ))}
                  </div>
                </div>
                {q.card.culturalNote && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    💡 {q.card.culturalNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15 }} onClick={onRetry}>
            Try Again
          </button>
          <button style={{ background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600 }} onClick={onExit}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  topBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' },
  exitBtn: { width: 32, height: 32, borderRadius: 999, background: 'var(--surface)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counter: { fontSize: 12, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' },
  promptArea: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 24px' },
  modeCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, width: '100%', transition: 'border-color 0.15s' },
};
