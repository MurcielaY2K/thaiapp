import React from 'react';
import { REGIONS, GameRegion } from '@engine/types';
import { VOCABULARY } from '@engine/data/vocabulary';
import { useGame } from '../context/GameContext';

const REGION_ORDER: GameRegion[] = [
  'krung_thon', 'paa_isaan', 'doi_nuea', 'talee_tong',
  'mueang_hin', 'wang_loi_faa', 'daen_winyaan',
];

const REGION_ICON: Record<GameRegion, string> = {
  krung_thon:   '⚓',
  paa_isaan:    '🌿',
  doi_nuea:     '🏔️',
  talee_tong:   '🌊',
  mueang_hin:   '🏛️',
  wang_loi_faa: '🏯',
  daen_winyaan: '👁️',
};

const REGION_COLOR: Record<GameRegion, string> = {
  krung_thon:   'var(--r-kt)',
  paa_isaan:    'var(--r-pi)',
  doi_nuea:     'var(--r-dn)',
  talee_tong:   'var(--r-tt)',
  mueang_hin:   'var(--r-mh)',
  wang_loi_faa: 'var(--r-wl)',
  daen_winyaan: 'var(--r-dw)',
};

const REGION_DIFFICULTY: Record<GameRegion, { label: string; stars: number }> = {
  krung_thon:   { label: 'Beginner',     stars: 1 },
  paa_isaan:    { label: 'Beginner+',    stars: 1 },
  doi_nuea:     { label: 'Intermediate', stars: 2 },
  talee_tong:   { label: 'Intermediate', stars: 2 },
  mueang_hin:   { label: 'Advanced',     stars: 3 },
  wang_loi_faa: { label: 'Advanced',     stars: 3 },
  daen_winyaan: { label: 'Expert',       stars: 4 },
};

export function WorldMap({ onStudyRegion }: { onStudyRegion?: (region: string) => void }) {
  const { profile, facade } = useGame();
  if (!profile) return null;

  const unlocked = new Set(profile.unlockedRegions);
  const srsMap = facade?.srsMap ?? new Map();

  // Pre-compute vocab counts per region
  const vocabByRegion = VOCABULARY.reduce((acc, c) => {
    if (!acc[c.region]) acc[c.region] = { total: 0, seen: 0 };
    acc[c.region].total++;
    if (srsMap.has(c.id)) acc[c.region].seen++;
    return acc;
  }, {} as Record<string, { total: number; seen: number }>);

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 3, letterSpacing: -0.5 }}>World Map</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>7 regions to explore · Level {profile.currentLevel}</div>

      {REGION_ORDER.map((region, idx) => {
        const cfg = REGIONS[region];
        const color = REGION_COLOR[region];
        const icon = REGION_ICON[region];
        const isUnlocked = unlocked.has(region);
        const isActive = profile.unlockedRegions[profile.unlockedRegions.length - 1] === region;

        // Quest progress
        const board = isUnlocked && facade ? facade.getQuestBoard(region) : null;
        const totalQuests = board?.length ?? cfg.questCount;
        const doneQuests  = board?.filter(e => e.status === 'completed').length ?? 0;
        const questPct    = totalQuests > 0 ? Math.round((doneQuests / totalQuests) * 100) : 0;

        return (
          <div key={region} style={{ display: 'flex', gap: 0 }}>
            {/* Timeline connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 14, flexShrink: 0 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: isUnlocked ? `${color}30` : 'rgba(22,12,53,0.6)',
                border: `2px solid ${isUnlocked ? color : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, filter: isUnlocked ? 'none' : 'grayscale(1)',
                boxShadow: isActive ? `0 0 0 3px ${color}44, 0 0 16px ${color}33` : isUnlocked ? `0 0 8px ${color}22` : 'none',
              }}>
                {isUnlocked ? icon : '🔒'}
              </div>
              {idx < REGION_ORDER.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: isUnlocked ? `${color}55` : 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              )}
            </div>

            {/* Card */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(22,12,53,0.94), rgba(14,7,38,0.9))',
              border: `1px solid ${isActive ? `${color}66` : 'rgba(255,255,255,0.07)'}`,
              borderTop: isActive ? `3px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 16, marginBottom: 12,
              opacity: isUnlocked ? 1 : 0.5,
              boxShadow: isActive
                ? `0 0 20px ${color}22, 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
                : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: isUnlocked ? 'var(--text)' : 'var(--text-muted)', letterSpacing: -0.2 }}>{cfg.nameThai}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color, marginTop: 2 }}>{cfg.nameEnglish}</div>
                </div>
                {isActive && (
                  <span style={{ fontSize: 9, fontWeight: 800, color, background: `${color}20`, border: `1px solid ${color}55`, borderRadius: 6, padding: '3px 8px', letterSpacing: 0.5 }}>CURRENT</span>
                )}
                {!isUnlocked && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px' }}>Lv {cfg.minLevelRequired}</span>
                )}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 10, lineHeight: 1.5 }}>{cfg.description}</div>

              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px' }}>📚 {cfg.cardCount} words</span>
                <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px' }}>⚔️ {cfg.questCount} quests</span>
                <span style={{ color: REGION_DIFFICULTY[region].stars >= 3 ? 'var(--warning)' : 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px' }}>
                  {'★'.repeat(REGION_DIFFICULTY[region].stars)}{'☆'.repeat(4 - REGION_DIFFICULTY[region].stars)} {REGION_DIFFICULTY[region].label}
                </span>
              </div>

              {isUnlocked && (() => {
                const vc = vocabByRegion[region] ?? { total: 0, seen: 0 };
                const vocabPct = vc.total > 0 ? Math.round((vc.seen / vc.total) * 100) : 0;
                return (
                  <div style={{ marginBottom: board ? 10 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Vocabulary</span><span style={{ fontWeight: 600 }}>{vc.seen}/{vc.total}</span>
                    </div>
                    <div className="progress-track" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${vocabPct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 6px ${color}66` }} />
                    </div>
                  </div>
                );
              })()}

              {isUnlocked && board && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, marginTop: 8 }}>
                    <span>Quests</span><span style={{ fontWeight: 600 }}>{doneQuests}/{totalQuests}</span>
                  </div>
                  <div className="progress-track" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${questPct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 6px ${color}66` }} />
                  </div>
                </>
              )}
              {isUnlocked && onStudyRegion && (
                <button
                  style={{
                    marginTop: 14, width: '100%',
                    background: `${color}18`,
                    border: `1px solid ${color}55`,
                    borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 700, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: `0 0 8px ${color}22`,
                  }}
                  onClick={() => onStudyRegion(region)}
                >
                  📖 Study {cfg.nameEnglish} Words
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ height: 8 }} />
    </div>
  );
}
