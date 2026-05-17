import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Session, ReviewQuality } from '@engine/types';
import { SessionSummary } from '@engine/engine/sessionManager';
import { VOCABULARY } from '@engine/data/vocabulary';
import { sfx, speakThai, getAutoPlay } from '../utils/audio';
import { updateChallengeProgress } from '../utils/dailyChallenge';

type Quality = 0 | 2 | 3 | 4;

const QUALITY: { q: Quality; label: string; color: string; key: string }[] = [
  { q: 0, label: 'Again', color: 'var(--again)', key: '1' },
  { q: 2, label: 'Hard',  color: 'var(--hard)',  key: '2' },
  { q: 3, label: 'Good',  color: 'var(--good)',  key: '3' },
  { q: 4, label: 'Easy',  color: 'var(--easy)',  key: '4' },
];

const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

const CATEGORY_ICONS: Record<string, string> = {
  greetings: '👋', numbers: '🔢', food: '🍜', travel: '✈️', verbs_core: '⚡',
  adjectives_core: '🎨', direction: '🧭', time: '⏰', family: '👨‍👩‍👧', emotion: '😊',
  body: '🫀', color: '🌈', transport: '🚕', shopping: '🛍️', nature: '🌿',
  health: '🏥', culture: '🏛️', weather: '⛅', animal: '🐘', work: '💼',
  verbs: '💫', adjectives: '✨', spirits: '👻', music: '🎵', temples: '⛩️',
  landscape: '🏞️', ocean: '🌊', sky: '🌌', cosmic: '🔭', island: '🏝️',
  mountain: '🏔️', stone: '🪨', sacred: '🕯️', mystical: '🔮',
};

export function Study({
  onComplete,
  onExit,
  regionFilter,
}: {
  onComplete: (summary: SessionSummary, xp: number, questIds: string[]) => void;
  onExit: () => void;
  regionFilter?: string;
}) {
  const { profile } = useGame();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [started, setStarted] = useState(!!regionFilter);

  const availableCategories = useMemo(() => {
    const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
    const pool = regionFilter
      ? VOCABULARY.filter(c => c.region === regionFilter)
      : VOCABULARY.filter(c => unlocked.includes(c.region));
    const cats = new Set(pool.map(c => c.category));
    return Array.from(cats).sort();
  }, [profile, regionFilter]);

  if (!started) {
    return (
      <StudySetup
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onToggle={cat => setSelectedCategories(prev =>
          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )}
        onStart={() => setStarted(true)}
        onExit={onExit}
      />
    );
  }

  return (
    <StudySession
      categoryFilter={selectedCategories.length > 0 ? selectedCategories : undefined}
      regionFilter={regionFilter}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
}

function StudySetup({
  availableCategories,
  selectedCategories,
  onToggle,
  onStart,
  onExit,
}: {
  availableCategories: string[];
  selectedCategories: string[];
  onToggle: (cat: string) => void;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Flashcard Study</span>
        <div style={{ width: 32 }} />
      </div>

      <div className="scroll" style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontSize: 44 }}>📖</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Study Session</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
            SRS flashcards — rated by memory. Pick categories to focus, or study everything.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Focus by Category <span style={{ color: 'var(--primary)' }}>{selectedCategories.length > 0 ? `· ${selectedCategories.length} selected` : '· all'}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availableCategories.map(cat => {
              const active = selectedCategories.includes(cat);
              const icon = CATEGORY_ICONS[cat] ?? '📝';
              return (
                <button
                  key={cat}
                  onClick={() => onToggle(cat)}
                  style={{
                    padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
                    background: active ? 'var(--primary)' : 'var(--bg)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    color: active ? '#fff' : 'var(--text-sec)',
                    transition: 'all 0.15s',
                  }}
                >
                  {icon} {cat.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => selectedCategories.forEach(c => onToggle(c))}
              style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, padding: '4px 12px' }}
            >
              Clear selection
            </button>
          )}
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 14, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>How it works</div>
          {[
            ['Space / Tap', 'Reveal the translation'],
            ['1 Again', 'Didn\'t know it — review soon'],
            ['2 Hard', 'Struggled — shorter interval'],
            ['3 Good', 'Got it — normal interval'],
            ['4 Easy', 'Perfect recall — longer interval'],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 7px', fontWeight: 700, color: 'var(--text-sec)', minWidth: 60, textAlign: 'center', flexShrink: 0 }}>{key}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <button
          style={{ background: 'var(--primary)', color: '#fff', borderRadius: 14, padding: 18, fontWeight: 700, fontSize: 16, width: '100%' }}
          onClick={onStart}
        >
          {selectedCategories.length > 0 ? `Study ${selectedCategories.map(c => c.replace(/_/g, ' ')).join(', ')}` : 'Start Full Session'} →
        </button>
      </div>
    </div>
  );
}

function StudySession({
  categoryFilter,
  regionFilter,
  onComplete,
  onExit,
}: {
  categoryFilter?: string[];
  regionFilter?: string;
  onComplete: (summary: SessionSummary, xp: number, questIds: string[]) => void;
  onExit: () => void;
}) {
  const { facade, refreshStats, refreshDailyChallenge, awardChallengeXP } = useGame();
  const [session, setSession] = useState<Session | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const startTime = useRef(Date.now());
  useEffect(() => {
    if (!facade) return;
    try {
      const filter: { categories?: string[]; region?: string } | undefined =
        (categoryFilter && categoryFilter.length > 0) || regionFilter
          ? { categories: categoryFilter?.length ? categoryFilter : undefined, region: regionFilter }
          : undefined;
      setSession(facade.startSession(filter));
      startTime.current = Date.now();
    } catch { onExit(); }

    const handler = (e: KeyboardEvent) => {
      if (['1','2','3','4'].includes(e.key)) {
        const q = [0,2,3,4][parseInt(e.key)-1] as Quality;
        answerRef.current(q);
      } else if (e.key === ' ') {
        setFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-play TTS when card is flipped to reveal
  useEffect(() => {
    if (flipped && session && getAutoPlay()) {
      const card = session.cards[session.currentIndex]?.card;
      if (card) speakThai(card.thai);
    }
  }, [flipped]);

  const answerRef = useRef<(q: Quality) => void>(() => {});

  const answer = useCallback(async (q: Quality) => {
    if (!facade || !session || !flipped || exiting) return;
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;

    if (q >= 3) { sfx.correct(); setSessionCorrect(c => c + 1); setCombo(c => c + 1); }
    else { sfx.wrong(); setCombo(0); }
    setSessionTotal(t => t + 1);

    const timeTaken = Date.now() - startTime.current;
    const result = facade.answerCard(q as ReviewQuality, timeTaken);
    const updated = result.updatedSession;

    if (updated.isComplete) {
      setExiting(true);
      sfx.complete();
      const endResult = await facade.endSession();
      refreshStats();
      if (endResult) {
        const r1 = updateChallengeProgress('study', endResult.summary.cardsReviewed);
        const r2 = updateChallengeProgress('new_words', endResult.summary.newWordsLearned);
        if (r1.justCompleted) await awardChallengeXP(r1.challenge.xpReward);
        else if (r2.justCompleted) await awardChallengeXP(r2.challenge.xpReward);
        refreshDailyChallenge();
        onComplete(endResult.summary, endResult.summary.xpEarned, endResult.completedQuestIds);
      }
      return;
    }

    setSession(updated);
    setFlipped(false);
    startTime.current = Date.now();
  }, [facade, session, flipped, exiting]);

  answerRef.current = answer;

  if (!session) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-sec)' }}>Loading cards…</div>
      </div>
    );
  }

  const currentCard = session.cards[session.currentIndex];
  if (!currentCard) return null;

  const card = currentCard.card;
  const progress = session.currentIndex / session.cards.length;
  const regionColor = REGION_COLOR[card.region] ?? 'var(--primary)';

  return (
    <div style={s.root}>
      {/* ── TOP BAR ── */}
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%`, background: regionColor }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 48 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.currentIndex + 1}/{session.cards.length}</div>
          {combo >= 3 && <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800 }}>🔥{combo}</div>}
          {combo < 3 && sessionTotal > 0 && (
            <div style={{ fontSize: 10, fontWeight: 700, color: sessionCorrect / sessionTotal >= 0.8 ? 'var(--success)' : sessionCorrect / sessionTotal >= 0.6 ? 'var(--gold)' : 'var(--error)' }}>
              {Math.round((sessionCorrect / sessionTotal) * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* ── CARD AREA (fills middle, never scrolls) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px 8px', overflow: 'hidden' }}>
        {/* Category + tone */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          <span>
            {CATEGORY_ICONS[card.category] ?? '📖'} {card.category.replace(/_/g, ' ')}
            {currentCard.isNew && <span style={{ color: 'var(--success)', fontWeight: 700, marginLeft: 6 }}>NEW</span>}
          </span>
          <span>{card.tone} tone</span>
        </div>

        {/* Card face */}
        <div style={{ background: 'linear-gradient(160deg, rgba(22,12,53,0.97) 0%, rgba(14,7,38,0.98) 100%)', borderRadius: 24, borderTop: `4px solid ${regionColor}`, padding: '28px 24px', textAlign: 'center', boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>{card.thai}</div>
          <div style={{ fontSize: 15, color: 'var(--text-sec)', marginBottom: 14, letterSpacing: 0.3 }}>{card.romanization}</div>
          <button
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '6px 18px', fontSize: 13, color: 'var(--text-sec)', backdropFilter: 'blur(10px)' }}
            onClick={() => speakThai(card.thai)}
          >🔊 Listen</button>

          {/* Answer revealed inline inside the card */}
          {flipped && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', marginBottom: 4, letterSpacing: -0.5 }}>{card.englishMeaning}</div>
              {card.englishAlternatives?.length ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>
                  also: {card.englishAlternatives.join(', ')}
                </div>
              ) : null}
              {card.exampleSentence && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px', textAlign: 'left', marginTop: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{card.exampleSentence.thai}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{card.exampleSentence.romanization}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)', fontStyle: 'italic', marginTop: 3 }}>"{card.exampleSentence.englishNatural}"</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BUTTON BAR (always pinned at bottom) ── */}
      <div style={{ flexShrink: 0, padding: '0 18px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
        {!flipped ? (
          <button
            style={{ width: '100%', background: 'linear-gradient(135deg, #D4801A 0%, #F59E42 45%, #FFB84D 80%, #F5C060 100%)', color: '#1A0800', borderRadius: 18, padding: '20px 0', fontWeight: 900, fontSize: 20, letterSpacing: -0.3, boxShadow: '0 6px 32px rgba(245,158,66,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}
            onClick={() => { sfx.flip(); setFlipped(true); }}
          >
            Show Answer
          </button>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <button
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 16, padding: '17px 0', fontWeight: 800, fontSize: 17, color: 'var(--error)', boxShadow: '0 2px 12px rgba(239,68,68,0.15)' }}
                onClick={() => answer(0)}
              >✗ Again</button>
              <button
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.5)', borderRadius: 16, padding: '17px 0', fontWeight: 800, fontSize: 17, color: 'var(--success)', boxShadow: '0 2px 12px rgba(16,185,129,0.15)' }}
                onClick={() => answer(3)}
              >✓ Got it</button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {QUALITY.map(({ q, label, color }) => (
                <button key={q}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}44`, borderRadius: 12, padding: '10px 2px', fontSize: 11, fontWeight: 700, color }}
                  onClick={() => answer(q)}
                >{label}</button>
              ))}
              <button
                style={{ flex: 1.3, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 2px', fontSize: 11, fontWeight: 700, color: 'var(--text-sec)' }}
                onClick={() => answer(3)}
              >Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  topBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px 10px', paddingTop: 'calc(env(safe-area-inset-top,0px) + 12px)', flexShrink: 0 },
  exitBtn: { width: 34, height: 34, borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
