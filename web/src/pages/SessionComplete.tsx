import React, { useEffect } from 'react';
import { SessionSummary } from '@engine/engine/sessionManager';

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
  useEffect(() => {
    // subtle scroll-to-top animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isPerfect = summary.perfectSession;

  return (
    <div className="scroll" style={s.root}>
      {/* Trophy */}
      <div className="anim-scale" style={s.trophy}>
        <div style={{ fontSize: 80 }}>{isPerfect ? '🏆' : '⭐'}</div>
        <div style={s.trophyLabel}>{isPerfect ? '🏆 Perfect Session!' : xpGained >= 200 ? '⭐ Great Work!' : '✅ Session Complete'}</div>
      </div>

      {/* XP banner */}
      <div className="anim-fade" style={s.xpBanner}>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--gold)' }}>+{xpGained} XP</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Experience gained</div>
      </div>

      {/* Stats grid */}
      <div className="anim-slideup" style={s.grid}>
        {[
          { icon: '📋', label: 'Cards Reviewed', value: summary.cardsReviewed, color: 'var(--gold)' },
          { icon: '✨', label: 'New Words', value: summary.newWordsLearned, color: 'var(--success)' },
          { icon: '🎯', label: 'Accuracy', value: `${Math.round(summary.accuracy * 100)}%`, color: summary.accuracy >= 0.8 ? 'var(--success)' : 'var(--warning)' },
          { icon: '⏱️', label: 'Time', value: `${Math.max(1, Math.round(summary.sessionDurationSec / 60))}m`, color: 'var(--info)' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={s.statItem}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Completed quests */}
      {completedQuestIds.length > 0 && (
        <div style={{ width: '100%', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: 'var(--gold)', textAlign: 'center', marginBottom: 10 }}>Quests Completed!</div>
          {completedQuestIds.map(qid => (
            <div key={qid} style={s.questComplete}>
              <span style={{ fontSize: 20 }}>🎊</span>
              <span style={{ fontSize: 13, textTransform: 'capitalize', fontWeight: 600 }}>
                {qid.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={s.primary} onClick={onHome}>Back to Home</button>
        <button style={s.secondary} onClick={onStudyAgain}>Study Again</button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  trophy: { textAlign: 'center' },
  trophyLabel: { fontSize: 26, fontWeight: 800, marginTop: 8 },
  xpBanner: { background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 20, padding: '20px 40px', textAlign: 'center', width: '100%' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%' },
  statItem: { width: 'calc(50% - 5px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  questComplete: { background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  primary: { background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15, width: '100%' },
  secondary: { background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600, fontSize: 15, width: '100%' },
};
