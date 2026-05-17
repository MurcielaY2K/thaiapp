import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { REGIONS } from '@engine/types';
import { VOCABULARY } from '@engine/data/vocabulary';
import { getLevelConfig, SPIRIT_COMPANIONS } from '@engine/engine/gameEngine';
import { getFeatureUnlocks } from '../utils/featureUnlocks';

const XP_PER_LEVEL = 500;

const AVATARS: { id: string; icon: string; label: string }[] = [
  { id: 'avatar_1', icon: '🧭', label: 'Explorer' },
  { id: 'avatar_2', icon: '⚔️', label: 'Warrior' },
  { id: 'avatar_3', icon: '🎓', label: 'Scholar' },
  { id: 'avatar_4', icon: '🌸', label: 'Spirit' },
  { id: 'avatar_5', icon: '🐉', label: 'Dragon' },
  { id: 'avatar_6', icon: '🔮', label: 'Mystic' },
  { id: 'avatar_7', icon: '🌊', label: 'Wave' },
  { id: 'avatar_8', icon: '⭐', label: 'Star' },
];

const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

const RARITY_COLOR = { common: 'var(--text-sec)', rare: 'var(--info)', legendary: 'var(--gold)' };

const COMPANION_ICON: Record<string, string> = {
  phi_krasue: '👻', phi_pret: '🙏', nang_tani: '🌿', mae_nak: '💀',
  garuda: '🦅', phi_lok: '👁️',
  rice_spirit: '🌾', mountain_eagle: '🦅', naga_water: '🐉',
  stone_guardian: '🗿', phoenix_spirit: '🔥', enlightened_spirit: '✨',
};

export function Profile({ onSettings, onShop }: { onSettings: () => void; onShop?: () => void }) {
  const { profile, stats, heatmap, earnedAchievementIds, refreshStats, facade } = useGame();
  const [sessionHistory] = useState(() => facade?.getSessionHistory().slice(-14).reverse() ?? []);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  useEffect(() => { refreshStats(); }, []);

  if (!profile || !stats) return null;

  const unlocks = getFeatureUnlocks(profile);
  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const levelCfg = getLevelConfig(profile.currentLevel);
  const currentAvatar = AVATARS.find(a => a.id === profile.avatarId) ?? AVATARS[0];

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !facade) { setEditingName(false); return; }
    await facade.saveProfile({ ...profile, name: trimmed });
    refreshStats();
    setEditingName(false);
  };

  const toggleCompanion = async (cid: string) => {
    if (!facade) return;
    const isActive = profile.activeCompanionIds.includes(cid);
    let active: string[];
    if (isActive) {
      active = profile.activeCompanionIds.filter(id => id !== cid);
    } else {
      if (profile.activeCompanionIds.length >= 3) return;
      active = [...profile.activeCompanionIds, cid];
    }
    await facade.saveProfile({ ...profile, activeCompanionIds: active });
    refreshStats();
  };

  return (
    <>
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero card */}
      <div style={s.heroCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 12 }}>
          <button
            style={{ ...s.avatar, cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowAvatarPicker(true)}
            title="Change avatar"
          >
            {currentAvatar.icon}
            <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 11, background: 'var(--primary)', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>✎</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {onShop && unlocks.shop && (
              <button style={{ background: 'var(--surface-hi)', border: '1px solid var(--gold)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--gold)', fontWeight: 700 }} onClick={onShop}>
                🏪 Shop
              </button>
            )}
            <button style={{ background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 }} onClick={onSettings}>
              ⚙️ Settings
            </button>
          </div>
        </div>
        {editingName ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
            <input
              autoFocus
              style={{ background: 'var(--surface-hi)', border: '2px solid var(--primary)', borderRadius: 10, padding: '6px 12px', color: 'var(--text)', fontSize: 20, fontWeight: 700, textAlign: 'center', outline: 'none', maxWidth: 200 }}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
              maxLength={30}
            />
            <button style={{ background: 'var(--success)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 13 }} onClick={handleSaveName}>Save</button>
            <button style={{ background: 'var(--surface-hi)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-muted)', fontSize: 13 }} onClick={() => setEditingName(false)}>✕</button>
          </div>
        ) : (
          <button
            style={{ fontSize: 24, fontWeight: 800, background: 'transparent', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => { setNameInput(profile.name); setEditingName(true); }}
            title="Tap to edit name"
          >
            {profile.name}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>✎</span>
          </button>
        )}
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
          ['🪙', 'Gold', profile.gold.toLocaleString(), 'var(--gold)'],
          ['💎', 'Gems', profile.gems, 'var(--info)'],
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

      {/* Weekly XP chart */}
      {sessionHistory.length > 0 && <WeeklyXPChart sessions={sessionHistory} />}

      {/* Recent sessions */}
      {sessionHistory.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Recent Sessions · last {sessionHistory.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sessionHistory.map((rec, i) => {
              const pct = Math.round(rec.summary.accuracy * 100);
              const accColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--gold)' : 'var(--error)';
              return (
                <div key={rec.id ?? i} style={{ background: 'var(--surface)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.date}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {rec.summary.cardsReviewed} cards · {rec.summary.newWordsLearned} new · {Math.max(1, Math.round(rec.summary.sessionDurationSec / 60))}m
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: accColor }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--gold)' }}>+{rec.summary.xpEarned} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {unlocks.categoryBreakdown && facade && <CategoryBreakdown srsMap={facade.srsMap} />}

      {/* Achievements */}
      {unlocks.achievements && <div>
        <div style={s.sectionTitle}>
          Achievements · {earnedAchievementIds.size}/{ACHIEVEMENTS.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...ACHIEVEMENTS].sort((a, b) => {
            const ae = earnedAchievementIds.has(a.id) ? 1 : 0;
            const be = earnedAchievementIds.has(b.id) ? 1 : 0;
            if (ae !== be) return be - ae; // earned first
            const ap = !ae && a.progress ? a.progress(profile, stats)?.[0] ?? 0 : 0;
            const bp = !be && b.progress ? b.progress(profile, stats)?.[0] ?? 0 : 0;
            return bp - ap; // higher progress first within unearned
          }).map(a => {
            const earned = earnedAchievementIds.has(a.id);
            const prog = !earned && a.progress ? a.progress(profile, stats) : null;
            const progPct = prog ? Math.round((prog[0] / prog[1]) * 100) : 0;
            const rarityColor = RARITY_COLOR[a.rarity];
            return (
              <div key={a.id} style={{ background: 'var(--surface)', border: `1px solid ${earned ? rarityColor : prog && progPct > 0 ? 'var(--border)' : 'var(--border)'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: earned ? 1 : prog && progPct > 0 ? 0.75 : 0.4 }}>
                <span style={{ fontSize: 26, filter: earned ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: earned ? 'var(--text)' : 'var(--text-muted)' }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.description}</div>
                  {!earned && prog && progPct > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div className="progress-track" style={{ height: 3 }}>
                        <div className="progress-fill" style={{ width: `${progPct}%`, background: rarityColor, opacity: 0.7 }} />
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{prog[0].toLocaleString()} / {prog[1].toLocaleString()}</div>
                    </div>
                  )}
                </div>
                {earned
                  ? <span style={{ fontSize: 14, color: rarityColor }}>✓</span>
                  : <span style={{ fontSize: 10, fontWeight: 700, color: rarityColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.rarity}</span>
                }
              </div>
            );
          })}
        </div>
      </div>}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={s.sectionTitle as React.CSSProperties}>Companions · {profile.collectedCompanionIds.length} collected</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile.activeCompanionIds.length}/3 active</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Tap a companion to activate / deactivate</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.collectedCompanionIds.map((cid: string) => {
              const spirit = SPIRIT_COMPANIONS.find(x => x.id === cid);
              const icon = COMPANION_ICON[cid] ?? '🐾';
              const name = spirit ? `${spirit.nameEnglish} (${spirit.nameThai})` : cid;
              const desc = spirit ? spirit.description : 'Mysterious companion';
              const isActive = profile.activeCompanionIds.includes(cid);
              const rarity = spirit?.rarity ?? 'common';
              const canActivate = !isActive && profile.activeCompanionIds.length < 3;
              return (
                <button
                  key={cid}
                  style={{ background: isActive ? 'rgba(99,102,241,0.08)' : 'var(--surface)', border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', opacity: (!isActive && !canActivate) ? 0.5 : 1, cursor: isActive || canActivate ? 'pointer' : 'default' }}
                  onClick={() => (isActive || canActivate) && toggleCompanion(cid)}
                  disabled={!isActive && !canActivate}
                >
                  <span style={{ fontSize: 32 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: isActive ? 'var(--primary)' : 'var(--text)' }}>{name}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: RARITY_COLOR[rarity], background: `${RARITY_COLOR[rarity]}22`, borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase' }}>{rarity}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, background: isActive ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive && <span style={{ fontSize: 10, color: '#fff', fontWeight: 800 }}>✓</span>}
                    </div>
                    {isActive && <span style={{ fontSize: 9, color: 'var(--primary)', fontWeight: 800 }}>ON</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ paddingBottom: 20 }} />
    </div>

    {/* Avatar picker modal */}

    {showAvatarPicker && (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={() => setShowAvatarPicker(false)}
      >
        <div
          style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', width: '100%', maxWidth: 480 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, textAlign: 'center' }}>Choose Avatar</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {AVATARS.map(av => (
              <button
                key={av.id}
                onClick={async () => {
                  if (!facade || !profile) return;
                  await facade.saveProfile({ ...profile, avatarId: av.id });
                  refreshStats();
                  setShowAvatarPicker(false);
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: profile.avatarId === av.id ? 'var(--primary)' : 'var(--surface-hi)',
                  border: `2px solid ${profile.avatarId === av.id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 14, padding: '12px 8px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 28 }}>{av.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: profile.avatarId === av.id ? '#fff' : 'var(--text-muted)' }}>{av.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
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

function CategoryBreakdown({ srsMap }: { srsMap: Map<string, { interval: number; correctReviews: number; totalReviews: number }> }) {
  const stats = useMemo(() => {
    const map: Record<string, { total: number; seen: number; correct: number; reviews: number }> = {};
    for (const card of VOCABULARY) {
      if (!map[card.category]) map[card.category] = { total: 0, seen: 0, correct: 0, reviews: 0 };
      map[card.category].total++;
      const s = srsMap.get(card.id);
      if (s) {
        map[card.category].seen++;
        map[card.category].correct += s.correctReviews ?? 0;
        map[card.category].reviews += s.totalReviews ?? 0;
      }
    }
    return Object.entries(map)
      .filter(([, v]) => v.seen > 0)
      .sort((a, b) => {
        const accA = a[1].reviews > 0 ? a[1].correct / a[1].reviews : 0;
        const accB = b[1].reviews > 0 ? b[1].correct / b[1].reviews : 0;
        return accB - accA;
      });
  }, [srsMap]);

  if (stats.length === 0) return null;

  return (
    <div>
      <div style={s.sectionTitle}>Category Performance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stats.map(([cat, v]) => {
          const acc = v.reviews > 0 ? Math.round((v.correct / v.reviews) * 100) : 0;
          const accColor = acc >= 80 ? 'var(--success)' : acc >= 60 ? 'var(--gold)' : 'var(--warning)';
          return (
            <div key={cat} style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accColor }}>{acc}% acc</span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${acc}%`, background: accColor }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{v.seen}/{v.total} seen · {v.reviews} reviews</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyXPChart({ sessions }: { sessions: Array<{ date: string; summary: { xpEarned: number } }> }) {
  const days = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bars = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const xp = sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.summary.xpEarned, 0);
    const label = i === days - 1 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' });
    return { label, xp, isToday: i === days - 1 };
  });

  const totalWeekXP = bars.reduce((s, b) => s + b.xp, 0);
  const maxXP = Math.max(1, ...bars.map(b => b.xp));
  if (totalWeekXP === 0) return null;

  return (
    <div>
      <div style={s.sectionTitle}>This Week · {totalWeekXP.toLocaleString()} XP</div>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 16px 12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
          {bars.map(({ label, xp, isToday }) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {xp > 0 && <span style={{ fontSize: 9, color: isToday ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 700 }}>{xp}</span>}
              <div style={{ width: '100%', height: Math.max(3, (xp / maxXP) * 44), background: isToday ? 'var(--gold)' : xp > 0 ? 'var(--primary)' : 'var(--border)', borderRadius: 3 }} />
              <span style={{ fontSize: 9, color: isToday ? 'var(--gold)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>{label}</span>
            </div>
          ))}
        </div>
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
