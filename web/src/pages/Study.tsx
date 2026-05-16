import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Session, ReviewQuality } from '@engine/types';
import { SessionSummary } from '@engine/engine/sessionManager';
import { sfx, speakThai } from '../utils/audio';
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

export function Study({
  onComplete,
  onExit,
}: {
  onComplete: (summary: SessionSummary, xp: number, questIds: string[]) => void;
  onExit: () => void;
}) {
  const { facade, refreshStats } = useGame();
  const [session, setSession] = useState<Session | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!facade) return;
    try {
      setSession(facade.startSession());
      startTime.current = Date.now();
    } catch { onExit(); }

    const handler = (e: KeyboardEvent) => {
      if (['1','2','3','4'].includes(e.key)) {
        const q = [0,2,3,4][parseInt(e.key)-1] as Quality;
        answer(q);
      } else if (e.key === ' ') {
        setFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentCard = session?.cards[session.currentIndex];

  const answer = useCallback(async (q: Quality) => {
    if (!facade || !session || !currentCard || !flipped || exiting) return;

    if (q >= 3) sfx.correct(); else sfx.wrong();

    const timeTaken = Date.now() - startTime.current;
    const result = facade.answerCard(q as ReviewQuality, timeTaken);
    const updated = result.updatedSession;

    if (updated.isComplete) {
      setExiting(true);
      sfx.complete();
      const endResult = await facade.endSession();
      refreshStats();
      if (endResult) {
        updateChallengeProgress('study', endResult.summary.cardsReviewed);
        updateChallengeProgress('new_words', endResult.summary.newWordsLearned);
        onComplete(endResult.summary, endResult.summary.xpEarned, endResult.completedQuestIds);
      }
      return;
    }

    setSession(updated);
    setFlipped(false);
    startTime.current = Date.now();
  }, [facade, session, currentCard, flipped, exiting]);

  if (!session || !currentCard) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-sec)' }}>Loading cards…</div>
      </div>
    );
  }

  const card = currentCard.card;
  const progress = session.currentIndex / session.cards.length;
  const regionColor = REGION_COLOR[card.region] ?? 'var(--primary)';

  return (
    <div style={s.root}>
      {/* Top bar */}
      <div style={s.topBar}>
        <button style={s.exitBtn} onClick={onExit}>✕</button>
        <div style={{ flex: 1 }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%`, background: regionColor }} />
          </div>
        </div>
        <span style={s.counter}>{session.currentIndex + 1}/{session.cards.length}</span>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', alignItems: 'center' }}>
        <div className="flip-container" style={{ width: '100%' }}>
          <div className={`flip-inner${flipped ? ' flipped' : ''}`}>
            {/* Front */}
            <div
              className="flip-front"
              style={{ ...s.card, borderTop: `4px solid ${regionColor}`, cursor: 'pointer', minHeight: 300, justifyContent: 'center', alignItems: 'center' }}
              onClick={() => { sfx.flip(); setFlipped(true); }}
            >
              <div style={s.catLabel}>{card.category.replace(/_/g, ' ')}{currentCard.isNew && <span style={{ color: 'var(--success)', fontWeight: 700, marginLeft: 6 }}>NEW</span>}</div>
              <div style={s.toneLabel}>{card.tone} tone</div>
              <div style={s.thaiText}>{card.thai}</div>
              <div style={s.roman}>{card.romanization}</div>
              <button
                style={{ position: 'absolute', bottom: 14, right: 14, background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 999, width: 36, height: 36, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)' }}
                onClick={e => { e.stopPropagation(); speakThai(card.thai); }}
                title="Listen to pronunciation"
              >🔊</button>
              <div style={s.tapHint}>Tap to reveal →</div>
            </div>

            {/* Back */}
            <div
              className="flip-back"
              style={{ ...s.card, borderTop: `4px solid ${regionColor}`, minHeight: 300, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{card.thai}</div>
                <button
                  style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 999, width: 32, height: 32, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', flexShrink: 0 }}
                  onClick={e => { e.stopPropagation(); speakThai(card.thai); }}
                >🔊</button>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>{card.englishMeaning}</div>
              {card.englishAlternatives?.length ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>
                  also: {card.englishAlternatives.join(', ')}
                </div>
              ) : null}
              {card.exampleSentence && (
                <div style={s.example}>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{card.exampleSentence.thai}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{card.exampleSentence.romanization}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic', marginTop: 4 }}>"{card.exampleSentence.englishNatural}"</div>
                </div>
              )}
              {card.culturalNote && (
                <div style={{ background: 'var(--surface-hi)', borderRadius: 10, padding: '10px 14px', width: '100%', marginTop: 8, display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{card.culturalNote}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skip hint (before flip) */}
      {!flipped && (
        <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'center' }}>
          <button
            style={{ background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, padding: '6px 20px', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}
            onClick={() => answer(2)}
            title="Skip this card (mark as Hard)"
          >
            Skip →
          </button>
        </div>
      )}

      {/* Quality buttons */}
      <div style={{ ...s.qualityArea, opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
          How well did you know it? <span style={{ color: 'var(--border)' }}>· space to flip · 1–4 to rate</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {QUALITY.map(({ q, label, color, key }) => (
            <button
              key={q}
              style={{ flex: 1, background: 'var(--surface)', border: `2px solid ${color}`, borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              onClick={() => answer(q)}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>[{key}]</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
            </button>
          ))}
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
  card: { background: 'var(--surface)', borderRadius: 20, padding: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'relative' },
  catLabel: { position: 'absolute', top: 14, left: 16, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 },
  toneLabel: { position: 'absolute', top: 14, right: 16, fontSize: 10, color: 'var(--text-muted)' },
  thaiText: { fontSize: 58, fontWeight: 700, lineHeight: 1.2, textAlign: 'center', marginBottom: 10 },
  roman: { fontSize: 20, color: 'var(--text-sec)', textAlign: 'center', marginBottom: 28 },
  tapHint: { fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' },
  example: { background: 'var(--surface-hi)', borderRadius: 10, padding: 14, width: '100%', marginTop: 8 },
  qualityArea: { padding: '12px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', transition: 'opacity 0.2s' },
};
