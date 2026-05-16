import React, { useEffect } from 'react';
import { SessionSummary } from '@engine/engine/sessionManager';
import { useGame } from '../context/GameContext';
import { sfx } from '../utils/audio';

export function SessionComplete({
  summary,
  xpGained,
  completedQuestIds,
  onHome,
  onStudyAgain,
}: {
  summary: SessionSummary;
  xpGained: number;
  completedQuestIds: string[];
  onHome: () => void;
  onStudyAgain: () => void;
}) {
  const { newAchievements } = useGame();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sfx.complete();
  }, []);

  const isPerfect = summary.perfectSession;
  const accuracyPct = Math.round(summary.accuracy * 100);

  return (
    <div className="scroll" style={s.root}>
      {/* Trophy */}
      <div className="anim-scale" style={s.trophy}>
        <div style={{ fontSize: 88 }}>{isPerfect ? '🏆' : xpGained >= 300 ? '⭐' : '✅'}</div>
        <div style={s.trophyLabel}>
          {isPerfect ? 'Perfect Session!' : xpGained >= 300 ? 'Great Work!' : 'Session Complete'}
        </div>
        {isPerfect && (
          <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4, fontWeight: 600, letterSpacing: 0.5 }}>
            FLAWLESS · NO MISTAKES
          </div>
        )}
      </div>

      {/* XP banner */}
      <div className="anim-fade" style={s.xpBanner}>
        <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--gold)' }}>+{xpGained} XP</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Experience gained</div>
      </div>

      {/* Stats grid */}
      <div className="anim-slideup" style={s.grid}>
        {[
          { icon: '📋', label: 'Reviewed', value: summary.cardsReviewed, color: 'var(--gold)' },
          { icon: '✨', label: 'New Words', value: summary.newWordsLearned, color: 'var(--success)' },
          { icon: '🎯', label: 'Accuracy', value: `${accuracyPct}%`, color: accuracyPct >= 80 ? 'var(--success)' : accuracyPct >= 60 ? 'var(--warning)' : 'var(--error)' },
          { icon: '⏱️', label: 'Time', value: `${Math.max(1, Math.round(summary.sessionDurationSec / 60))}m`, color: 'var(--info)' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={s.statItem}>
            <div style={{ fontSize: 26 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* New achievements earned this session */}
      {newAchievements.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={s.sectionLabel}>🏅 Achievements Unlocked</div>
          {newAchievements.map(a => (
            <div key={a.id} style={{ ...s.questComplete, borderColor: a.rarity === 'legendary' ? 'var(--gold)' : a.rarity === 'rare' ? 'var(--info)' : 'var(--border)' }}>
              <span style={{ fontSize: 26 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.description}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: a.rarity === 'legendary' ? 'var(--gold)' : a.rarity === 'rare' ? 'var(--info)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{a.rarity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed quests */}
      {completedQuestIds.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={s.sectionLabel}>⚔️ Quests Completed</div>
          {completedQuestIds.map(qid => (
            <div key={qid} style={{ ...s.questComplete, borderColor: 'var(--gold)' }}>
              <span style={{ fontSize: 22 }}>🎊</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {qid.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Accuracy breakdown */}
      {summary.cardsReviewed > 0 && (
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Session Breakdown</div>
          <div className="progress-track" style={{ height: 10, borderRadius: 999, marginBottom: 8, overflow: 'hidden', display: 'flex', gap: 0 }}>
            <div style={{ width: `${accuracyPct}%`, background: 'var(--success)', transition: 'width 0.5s ease', borderRadius: '999px 0 0 999px' }} />
            <div style={{ flex: 1, background: 'var(--error)', opacity: 0.5, borderRadius: '0 999px 999px 0' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--success)' }}>✓ {Math.round(summary.accuracy * summary.cardsReviewed)} correct</span>
            <span style={{ color: 'var(--text-muted)' }}>{summary.cardsReviewed - Math.round(summary.accuracy * summary.cardsReviewed)} missed</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={s.primary} onClick={onHome}>Back to Home</button>
        <button style={s.secondary} onClick={onStudyAgain}>Study Again</button>
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, paddingTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  trophy: { textAlign: 'center' },
  trophyLabel: { fontSize: 28, fontWeight: 800, marginTop: 8 },
  xpBanner: { background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 20, padding: '20px 40px', textAlign: 'center', width: '100%' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%' },
  statItem: { width: 'calc(50% - 5px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  sectionLabel: { fontWeight: 700, color: 'var(--text-sec)', marginBottom: 10, fontSize: 13 },
  questComplete: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  primary: { background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15, width: '100%' },
  secondary: { background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600, fontSize: 15, width: '100%' },
};
