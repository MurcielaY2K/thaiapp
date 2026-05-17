import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { QuestBoardEntry } from '@engine/GameFacade';
import { GameRegion, REGIONS } from '@engine/types';

const ORDER: GameRegion[] = ['krung_thon', 'paa_isaan', 'doi_nuea', 'talee_tong', 'mueang_hin', 'wang_loi_faa', 'daen_winyaan'];
const SORT: Record<string, number> = { active: 0, available: 1, completed: 2, locked: 3 };
const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

export function Quests() {
  const { facade, profile, refreshStats } = useGame();
  const [boards, setBoards] = useState<Partial<Record<GameRegion, QuestBoardEntry[]>>>({});
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!facade || !profile) return;
    refreshStats();
    const next: Partial<Record<GameRegion, QuestBoardEntry[]>> = {};
    for (const r of profile.unlockedRegions) {
      next[r] = facade.getQuestBoard(r).sort((a, b) => SORT[a.status] - SORT[b.status]);
    }
    setBoards(next);
  }, []);

  if (!profile) return null;

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>Quest Board</div>

      {ORDER.filter(r => profile.unlockedRegions.includes(r)).map(r => {
        const entries = boards[r] ?? [];
        const cfg = REGIONS[r];
        const color = REGION_COLOR[r];
        const done = entries.filter(e => e.status === 'completed').length;
        const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
        return (
          <div key={r}>
            <div style={{
              background: `${color}10`,
              border: `1px solid ${color}33`,
              borderLeft: `4px solid ${color}`,
              borderRadius: '0 12px 12px 0',
              paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.2 }}>{cfg.nameThai}</div>
                <div style={{ fontSize: 12, color, fontWeight: 700, marginTop: 1 }}>{cfg.nameEnglish}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color, fontSize: 15, fontWeight: 800 }}>{done}/{entries.length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{pct}% done</div>
              </div>
            </div>
            {entries.map(e => (
              <QuestRow key={e.quest.id} entry={e} color={color} isOpen={open === e.quest.id} toggle={() => setOpen(p => p === e.quest.id ? null : e.quest.id)} />
            ))}
          </div>
        );
      })}

      {ORDER.filter(r => !profile.unlockedRegions.includes(r)).slice(0, 3).map(r => (
        <div key={r} style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.8), rgba(14,7,38,0.7))', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.45, border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{REGIONS[r].nameEnglish}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Level {REGIONS[r].minLevelRequired} required</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestRow({ entry, color, isOpen, toggle }: { entry: QuestBoardEntry; color: string; isOpen: boolean; toggle: () => void }) {
  const { quest, status, progress, progressPercent } = entry;
  const icon = status === 'completed' ? '✅' : status === 'active' ? '⚔️' : status === 'available' ? '📜' : '🔒';
  const statusColor = status === 'completed' ? 'var(--success)' : status === 'active' ? color : status === 'available' ? 'var(--text-sec)' : 'var(--text-muted)';
  const expandable = status === 'active' || status === 'available';

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22,12,53,0.94), rgba(14,7,38,0.9))',
      borderRadius: 14, padding: 14,
      border: `1px solid ${status === 'active' ? `${color}55` : 'rgba(255,255,255,0.07)'}`,
      borderTop: status === 'active' ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
      marginBottom: 8, opacity: status === 'locked' ? 0.4 : 1,
      boxShadow: status === 'active' ? `0 0 12px ${color}22, 0 2px 8px rgba(0,0,0,0.3)` : '0 2px 6px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: expandable ? 'pointer' : 'default' }} onClick={expandable ? toggle : undefined}>
        <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{quest.title}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, marginTop: 2, letterSpacing: 0.5 }}>
            {status.toUpperCase()}{quest.type === 'boss' ? ' • BOSS' : ''}
          </div>
        </div>
        {expandable && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>}
      </div>

      {status === 'active' && (
        <div style={{ marginTop: 10 }}>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, background: color }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{progressPercent}% complete</div>
        </div>
      )}

      {isOpen && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{quest.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{quest.flavorText}</div>
          {quest.objectives.map((obj, i) => {
            const cur = progress?.objectives[i]?.current ?? 0;
            const pct = Math.min(100, (cur / obj.count) * 100);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>{obj.description}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: status === 'available' ? 'var(--text-muted)' : color }}>{status === 'available' ? `0/${obj.count}` : `${cur}/${obj.count}`}</span>
                </div>
                <div className="progress-track" style={{ height: 3 }}>
                  <div className="progress-fill" style={{ width: `${status === 'available' ? 0 : pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>✨ {quest.rewards.xp} XP</span>
            {quest.rewards.gold ? <span style={{ color: 'var(--gold)' }}>🪙 {quest.rewards.gold}</span> : null}
            {quest.rewards.gems ? <span style={{ color: 'var(--info)' }}>💎 {quest.rewards.gems}</span> : null}
            {quest.rewards.companionId ? <span style={{ color: 'var(--primary)' }}>🐾 Companion Unlocked!</span> : null}
          </div>
        </div>
      )}

      {status === 'completed' && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 8 }}>✨ {quest.rewards.xp} XP earned</div>}
    </div>
  );
}
