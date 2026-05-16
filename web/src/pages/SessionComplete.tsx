import React, { useEffect, useMemo } from 'react';
import { SessionSummary } from '@engine/engine/sessionManager';
import { useGame } from '../context/GameContext';
import { sfx } from '../utils/audio';
import { getLevelConfig } from '@engine/engine/gameEngine';

const XP_PER_LEVEL = 500;

const MOTIVATIONAL: Record<string, string[]> = {
  perfect: ['เยี่ยมมาก! Flawless!', 'คุณเก่งมาก! You\'re amazing!', 'ยอดเยี่ยม! Excellent!'],
  great: ['ดีมาก! Great job!', 'คุณทำได้ดี! Well done!', 'เก่งมาก! Very good!'],
  ok: ['พยายามต่อไป! Keep going!', 'ดี! Getting better!', 'ฝึกต่อไปนะ! Keep practicing!'],
  low: ['ไม่เป็นไร! No problem!', 'ลองอีกครั้ง! Try again!', 'ทบทวนต่อไป! Keep reviewing!'],
};

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
  const { newAchievements, profile, stats } = useGame();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sfx.complete();
  }, []);

  const isPerfect = summary.perfectSession;
  const accuracyPct = Math.round(summary.accuracy * 100);

  const grade = isPerfect ? 'perfect' : accuracyPct >= 80 ? 'great' : accuracyPct >= 60 ? 'ok' : 'low';
  const dayIdx = Math.floor(Date.now() / 86400000);
  const motivation = MOTIVATIONAL[grade][dayIdx % MOTIVATIONAL[grade].length];

  const trophyEmoji = isPerfect ? '🏆' : accuracyPct >= 80 ? '⭐' : accuracyPct >= 60 ? '✅' : '💪';

  const levelInfo = useMemo(() => {
    if (!profile) return null;
    const levelXP = profile.totalXP % XP_PER_LEVEL;
    const cfg = getLevelConfig(profile.currentLevel);
    return { levelXP, cfg, level: profile.currentLevel };
  }, [profile]);

  const durationMin = Math.max(1, Math.round(summary.sessionDurationSec / 60));
  const wordsPerMin = summary.sessionDurationSec > 0 ? (summary.cardsReviewed / (summary.sessionDurationSec / 60)).toFixed(1) : '—';

  return (
    <div className="scroll" style={s.root}>
      {/* Trophy + grade */}
      <div className="anim-scale" style={s.trophy}>
        <div style={{ fontSize: 80 }}>{trophyEmoji}</div>
        <div style={s.trophyLabel}>
          {isPerfect ? 'Perfect Session!' : accuracyPct >= 80 ? 'Great Work!' : accuracyPct >= 60 ? 'Session Complete' : 'Keep Going!'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--gold)', fontStyle: 'italic', marginTop: 6 }}>{motivation}</div>
        {isPerfect && (
          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4, fontWeight: 700, letterSpacing: 1, background: 'rgba(245,158,11,0.15)', borderRadius: 999, padding: '3px 12px' }}>
            FLAWLESS · +100 BONUS XP
          </div>
        )}
      </div>

      {/* XP banner */}
      <div className="anim-fade" style={s.xpBanner}>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--gold)' }}>+{xpGained} XP</div>
        {summary.goldEarned > 0 && (
          <div style={{ fontSize: 18, color: 'var(--gold)', marginTop: 4 }}>🪙 +{summary.goldEarned}</div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Experience gained this session</div>
      </div>

      {/* Level progress */}
      {levelInfo && (
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
            <span>⚡ Level {levelInfo.level} · {levelInfo.cfg.titleThai}</span>
            <span style={{ color: 'var(--text-muted)' }}>{levelInfo.levelXP}/{XP_PER_LEVEL} XP</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(levelInfo.levelXP / XP_PER_LEVEL) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--gold))', transition: 'width 0.8s ease' }} />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="anim-slideup" style={s.grid}>
        {[
          { icon: '📋', label: 'Reviewed', value: summary.cardsReviewed, color: 'var(--gold)' },
          { icon: '✨', label: 'New Words', value: summary.newWordsLearned, color: 'var(--success)' },
          { icon: '🎯', label: 'Accuracy', value: `${accuracyPct}%`, color: accuracyPct >= 80 ? 'var(--success)' : accuracyPct >= 60 ? 'var(--warning)' : 'var(--error)' },
          { icon: '⏱️', label: 'Duration', value: `${durationMin}m`, color: 'var(--info)' },
          { icon: '⚡', label: 'Cards/min', value: wordsPerMin, color: 'var(--primary)' },
          { icon: '🔥', label: 'Streak', value: `${profile?.currentStreak ?? 0}d`, color: 'var(--warning)' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={s.statItem}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      {summary.cardsReviewed > 0 && (
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Session Accuracy</div>
          <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${accuracyPct}%`, background: 'var(--success)', transition: 'width 0.6s ease' }} />
            <div style={{ flex: 1, background: `rgba(239,68,68,0.4)` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8 }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {Math.round(summary.accuracy * summary.cardsReviewed)} correct</span>
            <span style={{ color: 'var(--text-muted)' }}>{summary.cardsReviewed - Math.round(summary.accuracy * summary.cardsReviewed)} missed</span>
          </div>
        </div>
      )}

      {/* New achievements earned this session */}
      {newAchievements.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={s.sectionLabel}>🏅 Achievements Unlocked</div>
          {newAchievements.map(a => (
            <div key={a.id} style={{ ...s.questComplete, borderColor: a.rarity === 'legendary' ? 'var(--gold)' : a.rarity === 'rare' ? 'var(--info)' : 'var(--border)', marginBottom: 8 }}>
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
            <div key={qid} style={{ ...s.questComplete, borderColor: 'var(--gold)', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🎊</span>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                {qid.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '')}
              </span>
              <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>Quest Complete!</span>
            </div>
          ))}
        </div>
      )}

      {/* What's next */}
      {stats && (
        <div style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>What's Next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.dueToday > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>{stats.dueToday} more review{stats.dueToday !== 1 ? 's' : ''} still due today</span>
              </div>
            )}
            {stats.newAvailable > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✨</span>
                <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>{stats.newAvailable} new word{stats.newAvailable !== 1 ? 's' : ''} ready to learn</span>
              </div>
            )}
            {stats.dueToday === 0 && stats.newAvailable === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>All caught up! Come back tomorrow.</span>
              </div>
            )}
            {stats.masteredCards > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.masteredCards} word{stats.masteredCards !== 1 ? 's' : ''} mastered in total</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={s.primary} onClick={onHome}>Back to Home</button>
        <button style={s.secondary} onClick={onStudyAgain}>Study Again</button>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, paddingTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 },
  trophy: { textAlign: 'center' },
  trophyLabel: { fontSize: 26, fontWeight: 800, marginTop: 8 },
  xpBanner: { background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 20, padding: '18px 40px', textAlign: 'center', width: '100%' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%' },
  statItem: { width: 'calc(33.33% - 7px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  sectionLabel: { fontWeight: 700, color: 'var(--text-sec)', marginBottom: 10, fontSize: 13, width: '100%' },
  questComplete: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, width: '100%' },
  primary: { background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 15, width: '100%' },
  secondary: { background: 'var(--surface)', color: 'var(--text-sec)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontWeight: 600, fontSize: 15, width: '100%' },
};
