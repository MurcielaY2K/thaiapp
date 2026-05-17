import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard } from '@engine/types';
import { useGame } from '../context/GameContext';
import { sfx, speakThai, getAutoPlay } from '../utils/audio';
import { updateChallengeProgress } from '../utils/dailyChallenge';

interface MatchCard {
  id: string;
  pairId: string;
  face: string;
  sub?: string;
  faceType: 'thai' | 'english';
  isFlipped: boolean;
  isMatched: boolean;
}

const DIFFICULTY = {
  easy:   { pairs: 4,  label: 'Easy',   desc: '4 pairs · 8 cards',  icon: '🌱', color: 'var(--success)' },
  medium: { pairs: 6,  label: 'Medium', desc: '6 pairs · 12 cards', icon: '⚡', color: 'var(--info)' },
  hard:   { pairs: 8,  label: 'Hard',   desc: '8 pairs · 16 cards', icon: '🏆', color: 'var(--gold)' },
} as const;
type Difficulty = keyof typeof DIFFICULTY;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(cards: VocabCard[], pairs: number): MatchCard[] {
  const selected = shuffle(cards).slice(0, pairs);
  const matchCards: MatchCard[] = [];
  selected.forEach((card, i) => {
    const pairId = `pair_${i}`;
    matchCards.push(
      { id: `${pairId}_t`, pairId, face: card.thai, sub: card.romanization, faceType: 'thai', isFlipped: false, isMatched: false },
      { id: `${pairId}_e`, pairId, face: card.englishMeaning, faceType: 'english', isFlipped: false, isMatched: false },
    );
  });
  return shuffle(matchCards);
}

export function MatchGame({ onExit }: { onExit: () => void }) {
  const { profile, refreshDailyChallenge, awardChallengeXP } = useGame();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [firstFlipped, setFirstFlipped] = useState<string | null>(null);
  const firstRef = useRef<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'complete'>('setup');
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pool = (() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    return VOCABULARY.filter(c => unlocked.includes(c.region));
  })();

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Check for completion after every cards update
  useEffect(() => {
    if (phase === 'playing' && cards.length > 0 && cards.every(c => c.isMatched)) {
      setPhase('complete');
    }
  }, [cards, phase]);

  useEffect(() => {
    if (phase !== 'complete') return;
    const r = updateChallengeProgress('memory_match', 1);
    if (r.justCompleted) awardChallengeXP(r.challenge.xpReward);
    refreshDailyChallenge();
  }, [phase]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setCards(buildCards(pool, DIFFICULTY[diff].pairs));
    setFirstFlipped(null);
    firstRef.current = null;
    setIsLocked(false);
    setAttempts(0);
    setElapsedSec(0);
    setPhase('playing');
  }, [pool]);

  const handleFlip = useCallback((cardId: string) => {
    if (isLocked) return;

    setCards(prev => {
      const card = prev.find(c => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return prev;
      return prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    });

    if (firstRef.current === null) {
      firstRef.current = cardId;
      setFirstFlipped(cardId);
    } else {
      const first = firstRef.current;
      if (first === cardId) return;
      firstRef.current = null;
      setFirstFlipped(null);
      setIsLocked(true);
      setAttempts(a => a + 1);

      setTimeout(() => {
        setCards(prev => {
          const c1 = prev.find(c => c.id === first);
          const c2 = prev.find(c => c.id === cardId);
          if (!c1 || !c2) return prev;
          const isMatch = c1.pairId === c2.pairId;
          if (isMatch) {
            sfx.correct();
            if (getAutoPlay()) {
              const thaiCard = [c1, c2].find(c => c.faceType === 'thai');
              if (thaiCard) speakThai(thaiCard.face);
            }
          } else sfx.wrong();
          return prev.map(c => {
            if (c.id === first || c.id === cardId) {
              return isMatch ? { ...c, isMatched: true } : { ...c, isFlipped: false };
            }
            return c;
          });
        });
        setIsLocked(false);
      }, 800);
    }
  }, [isLocked]);

  if (phase === 'setup') return <SetupScreen pool={pool} onStart={startGame} onExit={onExit} />;

  const pairs = difficulty ? DIFFICULTY[difficulty].pairs : 4;
  const matched = cards.filter(c => c.isMatched).length / 2;
  const timeStr = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')}`;

  if (phase === 'complete') {
    const score = Math.max(0, Math.round(pairs * 100 / Math.max(pairs, attempts)));
    return <ScoreScreen score={score} pairs={pairs} attempts={attempts} timeStr={timeStr} difficulty={difficulty!} onPlayAgain={() => startGame(difficulty!)} onChangeLevel={() => setPhase('setup')} onExit={onExit} />;
  }

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {timeStr}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{matched}/{pairs}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{attempts} tries</span>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div className="progress-track" style={{ height: 4, margin: '0 20px 14px' }}>
        <div className="progress-fill" style={{ width: `${(matched / pairs) * 100}%`, background: 'var(--success)', transition: 'width 0.4s ease' }} />
      </div>

      <div className="scroll" style={{ flex: 1, padding: '0 14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {cards.map(card => (
            <CardTile key={card.id} card={card} isFirstSelected={firstFlipped === card.id} onFlip={handleFlip} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardTile({ card, isFirstSelected, onFlip }: { card: MatchCard; isFirstSelected: boolean; onFlip: (id: string) => void }) {
  const isThai = card.faceType === 'thai';
  const isVisible = card.isFlipped || card.isMatched;

  let bg = 'linear-gradient(135deg, rgba(22,12,53,0.9), rgba(14,7,38,0.85))';
  let border = '1px solid rgba(255,255,255,0.07)';
  let textColor = 'var(--text)';
  let shadow = '0 2px 8px rgba(0,0,0,0.3)';

  if (card.isMatched) {
    bg = 'rgba(16,185,129,0.12)';
    border = '2px solid rgba(16,185,129,0.6)';
    textColor = 'var(--success)';
    shadow = '0 0 12px rgba(16,185,129,0.2)';
  } else if (isFirstSelected) {
    bg = 'rgba(96,165,250,0.12)';
    border = '2px solid rgba(96,165,250,0.6)';
    shadow = '0 0 12px rgba(96,165,250,0.25)';
  } else if (card.isFlipped) {
    bg = 'linear-gradient(135deg, rgba(30,18,72,0.95), rgba(22,12,53,0.9))';
    border = '1px solid rgba(245,158,66,0.4)';
    shadow = '0 0 10px rgba(245,158,66,0.15)';
  }

  return (
    <button
      onClick={() => onFlip(card.id)}
      disabled={card.isFlipped || card.isMatched}
      style={{
        background: bg,
        border,
        borderRadius: 12,
        padding: 6,
        minHeight: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'all 0.2s',
        overflow: 'hidden',
        gap: 2,
        boxShadow: shadow,
      }}
    >
      {isVisible ? (
        <>
          <span style={{
            fontSize: isThai ? 20 : 11,
            fontWeight: 700,
            color: textColor,
            lineHeight: 1.2,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}>
            {card.face}
          </span>
          {isThai && card.sub && (
            <span style={{ fontSize: 9, color: card.isMatched ? 'rgba(16,185,129,0.7)' : 'var(--text-muted)', lineHeight: 1 }}>
              {card.sub}
            </span>
          )}
          {!isThai && (
            <span style={{ fontSize: 8, color: card.isMatched ? 'rgba(16,185,129,0.6)' : 'var(--info)', textTransform: 'uppercase', fontWeight: 700 }}>EN</span>
          )}
        </>
      ) : (
        <span style={{ fontSize: 20 }}>🃏</span>
      )}
    </button>
  );
}

function SetupScreen({ pool, onStart, onExit }: { pool: VocabCard[]; onStart: (d: Difficulty) => void; onExit: () => void }) {
  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Memory Match</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="scroll" style={{ flex: 1, padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🃏</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Memory Match</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
            Flip cards to match Thai words with their English meanings.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {pool.length} words in your pool
          </div>
        </div>
        {(Object.entries(DIFFICULTY) as [Difficulty, typeof DIFFICULTY[Difficulty]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onStart(key)}
            disabled={pool.length < cfg.pairs}
            style={{
              background: 'linear-gradient(135deg, rgba(22,12,53,0.94), rgba(14,7,38,0.9))', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `4px solid ${cfg.color}`,
              borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              opacity: pool.length < cfg.pairs ? 0.4 : 1,
            }}
          >
            <span style={{ fontSize: 26 }}>{cfg.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cfg.desc}</div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreScreen({ score, pairs, attempts, timeStr, difficulty, onPlayAgain, onChangeLevel, onExit }: {
  score: number; pairs: number; attempts: number; timeStr: string; difficulty: Difficulty;
  onPlayAgain: () => void; onChangeLevel: () => void; onExit: () => void;
}) {
  const emoji = score >= 90 ? '🏆' : score >= 70 ? '⭐' : score >= 50 ? '👍' : '💪';
  return (
    <div style={s.root}>
      <div className="scroll" style={{ flex: 1, padding: '40px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="anim-scale" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60 }}>{emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>All Matched!</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: score >= 70 ? 'var(--success)' : 'var(--warning)', marginTop: 4 }}>{score}%</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>Match accuracy</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Pairs matched', `${pairs}/${pairs}`, 'var(--success)'],
            ['Attempts', `${attempts}`, attempts <= pairs + 2 ? 'var(--success)' : attempts <= pairs * 2 ? 'var(--gold)' : 'var(--text)'],
            ['Time', timeStr, 'var(--info)'],
            ['Perfect attempts', `${Math.max(0, pairs * 2 - attempts)}% wasted`, 'var(--text-muted)'],
          ].map(([label, value, color]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: String(color) }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15 }} onClick={onPlayAgain}>Play Again</button>
          <button style={{ background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, fontWeight: 600 }} onClick={onChangeLevel}>Change Difficulty</button>
          <button style={{ background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, fontWeight: 600 }} onClick={onExit}>Back</button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  topBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' },
  exitBtn: { width: 34, height: 34, borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
