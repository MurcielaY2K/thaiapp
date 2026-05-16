import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const XP_PER_LEVEL = 500;
const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

export function Profile() {
  const { profile, stats, refreshStats, resetProgress } = useGame();
  useEffect(() => { refreshStats(); }, []);

  if (!profile || !stats) return null;

  const levelXP = profile.totalXP % XP_PER_LEVEL;

  const confirmReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) resetProgress();
  };

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero card */}
      <div style={s.heroCard}>
        <div style={s.avatar}>🧭</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Level {profile.currentLevel} Traveler</div>
        <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>XP to next level</span>
            <span>{levelXP} / {XP_PER_LEVEL}</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(levelXP / XP_PER_LEVEL) * 100}%`, background: 'var(--gold)' }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={s.grid}>
        {[
          ['✨', 'Total XP', profile.totalXP.toLocaleString(), 'var(--gold)'],
          ['🔥', 'Streak', profile.currentStreak, 'var(--warning)'],
          ['📖', 'Words', profile.totalWordsLearned, 'var(--success)'],
          ['📋', 'Reviewed', profile.totalCardsReviewed, 'var(--info)'],
          ['⭐', 'Mastered', stats.masteredCards, 'var(--gold)'],
          ['⚠️', 'Struggling', stats.strugglingCards, 'var(--warning)'],
        ].map(([icon, label, value, color]) => (
          <div key={String(label)} style={s.stat}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: String(color) }}>{value}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Regions */}
      <div>
        <div style={s.sectionTitle}>Regions Unlocked</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profile.unlockedRegions.map(r => {
            const color = REGION_COLOR[r] ?? 'var(--primary)';
            return (
              <div key={r} style={{ border: `1px solid ${color}`, borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'capitalize' }}>{r.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Companions */}
      {profile.collectedCompanionIds.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Companions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {profile.collectedCompanionIds.map((cid: string) => (
              <div key={cid} style={{ background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>🐾</div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>{cid}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <button style={s.resetBtn} onClick={confirmReset}>Reset All Progress</button>
      </div>

      <div style={{ paddingBottom: 20 }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  heroCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'var(--surface-hi)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 4 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  stat: { width: 'calc(33.33% - 7px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  resetBtn: { width: '100%', background: 'transparent', border: '1px solid var(--error)', borderRadius: 12, padding: 14, color: 'var(--error)', fontWeight: 600, fontSize: 14 },
};
