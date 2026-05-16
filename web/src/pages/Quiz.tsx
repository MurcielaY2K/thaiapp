import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard } from '@engine/types';
import { useGame } from '../context/GameContext';
import { sfx, speakThai } from '../utils/audio';
import { updateChallengeProgress } from '../utils/dailyChallenge';

type QuizMode = 'thai_to_english' | 'english_to_thai' | 'romanization' | 'type_english' | 'type_romanization' | 'listening';

interface QuizQuestion {
  card: VocabCard;
  mode: QuizMode;
  prompt: string;
  promptSub?: string;
  // multiple choice
  options?: string[];
  correctIndex?: number;
  // typing
  correctAnswers?: string[];
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
    const opts = shuffle([correct, ...distractors(card, pool, 'englishMeaning')]);
    return { card, mode, prompt: card.thai, promptSub: card.romanization, options: opts, correctIndex: opts.indexOf(correct) };
  }
  if (mode === 'english_to_thai') {
    const correct = card.thai;
    const opts = shuffle([correct, ...distractors(card, pool, 'thai')]);
    return { card, mode, prompt: card.englishMeaning, options: opts, correctIndex: opts.indexOf(correct) };
  }
  if (mode === 'romanization') {
    const correct = card.romanization;
    const opts = shuffle([correct, ...distractors(card, pool, 'romanization')]);
    return { card, mode, prompt: card.thai, promptSub: card.englishMeaning, options: opts, correctIndex: opts.indexOf(correct) };
  }
  if (mode === 'listening') {
    const correct = card.englishMeaning;
    const opts = shuffle([correct, ...distractors(card, pool, 'englishMeaning')]);
    return { card, mode, prompt: '🔊', promptSub: 'Listen and choose the meaning', options: opts, correctIndex: opts.indexOf(correct) };
  }
  if (mode === 'type_english') {
    const answers = [card.englishMeaning, ...(card.englishAlternatives ?? [])].map(s => s.toLowerCase().trim());
    return { card, mode, prompt: card.thai, promptSub: card.romanization, correctAnswers: answers };
  }
  // type_romanization
  return { card, mode, prompt: card.thai, promptSub: card.englishMeaning, correctAnswers: [card.romanization.toLowerCase().trim()] };
}

const MC_MODES: { id: QuizMode; icon: string; title: string; desc: string }[] = [
  { id: 'thai_to_english',    icon: '🇹🇭', title: 'Thai → English',   desc: 'Read Thai, choose the meaning' },
  { id: 'english_to_thai',    icon: '🔤', title: 'English → Thai',   desc: 'Read English, pick the Thai word' },
  { id: 'romanization',       icon: '🗣️', title: 'Pronunciation',     desc: 'Match Thai to its romanization' },
  { id: 'listening',          icon: '👂', title: 'Listening',          desc: 'Hear the word, choose the meaning' },
];
const TYPE_MODES: { id: QuizMode; icon: string; title: string; desc: string }[] = [
  { id: 'type_english',       icon: '⌨️', title: 'Type the meaning',  desc: 'Type the English meaning of the Thai word' },
  { id: 'type_romanization',  icon: '✍️', title: 'Type romanization', desc: 'Type how the Thai word is romanized' },
];

export function Quiz({ onExit }: { onExit: () => void }) {
  const { profile } = useGame();
  const [phase, setPhase] = useState<'setup' | 'question' | 'feedback' | 'complete'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [typedCorrect, setTypedCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = (() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    const filtered = VOCABULARY.filter(c => unlocked.includes(c.region));
    return filtered.length >= 12 ? filtered : VOCABULARY;
  })();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const startQuiz = useCallback((mode: QuizMode) => {
    const picks = shuffle(pool).slice(0, QUIZ_SIZE);
    setQuestions(picks.map(c => buildQuestion(c, mode, pool)));
    setCurrent(0); setResults([]); setStreak(0); setSelectedIdx(null); setTypedAnswer(''); setTypedCorrect(null);
    setPhase('question');
  }, [pool]);

  const advance = useCallback((correct: boolean) => {
    if (correct) sfx.correct(); else { sfx.wrong(); speakThai(questions[current].card.thai); }
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    const newResults = [...results, correct];
    setResults(newResults);
    setPhase('feedback');
    timerRef.current = setTimeout(() => {
      setSelectedIdx(null); setTypedAnswer(''); setTypedCorrect(null);
      const next = current + 1;
      if (next >= questions.length) {
        const score = newResults.filter(Boolean).length;
        updateChallengeProgress('quiz', score);
        sfx.complete();
        setPhase('complete');
      } else { setCurrent(next); setPhase('question'); }
    }, correct ? 800 : 1500);
  }, [current, questions.length, results]);

  const answerMC = useCallback((idx: number) => {
    if (phase !== 'question') return;
    const correct = idx === questions[current].correctIndex;
    setSelectedIdx(idx);
    advance(correct);
  }, [phase, questions, current, advance]);

  const answerTyped = useCallback(() => {
    if (phase !== 'question') return;
    const q = questions[current];
    const typed = typedAnswer.toLowerCase().trim();
    const correct = q.correctAnswers?.some(a => a === typed) ?? false;
    setTypedCorrect(correct);
    advance(correct);
  }, [phase, questions, current, typedAnswer, advance]);

  useEffect(() => {
    if (phase === 'question' && questions[current]?.correctAnswers) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (phase === 'question' && questions[current]?.mode === 'listening') {
      setTimeout(() => speakThai(questions[current].card.thai), 300);
    }
  }, [phase, current]);

  if (phase === 'setup') return <SetupScreen onSelect={startQuiz} onExit={onExit} />;
  if (phase === 'complete') {
    const score = results.filter(Boolean).length;
    return <ScoreScreen score={score} total={questions.length} questions={questions} results={results} onRetry={() => setPhase('setup')} onExit={onExit} />;
  }

  const q = questions[current];
  const progress = current / questions.length;
  const isTyping = q.mode === 'type_english' || q.mode === 'type_romanization';

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>
        <span style={s.counter}>{current + 1}/{questions.length}</span>
        {streak >= 3 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', background: 'rgba(245,158,11,0.15)', borderRadius: 999, padding: '3px 10px', flexShrink: 0 }}>
            🔥 {streak}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px', justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < results.length ? (results[i] ? 'var(--success)' : 'var(--error)') : i === current ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={s.promptArea}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {q.mode === 'thai_to_english' ? 'What does this mean?' : q.mode === 'english_to_thai' ? 'Write this in Thai' : q.mode === 'romanization' ? 'How is this pronounced?' : q.mode === 'listening' ? 'What did you hear?' : q.mode === 'type_english' ? 'Type the English meaning' : 'Type the romanization'}
        </div>
        {q.mode === 'listening' ? (
          <>
            <button
              style={{ fontSize: 72, background: 'var(--surface)', border: '3px solid var(--info)', borderRadius: '50%', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexShrink: 0 }}
              onClick={() => speakThai(q.card.thai)}
            >👂</button>
            <div style={{ fontSize: 14, color: 'var(--info)', fontWeight: 600, marginBottom: 4 }}>Tap to listen again</div>
            {phase === 'feedback' && (
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{q.card.thai}</div>
            )}
          </>
        ) : (
          <div style={{ fontSize: q.mode === 'english_to_thai' ? 26 : 58, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', marginBottom: 8 }}>{q.prompt}</div>
        )}
        {q.promptSub && q.mode !== 'listening' && <div style={{ fontSize: 16, color: 'var(--text-muted)', textAlign: 'center' }}>{q.promptSub}</div>}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
          {q.card.category.replace(/_/g, ' ')}{q.mode !== 'listening' && ` · ${q.card.tone} tone`}
        </div>
      </div>

      {isTyping ? (
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={inputRef}
            style={{
              background: 'var(--surface)', border: `2px solid ${phase === 'feedback' ? (typedCorrect ? 'var(--success)' : 'var(--error)') : 'var(--border)'}`,
              borderRadius: 14, padding: '14px 16px', color: 'var(--text)', fontSize: 16, outline: 'none', width: '100%', transition: 'border-color 0.2s',
            }}
            placeholder="Type your answer…"
            value={typedAnswer}
            onChange={e => setTypedAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && answerTyped()}
            disabled={phase === 'feedback'}
          />
          {phase === 'feedback' && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: typedCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${typedCorrect ? 'var(--success)' : 'var(--error)'}` }}>
              {typedCorrect
                ? <div style={{ color: 'var(--success)', fontWeight: 700 }}>Correct! ✓</div>
                : <div>
                    <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 4 }}>Not quite!</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>Answer: <span style={{ fontWeight: 600 }}>{q.correctAnswers?.[0]}</span></div>
                    {q.correctAnswers && q.correctAnswers.length > 1 && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>also: {q.correctAnswers.slice(1).join(', ')}</div>
                    )}
                  </div>
              }
            </div>
          )}
          {phase === 'question' && (
            <button style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: '14px 0', fontWeight: 700 }} onClick={answerTyped} disabled={!typedAnswer.trim()}>
              Check →
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options!.map((opt, i) => {
            let bg = 'var(--surface)', border = '1px solid var(--border)', color = 'var(--text)';
            if (phase === 'feedback' && selectedIdx !== null) {
              if (i === q.correctIndex) { bg = 'rgba(16,185,129,0.15)'; border = '2px solid var(--success)'; color = 'var(--success)'; }
              else if (i === selectedIdx) { bg = 'rgba(239,68,68,0.15)'; border = '2px solid var(--error)'; color = 'var(--error)'; }
            }
            return (
              <button key={i} className={phase === 'feedback' && selectedIdx === i && i !== q.correctIndex ? 'shake' : ''}
                style={{ background: bg, border, borderRadius: 14, padding: '14px 18px', color, fontWeight: 600, fontSize: q.mode === 'english_to_thai' ? 22 : 15, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                onClick={() => answerMC(i)} disabled={phase === 'feedback'}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 20 }}>{['A', 'B', 'C', 'D'][i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {phase === 'feedback' && i === q.correctIndex && <span>✓</span>}
                {phase === 'feedback' && i === selectedIdx && i !== q.correctIndex && <span>✗</span>}
              </button>
            );
          })}
        </div>
      )}

      {phase === 'feedback' && selectedIdx !== null && selectedIdx !== q.correctIndex && (
        <div style={{ margin: '0 20px 16px', background: 'var(--surface-hi)', borderRadius: 12, padding: 14, borderLeft: '3px solid var(--info)' }}>
          {q.card.exampleSentence && <div style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>"{q.card.exampleSentence.englishNatural}"</div>}
          {q.card.culturalNote && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>💡 {q.card.culturalNote}</div>}
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
      <div className="scroll" style={{ flex: 1, padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ textAlign: 'center', paddingTop: 12, marginBottom: 4 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🧠</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Test your skills</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>10 questions · Choose a mode</div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Multiple choice</div>
        {MC_MODES.map(m => (
          <button key={m.id} style={s.modeCard} onClick={() => onSelect(m.id)}>
            <span style={{ fontSize: 28 }}>{m.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 18 }}>→</span>
          </button>
        ))}

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Type your answer</div>
        {TYPE_MODES.map(m => (
          <button key={m.id} style={{ ...s.modeCard, borderColor: 'var(--border)', borderStyle: 'dashed' }} onClick={() => onSelect(m.id)}>
            <span style={{ fontSize: 28 }}>{m.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 700 }}>HARD</span>
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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const pct = Math.round((score / total) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '💪';
  const label = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Not bad!' : 'Keep practicing!';
  return (
    <div style={{ ...s.root, overflow: 'hidden' }}>
      <div className="scroll" style={{ flex: 1, padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="anim-scale" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{label}</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--gold)' : 'var(--warning)', marginTop: 8 }}>{score}/{total}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{pct}% correct</div>
        </div>
        {results.some(r => !r) && (
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Review Missed Words · tap for details</div>
            {questions.map((q, i) => results[i] ? null : (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--error)', borderRadius: 12, padding: 14, marginBottom: 8, cursor: 'pointer' }}
                onClick={() => setExpandedIdx(p => p === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{q.card.thai}</div>
                      <button onClick={e => { e.stopPropagation(); speakThai(q.card.thai); }} style={{ background: 'transparent', fontSize: 14 }}>🔊</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.card.romanization}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>{q.card.englishMeaning}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{expandedIdx === i ? '▲' : '▼'}</div>
                  </div>
                </div>
                {expandedIdx === i && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.card.exampleSentence && (
                      <div style={{ background: 'var(--surface-hi)', borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{q.card.exampleSentence.thai}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{q.card.exampleSentence.romanization}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-sec)', fontStyle: 'italic', marginTop: 2 }}>"{q.card.exampleSentence.englishNatural}"</div>
                      </div>
                    )}
                    {q.card.culturalNote && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>💡 {q.card.culturalNote}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15 }} onClick={onRetry}>Try Again</button>
          <button style={{ background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600 }} onClick={onExit}>Back to Home</button>
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
  promptArea: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 16px' },
  modeCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, width: '100%' },
};
