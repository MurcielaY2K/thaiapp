import React, { useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { REGIONS } from '@engine/types';
import { VOCABULARY } from '@engine/data/vocabulary';
import { getLevelConfig } from '@engine/engine/gameEngine';

const XP_PER_LEVEL = 500;
const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

const RARITY_COLOR = { common: 'var(--text-sec)', rare: 'var(--info)', legendary: 'var(--gold)' };

const COMPANION_DATA: Record<string, { icon: string; name: string; desc: string }> = {
  phi_lok:           { icon: '👻', name: 'Phi Lok',          desc: 'Spirit of the Golden Port' },
  rice_spirit:       { icon: '🌾', name: 'Rice Spirit',       desc: 'Keeper of the harvest plains' },
  mountain_eagle:    { icon: '🦅', name: 'Mountain Eagle',    desc: 'Guardian of the northern peaks' },
  naga_water:        { icon: '🐉', name: 'Naga Water',        desc: 'Serpent lord of the Golden Sea' },
  stone_guardian:    { icon: '🗿', name: 'Stone Guardian',    desc: 'Ancient warden of the ruins' },
  phoenix_spirit:    { icon: '🔥', name: 'Phoenix Spirit',    desc: 'Celestial flame of the Sky Palace' },
  enlightened_spirit:{ icon: '✨', name: 'Enlightened Spirit', desc: 'Sage of the Spirit Realm' },
};

export function Profile({ onSettings }: { onSettings: () => void }) {
  const { profile, stats, heatmap, earnedAchievementIds, refreshStats, facade } = useGame();
  useEffect(() => { refreshStats(); }, []);

  if (!profile || !stats) return null;

  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const levelCfg = getLevelConfig(profile.currentLevel);

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero card */}
      <div style={s.heroCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 12 }}>
          <div style={s.avatar}>🧭</div>
          <button style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 }} onClick={onSettings}>
            ⚙️ Settings
          </button>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{profile.name}</div>
        <div style={{ fontSize: 22, color: 'var(--primary)', fontWeight: 700, letterSpacing: 0.5 }}>{levelCfg.titleThai}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Level {profile.currentLevel} · {levelCfg.titleEnglish} · {levelCfg.titleRomanized}</div>
        <div style={{ width: '100%', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>XP to next level</span><span>{levelXP} / {XP_PER_LEVEL}</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(levelXP / XP_PER_LEVEL) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--gold))' }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={s.grid}>
        {[
          ['✨', 'Total XP', profile.totalXP.toLocaleString(), 'var(--gold)'],
          ['🔥', 'Best Streak', profile.longestStreak, 'var(--warning)'],
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

      {/* Heatmap */}
      <div>
        <div style={s.sectionTitle}>Activity — last 16 weeks</div>
        <Heatmap data={heatmap} />
      </div>

      {/* Achievements */}
      <div>
        <div style={s.sectionTitle}>
          Achievements · {earnedAchievementIds.size}/{ACHIEVEMENTS.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACHIEVEMENTS.map(a => {
            const earned = earnedAchievementIds.has(a.id);
            return (
              <div key={a.id} style={{ background: 'var(--surface)', border: `1px solid ${earned ? RARITY_COLOR[a.rarity] : 'var(--border)'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: earned ? 1 : 0.4 }}>
                <span style={{ fontSize: 26, filter: earned ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: earned ? 'var(--text)' : 'var(--text-muted)' }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.description}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: RARITY_COLOR[a.rarity], textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.rarity}</span>
              </div>
            );
          })}
        </div>
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
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{REGIONS[r].nameEnglish}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary by region */}
      <VocabByRegion unlockedRegions={profile.unlockedRegions} srsMap={facade?.srsMap ?? new Map()} />

      {/* Companions */}
      {profile.collectedCompanionIds.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Companions · {profile.collectedCompanionIds.length} collected</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.collectedCompanionIds.map((cid: string) => {
              const c = COMPANION_DATA[cid] ?? { icon: '🐾', name: cid, desc: 'Mysterious companion' };
              return (
                <div key={cid} style={{ background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 32 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ paddingBottom: 20 }} />
    </div>
  );
}

function VocabByRegion({ unlockedRegions, srsMap }: { unlockedRegions: string[]; srsMap: Map<string, unknown> }) {
  const regionCounts = useMemo(() => {
    const counts: Record<string, { total: number; seen: number }> = {};
    for (const card of VOCABULARY) {
      if (!counts[card.region]) counts[card.region] = { total: 0, seen: 0 };
      counts[card.region].total++;
      if (srsMap.has(card.id)) counts[card.region].seen++;
    }
    return counts;
  }, [srsMap]);

  return (
    <div>
      <div style={s.sectionTitle}>Vocabulary by Region</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {unlockedRegions.map(r => {
          const color = REGION_COLOR[r] ?? 'var(--primary)';
          const { total = 0, seen = 0 } = regionCounts[r] ?? {};
          const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
          return (
            <div key={r} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{REGIONS[r as keyof typeof REGIONS].nameEnglish}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{seen}/{total} seen</span>
              </div>
              <div className="progress-track" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Heatmap({ data }: { data: Record<string, number> }) {
  const WEEKS = 16;
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - WEEKS * 7 + 1);

    const result: { date: string; count: number }[][] = [];
    let week: { date: string; count: number }[] = [];
    const cur = new Date(start);

    while (cur <= today) {
      const d = cur.toISOString().split('T')[0];
      week.push({ date: d, count: data[d] ?? 0 });
      if (week.length === 7) { result.push(week); week = []; }
      cur.setDate(cur.getDate() + 1);
    }
    if (week.length) {
      while (week.length < 7) week.push({ date: '', count: -1 });
      result.push(week);
    }
    return result;
  }, [data]);

  const maxCount = Math.max(1, ...Object.values(data));

  const cellColor = (count: number) => {
    if (count <= 0) return 'var(--border)';
    const intensity = Math.min(1, count / Math.max(maxCount, 5));
    if (intensity < 0.25) return '#1e3a5f';
    if (intensity < 0.5)  return '#1d5fa8';
    if (intensity < 0.75) return '#2070cc';
    return 'var(--primary)';
  };

  const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
      {/* Day labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 0, flexShrink: 0 }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-muted)' }}>{l}</div>
        ))}
      </div>
      {/* Grid */}
      {cells.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
          {week.map((cell, di) => (
            <div
              key={di}
              title={cell.date ? `${cell.date}: ${cell.count} reviews` : ''}
              style={{ width: 12, height: 12, borderRadius: 2, background: cell.count < 0 ? 'transparent' : cellColor(cell.count), flexShrink: 0 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  heroCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-hi)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 2 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  stat: { width: 'calc(33.33% - 7px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
};
