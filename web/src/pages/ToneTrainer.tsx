import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard, ThaiTone, TONE_COLORS } from '@engine/types';
import { useGame } from '../context/GameContext';
import { sfx, speakThai } from '../utils/audio';
import { updateChallengeProgress } from '../utils/dailyChallenge';

const TONES: { tone: ThaiTone; label: string; hint: string; contour: string; svgPath: string }[] = [
  { tone: 'mid',     label: 'Mid',     hint: 'flat, steady',          contour: '━━━━', svgPath: 'M0,20 L40,20' },
  { tone: 'low',     label: 'Low',     hint: 'below flat, steady',    contour: '▁▁▁▁', svgPath: 'M0,32 L40,32' },
  { tone: 'falling', label: 'Falling', hint: 'starts high, drops',    contour: '◥▁▁▁', svgPath: 'M0,4 L40,36' },
  { tone: 'high',    label: 'High',    hint: 'above flat, steady',    contour: '▔▔▔▔', svgPath: 'M0,8 L40,8' },
  { tone: 'rising',  label: 'Rising',  hint: 'starts low, rises',     contour: '▁▁▁◤', svgPath: 'M0,34 Q20,30 40,6' },
];

const QUIZ_SIZE = 10;

type ToneDifficulty = 'easy' | 'normal' | 'hard';
const DIFFICULTIES: { id: ToneDifficulty; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'easy',   label: 'Easy',   icon: '🌱', desc: 'Shows romanization + meaning', color: 'var(--success)' },
  { id: 'normal', label: 'Normal', icon: '⚡', desc: 'Shows meaning, hides romanization', color: 'var(--info)' },
  { id: 'hard',   label: 'Hard',   icon: '🏆', desc: 'Thai word only — pure listening', color: 'var(--gold)' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ToneTrainer({ onExit }: { onExit: () => void }) {
  const { profile, refreshDailyChallenge, awardChallengeXP } = useGame();
  const [phase, setPhase] = useState<'intro' | 'question' | 'feedback' | 'complete'>('intro');
  const [difficulty, setDifficulty] = useState<ToneDifficulty>('easy');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [chosen, setChosen] = useState<ThaiTone | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = (() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    const filtered = VOCABULARY.filter(c => unlocked.includes(c.region));
    return filtered.length >= QUIZ_SIZE ? filtered : VOCABULARY;
  })();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Auto-speak when new question appears
  useEffect(() => {
    if (phase === 'question' && cards[current]) {
      const t = setTimeout(() => speakThai(cards[current].thai), 400);
      return () => clearTimeout(t);
    }
  }, [phase, current, cards]);

  const start = useCallback((diff: ToneDifficulty) => {
    setDifficulty(diff);
    setCards(shuffle(pool).slice(0, QUIZ_SIZE));
    setCurrent(0);
    setResults([]);
    setChosen(null);
    setPhase('question');
  }, [pool]);

  const answer = useCallback((tone: ThaiTone) => {
    if (phase !== 'question') return;
    const card = cards[current];
    const correct = tone === card.tone;
    if (correct) sfx.correct(); else { sfx.wrong(); speakThai(card.thai); }
    setChosen(tone);
    setResults(r => [...r, correct]);
    setPhase('feedback');
    timerRef.current = setTimeout(() => {
      setChosen(null);
      const next = current + 1;
      if (next >= cards.length) setPhase('complete');
      else { setCurrent(next); setPhase('question'); }
    }, correct ? 900 : 1800);
  }, [phase, cards, current]);

  useEffect(() => {
    if (phase !== 'complete') return;
    const score = results.filter(Boolean).length;
    const r = updateChallengeProgress('tone_trainer', score);
    if (r.justCompleted) awardChallengeXP(r.challenge.xpReward);
    refreshDailyChallenge();
  }, [phase]);

  if (phase === 'intro') return <IntroScreen onStart={start} onExit={onExit} />;
  if (phase === 'complete') {
    const score = results.filter(Boolean).length;
    return <ToneScoreScreen score={score} total={cards.length} cards={cards} results={results} onRetry={() => start(difficulty)} onExit={onExit} />;
  }

  const card = cards[current];
  const correctTone = TONES.find(t => t.tone === card.tone)!;

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${(current / cards.length) * 100}%`, background: DIFFICULTIES.find(d => d.id === difficulty)?.color ?? 'var(--info)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <span style={s.counter}>{current + 1}/{cards.length}</span>
          <span style={{ fontSize: 9, color: DIFFICULTIES.find(d => d.id === difficulty)?.color ?? 'var(--info)', fontWeight: 700, textTransform: 'uppercase' }}>{difficulty}</span>
        </div>
      </div>

      {/* Score dots */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', justifyContent: 'center' }}>
        {cards.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < results.length ? (results[i] ? 'var(--success)' : 'var(--error)') : i === current ? 'var(--info)' : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 20px', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>What tone is this word?</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Word is auto-spoken · tap 🔊 to replay</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, textAlign: 'center' }}>{card.thai}</div>
        <button
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 16px', fontSize: 13, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => speakThai(card.thai)}
        >
          {difficulty === 'easy' ? <>🔊 <span>{card.romanization}</span></> : <span>🔊 Replay</span>}
        </button>
        {difficulty !== 'hard' && (
          <div style={{ fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic' }}>{card.englishMeaning}</div>
        )}

        {/* Feedback overlay */}
        {phase === 'feedback' && (
          <div style={{ marginTop: 12, background: 'var(--surface)', borderRadius: 12, padding: '12px 20px', textAlign: 'center', border: `2px solid ${results[results.length - 1] ? 'var(--success)' : 'var(--error)'}` }}>
            {results[results.length - 1] ? (
              <div style={{ color: 'var(--success)', fontWeight: 700 }}>Correct! — {correctTone.label} tone</div>
            ) : (
              <div>
                <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 4 }}>Not quite!</div>
                <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>
                  It's the <span style={{ fontWeight: 700, color: TONE_COLORS[card.tone] }}>{correctTone.label}</span> tone — {correctTone.hint}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tone buttons */}
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TONES.map(({ tone, label, hint, svgPath }) => {
          const color = TONE_COLORS[tone];
          const isChosen = chosen === tone;
          const isCorrect = tone === card.tone;
          let bg = 'var(--surface)';
          let border = `1px solid var(--border)`;
          const feedbackColor = isCorrect ? 'var(--success)' : 'var(--error)';
          if (phase === 'feedback') {
            if (isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = `2px solid var(--success)`; }
            else if (isChosen) { bg = 'rgba(239,68,68,0.1)'; border = `2px solid var(--error)`; }
          }
          return (
            <button
              key={tone}
              className={phase === 'feedback' && isChosen && !isCorrect ? 'shake' : ''}
              style={{ background: bg, border, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
              onClick={() => answer(tone)}
              disabled={phase === 'feedback'}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                <line x1="0" y1="20" x2="40" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2" />
                <path d={svgPath} stroke={phase === 'feedback' && (isCorrect || isChosen) ? feedbackColor : color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ fontWeight: 700, color: phase === 'feedback' && isCorrect ? 'var(--success)' : 'var(--text)', fontSize: 15 }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{hint}</span>
              </div>
              {phase === 'feedback' && isCorrect && <span style={{ color: 'var(--success)' }}>✓</span>}
              {phase === 'feedback' && isChosen && !isCorrect && <span style={{ color: 'var(--error)' }}>✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntroScreen({ onStart, onExit }: { onStart: (d: ToneDifficulty) => void; onExit: () => void }) {
  const [selectedDiff, setSelectedDiff] = useState<ToneDifficulty>('easy');
  const diffCfg = DIFFICULTIES.find(d => d.id === selectedDiff)!;
  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Tone Trainer</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="scroll" style={{ flex: 1, padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎵</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Thai Tones</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
            Thai has 5 distinct tones. The same syllable with a different tone is a completely different word.
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TONES.map(({ tone, label, hint, svgPath }) => (
            <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="40" height="28" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                <line x1="0" y1="20" x2="40" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2" />
                <path d={svgPath} stroke={TONE_COLORS[tone]} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
              <div>
                <span style={{ fontWeight: 700, color: TONE_COLORS[tone] }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{hint}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Difficulty</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDiff(d.id)}
                style={{
                  flex: 1, borderRadius: 12, padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: selectedDiff === d.id ? d.color : 'var(--surface)',
                  border: `2px solid ${selectedDiff === d.id ? d.color : 'var(--border)'}`,
                  color: selectedDiff === d.id ? '#fff' : 'var(--text)',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{d.label}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>{diffCfg.desc}</div>
        </div>

        <button style={{ background: diffCfg.color, color: '#fff', borderRadius: 14, padding: 18, fontWeight: 700, fontSize: 16 }} onClick={() => onStart(selectedDiff)}>
          Start Training · 10 questions
        </button>
      </div>
    </div>
  );
}

function ToneScoreScreen({ score, total, cards, results, onRetry, onExit }: {
  score: number; total: number; cards: VocabCard[]; results: boolean[];
  onRetry: () => void; onExit: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '👍' : '💪';
  return (
    <div style={s.root}>
      <div className="scroll" style={{ flex: 1, padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="anim-scale" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60 }}>{emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>Tone Score</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 70 ? 'var(--success)' : 'var(--warning)', marginTop: 6 }}>{score}/{total}</div>
        </div>
        {/* Tone breakdown */}
        <div style={{ width: '100%', background: 'var(--surface)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Missed words</div>
          {cards.map((c, i) => results[i] ? null : (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{c.thai}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.englishMeaning}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: TONE_COLORS[c.tone] }}>{c.tone}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.romanization}</div>
              </div>
            </div>
          ))}
          {results.every(Boolean) && <div style={{ color: 'var(--success)', fontWeight: 600, textAlign: 'center' }}>Perfect — no mistakes! 🎉</div>}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ background: 'var(--info)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700 }} onClick={onRetry}>Try Again</button>
          <button style={{ background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600 }} onClick={onExit}>Back</button>
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
};
