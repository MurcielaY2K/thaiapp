import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard } from '@engine/types';
import { useGame } from '../context/GameContext';
import { sfx, speakThai } from '../utils/audio';
import { updateChallengeProgress } from '../utils/dailyChallenge';

interface BuildQuestion {
  card: VocabCard;
  correctWords: string[];   // romanization words in correct order
  tiles: string[];          // shuffled tiles
}

const QUIZ_SIZE = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(card: VocabCard): BuildQuestion | null {
  if (!card.exampleSentence) return null;
  const words = card.exampleSentence.romanization.split(' ').filter(w => w.length > 0);
  if (words.length < 3 || words.length > 10) return null;
  return { card, correctWords: words, tiles: shuffle(words) };
}

export function SentenceBuilder({ onExit }: { onExit: () => void }) {
  const { profile, refreshDailyChallenge, awardChallengeXP } = useGame();
  const [phase, setPhase] = useState<'question' | 'feedback' | 'complete'>('question');
  const [questions, setQuestions] = useState<BuildQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = (() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    const filtered = VOCABULARY.filter(c => unlocked.includes(c.region) && c.exampleSentence);
    return filtered.length >= QUIZ_SIZE ? filtered : VOCABULARY.filter(c => c.exampleSentence);
  })();

  const initQuestions = useCallback(() => {
    const qs: BuildQuestion[] = [];
    for (const card of shuffle(pool)) {
      const q = buildQuestion(card);
      if (q) qs.push(q);
      if (qs.length >= QUIZ_SIZE) break;
    }
    setQuestions(qs);
    setCurrent(0);
    setResults([]);
    setPhase('question');
    if (qs.length > 0) {
      setRemaining([...qs[0].tiles]);
      setPlaced([]);
    }
  }, [pool]);

  useEffect(() => { initQuestions(); }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (phase !== 'complete') return;
    const score = results.filter(Boolean).length;
    const r = updateChallengeProgress('sentence_builder', score);
    if (r.justCompleted) awardChallengeXP(r.challenge.xpReward);
    refreshDailyChallenge();
  }, [phase]);

  const placeTile = useCallback((word: string, idx: number) => {
    if (phase !== 'question') return;
    const newRemaining = [...remaining];
    newRemaining.splice(idx, 1);
    const newPlaced = [...placed, word];
    setRemaining(newRemaining);
    setPlaced(newPlaced);

    // Auto-check when all tiles placed
    if (newPlaced.length === questions[current].correctWords.length) {
      const correct = newPlaced.join(' ') === questions[current].correctWords.join(' ');
      if (correct) sfx.correct(); else sfx.wrong();
      setFeedbackCorrect(correct);
      setResults(r => [...r, correct]);
      setPhase('feedback');
      timerRef.current = setTimeout(() => {
        const next = current + 1;
        if (next >= questions.length) {
          setPhase('complete');
        } else {
          setCurrent(next);
          setPlaced([]);
          setRemaining([...questions[next].tiles]);
          setPhase('question');
        }
      }, correct ? 1000 : 2000);
    }
  }, [phase, placed, remaining, current, questions]);

  const removeTile = useCallback((idx: number) => {
    if (phase !== 'question') return;
    const word = placed[idx];
    const newPlaced = [...placed];
    newPlaced.splice(idx, 1);
    setPlaced(newPlaced);
    setRemaining(r => [...r, word]);
  }, [phase, placed]);

  if (questions.length === 0) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>😕</div>
      <div style={{ color: 'var(--text-muted)' }}>Not enough sentence data yet.</div>
      <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 24px', color: 'var(--text-sec)' }} onClick={onExit}>Back</button>
    </div>
  );

  if (phase === 'complete') {
    const score = results.filter(Boolean).length;
    return <BuildScoreScreen score={score} total={questions.length} onRetry={initQuestions} onExit={onExit} />;
  }

  const q = questions[current];
  const progress = current / questions.length;

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--gold))', boxShadow: '0 0 8px rgba(245,158,66,0.5)', borderRadius: 999, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <span style={s.counter}>{current + 1}/{questions.length}</span>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < results.length ? (results[i] ? 'var(--success)' : 'var(--error)') : i === current ? 'var(--success)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s', boxShadow: i === current ? '0 0 6px rgba(16,185,129,0.6)' : 'none' }} />
        ))}
      </div>

      {/* Prompt */}
      <div style={{ padding: '0 24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Arrange into a sentence</div>
        <div style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.97), rgba(14,7,38,0.95))', borderRadius: 14, padding: 16, marginBottom: 8, border: '1px solid rgba(255,255,255,0.08)', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{q.card.thai}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{q.card.exampleSentence!.englishNatural}"</div>
          <button
            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, width: 30, height: 30, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => speakThai(q.card.exampleSentence!.thai)}
            title="Listen to the full sentence"
          >🔊</button>
        </div>
      </div>

      {/* Drop zone */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your sentence</span>
          {placed.length > 0 && phase === 'question' && (
            <button style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '2px 10px' }}
              onClick={() => { setRemaining(q.tiles); setPlaced([]); }}
            >Clear ✕</button>
          )}
        </div>
        <div style={{
          minHeight: 60, background: 'rgba(22,12,53,0.5)', borderRadius: 14, padding: '10px 14px',
          border: `2px dashed ${phase === 'feedback' ? (feedbackCorrect ? 'var(--success)' : 'var(--error)') : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', transition: 'border-color 0.3s',
        }}>
          {placed.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to build the sentence…</span>}
          {placed.map((word, i) => (
            <button
              key={`${word}-${i}`}
              style={{ background: 'linear-gradient(135deg, rgba(212,128,26,0.85), rgba(245,158,66,0.9))', color: '#1A0800', borderRadius: 8, padding: '6px 12px', fontSize: 14, fontWeight: 700 }}
              onClick={() => removeTile(i)}
              disabled={phase === 'feedback'}
            >
              {word}
            </button>
          ))}
        </div>
        {phase === 'feedback' && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: feedbackCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${feedbackCorrect ? 'var(--success)' : 'var(--error)'}` }}>
            {feedbackCorrect
              ? <div>
                  <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 4 }}>Correct! ✓</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{q.card.exampleSentence!.thai}</div>
                </div>
              : <div>
                  <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 4 }}>Not quite!</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>Correct: <span style={{ fontWeight: 600 }}>{q.correctWords.join(' ')}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>{q.card.exampleSentence!.thai}</div>
                </div>
            }
          </div>
        )}
      </div>

      {/* Available tiles */}
      <div style={{ flex: 1, padding: '0 20px 24px', display: 'flex', flexWrap: 'wrap', gap: 10, alignContent: 'flex-start' }}>
        {remaining.map((word, i) => (
          <button
            key={`${word}-${i}`}
            style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.9), rgba(14,7,38,0.85))', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 14px', fontSize: 15, fontWeight: 600, color: 'var(--text)', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
            onClick={() => placeTile(word, i)}
            disabled={phase === 'feedback'}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

function BuildScoreScreen({ score, total, onRetry, onExit }: { score: number; total: number; onRetry: () => void; onExit: () => void }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, background: 'var(--bg)' }}>
      <div className="anim-scale" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '💪'}</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>Sentence Builder</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 70 ? 'var(--success)' : 'var(--warning)', marginTop: 6 }}>{score}/{total}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{pct}% correct</div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={{ background: 'linear-gradient(135deg, #D4801A 0%, #F59E42 45%, #FFB84D 80%, #F5C060 100%)', color: '#1A0800', borderRadius: 14, padding: 16, fontWeight: 900, fontSize: 15, boxShadow: '0 6px 24px rgba(245,158,66,0.35)' }} onClick={onRetry}>Try Again</button>
        <button style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.9), rgba(14,7,38,0.85))', color: 'var(--text-sec)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }} onClick={onExit}>Back</button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  topBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', background: 'rgba(7,3,22,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' as React.CSSProperties['WebkitBackdropFilter'], borderBottom: '1px solid rgba(255,255,255,0.06)' },
  exitBtn: { width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  counter: { fontSize: 12, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' },
};
