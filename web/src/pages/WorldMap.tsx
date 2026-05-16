import React from 'react';
import { REGIONS, GameRegion } from '@engine/types';
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

export function WorldMap() {
  const { profile, facade } = useGame();
  if (!profile) return null;

  const unlocked = new Set(profile.unlockedRegions);

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>World Map</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>7 regions to explore · Level {profile.currentLevel}</div>

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16, flexShrink: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: isUnlocked ? color : 'var(--surface)',
                border: `3px solid ${isUnlocked ? color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, filter: isUnlocked ? 'none' : 'grayscale(1)',
                boxShadow: isActive ? `0 0 0 4px ${color}44` : 'none',
              }}>
                {isUnlocked ? icon : '🔒'}
              </div>
              {idx < REGION_ORDER.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: isUnlocked ? `${color}66` : 'var(--border)', margin: '4px 0' }} />
              )}
            </div>

            {/* Card */}
            <div style={{
              flex: 1, background: 'var(--surface)', border: `1px solid ${isActive ? color : 'var(--border)'}`,
              borderRadius: 16, padding: 16, marginBottom: 12,
              opacity: isUnlocked ? 1 : 0.55,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: isUnlocked ? 'var(--text)' : 'var(--text-muted)' }}>{cfg.nameThai}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 2 }}>{cfg.nameEnglish}</div>
                </div>
                {isActive && <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}22`, borderRadius: 6, padding: '3px 8px' }}>CURRENT</span>}
                {!isUnlocked && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lv {cfg.minLevelRequired}</span>}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{cfg.description}</div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: isUnlocked ? 10 : 0 }}>
                <span>📚 {cfg.cardCount} words</span>
                <span>⚔️ {cfg.questCount} quests</span>
                <span>👹 {cfg.bossName}</span>
              </div>

              {isUnlocked && board && (
                <>
                  <div className="progress-track" style={{ height: 5, marginBottom: 4 }}>
                    <div className="progress-fill" style={{ width: `${questPct}%`, background: color }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {doneQuests}/{totalQuests} quests · {questPct}% complete
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ height: 8 }} />
    </div>
  );
}
