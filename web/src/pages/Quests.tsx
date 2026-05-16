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
      <div style={{ fontSize: 26, fontWeight: 800 }}>Quest Board</div>

      {ORDER.filter(r => profile.unlockedRegions.includes(r)).map(r => {
        const entries = boards[r] ?? [];
        const cfg = REGIONS[r];
        const color = REGION_COLOR[r];
        const done = entries.filter(e => e.status === 'completed').length;
        return (
          <div key={r}>
            <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{cfg.nameThai}</div>
                <div style={{ fontSize: 12, color, fontWeight: 600 }}>{cfg.nameEnglish}</div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>{done}/{entries.length}</div>
            </div>
            {entries.map(e => (
              <QuestRow key={e.quest.id} entry={e} color={color} isOpen={open === e.quest.id} toggle={() => setOpen(p => p === e.quest.id ? null : e.quest.id)} />
            ))}
          </div>
        );
      })}

      {ORDER.filter(r => !profile.unlockedRegions.includes(r)).slice(0, 3).map(r => (
        <div key={r} style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.45, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{REGIONS[r].nameEnglish}</div>
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

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 8, opacity: status === 'locked' ? 0.45 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: status !== 'locked' ? 'pointer' : 'default' }} onClick={status !== 'locked' ? toggle : undefined}>
        <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{quest.title}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, marginTop: 2, letterSpacing: 0.5 }}>
            {status.toUpperCase()}{quest.type === 'boss' ? ' • BOSS' : ''}
          </div>
        </div>
        {status === 'active' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>}
      </div>

      {status === 'active' && (
        <div style={{ marginTop: 10 }}>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, background: color }} />
          </div>
        </div>
      )}

      {isOpen && status === 'active' && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{quest.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{quest.flavorText}</div>
          {quest.objectives.map((obj, i) => {
            const cur = progress?.objectives[i]?.current ?? 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>{obj.description}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{cur}/{obj.count}</span>
                </div>
                <div className="progress-track" style={{ height: 3 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, (cur / obj.count) * 100)}%`, background: color }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 12, color: 'var(--gold)' }}>
            ✨ {quest.rewards.xp} XP{quest.rewards.gold ? `  🪙 ${quest.rewards.gold}` : ''}{quest.rewards.gems ? `  💎 ${quest.rewards.gems}` : ''}{quest.rewards.companionId ? '  🐾 Companion!' : ''}
          </div>
        </div>
      )}

      {status === 'completed' && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 8 }}>✨ {quest.rewards.xp} XP earned</div>}
    </div>
  );
}
