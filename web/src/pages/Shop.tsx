import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SPIRIT_COMPANIONS } from '@engine/engine/gameEngine';
import { sfx } from '../utils/audio';

interface ShopItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  currency: 'gold' | 'gems';
  price: number;
  badge?: string;
  badgeColor?: string;
  action: (profile: import('@engine/types').UserProfile) => import('@engine/types').UserProfile | null;
  canBuy: (profile: import('@engine/types').UserProfile) => boolean;
  owned?: (profile: import('@engine/types').UserProfile) => boolean;
}

const COMPANIONS_FOR_SALE = ['phi_krasue', 'nang_tani', 'phi_lok'] as const;

const ITEMS: ShopItem[] = [
  // ── Streak protection ─────────────────────────────────────────────────────
  {
    id: 'shield_1',
    icon: '🛡️',
    title: 'Streak Shield',
    description: 'Protects your streak for one missed day. Auto-consumed when you skip a day.',
    currency: 'gold',
    price: 200,
    canBuy: (p) => p.gold >= 200 && p.streakShields < 5,
    action: (p) => p.gold >= 200 && p.streakShields < 5
      ? { ...p, gold: p.gold - 200, streakShields: p.streakShields + 1 }
      : null,
  },
  {
    id: 'shield_3',
    icon: '🛡️',
    title: 'Triple Shield Pack',
    description: 'Three streak shields for the price of two and a half. Stay protected all week.',
    currency: 'gold',
    price: 500,
    badge: 'SAVE 100',
    badgeColor: 'var(--success)',
    canBuy: (p) => p.gold >= 500 && p.streakShields <= 2,
    action: (p) => {
      const add = Math.min(3, 5 - p.streakShields);
      return p.gold >= 500 && add > 0 ? { ...p, gold: p.gold - 500, streakShields: p.streakShields + add } : null;
    },
  },

  // ── Gold pouches (gems → gold) ─────────────────────────────────────────────
  {
    id: 'gold_sm',
    icon: '🪙',
    title: 'Coin Pouch',
    description: 'A modest bag of gold coins to keep your wallet healthy.',
    currency: 'gems',
    price: 5,
    canBuy: (p) => p.gems >= 5,
    action: (p) => p.gems >= 5 ? { ...p, gems: p.gems - 5, gold: p.gold + 300 } : null,
  },
  {
    id: 'gold_lg',
    icon: '💰',
    title: 'Gold Chest',
    description: 'A hefty chest of gold — the wise scholar\'s investment.',
    currency: 'gems',
    price: 10,
    badge: 'BEST VALUE',
    badgeColor: 'var(--gold)',
    canBuy: (p) => p.gems >= 10,
    action: (p) => p.gems >= 10 ? { ...p, gems: p.gems - 10, gold: p.gold + 700 } : null,
  },

  // ── Spirit companions (common) ─────────────────────────────────────────────
  ...COMPANIONS_FOR_SALE.map((cid): ShopItem => {
    const c = SPIRIT_COMPANIONS.find(x => x.id === cid)!;
    return {
      id: `companion_${cid}`,
      icon: cid === 'phi_krasue' ? '👻' : cid === 'nang_tani' ? '🌿' : '👁️',
      title: `${c.nameEnglish} (${c.nameThai})`,
      description: `${c.folktaleOrigin} Bonus: ${c.description}`,
      currency: 'gold',
      price: 1000,
      badge: c.rarity.toUpperCase(),
      badgeColor: 'var(--info)',
      owned: (p) => p.collectedCompanionIds.includes(cid),
      canBuy: (p) => p.gold >= 1000 && !p.collectedCompanionIds.includes(cid),
      action: (p) => {
        if (p.gold < 1000 || p.collectedCompanionIds.includes(cid)) return null;
        const collected = [...p.collectedCompanionIds, cid];
        const active = p.activeCompanionIds.length < 3
          ? [...p.activeCompanionIds, cid]
          : p.activeCompanionIds;
        return { ...p, gold: p.gold - 1000, collectedCompanionIds: collected, activeCompanionIds: active };
      },
    };
  }),
];

export function Shop({ onBack }: { onBack: () => void }) {
  const { profile, facade, refreshStats } = useGame();
  const [toast, setToast] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  if (!profile || !facade) return null;

  async function handleBuy(item: ShopItem) {
    if (!profile || !facade || buying) return;
    setBuying(item.id);
    const updated = item.action(profile);
    if (!updated) {
      setBuying(null);
      return;
    }
    await facade.saveProfile(updated);
    refreshStats();
    sfx.correct();
    setToast(item.currency === 'gold'
      ? `Purchased! −${item.price} 🪙`
      : `Purchased! −${item.price} 💎`
    );
    setTimeout(() => setToast(null), 2000);
    setBuying(null);
  }

  const sections = [
    {
      title: '🛡️ Streak Protection',
      items: ITEMS.filter(i => i.id.startsWith('shield')),
    },
    {
      title: '💎 Premium Exchange',
      items: ITEMS.filter(i => i.id.startsWith('gold')),
    },
    {
      title: '👻 Spirit Companions',
      subtitle: 'Common companions — rarer ones unlock through quests',
      items: ITEMS.filter(i => i.id.startsWith('companion')),
    },
  ];

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.back} onClick={onBack}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Spirit Bazaar</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Spend your hard-earned gold &amp; gems</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <CurrencyChip icon="🪙" amount={profile.gold} color="var(--gold)" />
          <CurrencyChip icon="💎" amount={profile.gems} color="var(--info)" />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: '#fff', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="scroll" style={{ flex: 1, padding: '0 16px 32px' }}>
        {/* Shields callout */}
        {profile.streakShields > 0 && (
          <div style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid var(--info)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>You have {profile.streakShields} streak {profile.streakShields === 1 ? 'shield' : 'shields'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>They auto-activate when you miss a day</div>
            </div>
          </div>
        )}

        {sections.map(sec => (
          <div key={sec.title} style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{sec.title}</div>
            {sec.subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{sec.subtitle}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.items.map(item => {
                const isOwned = item.owned?.(profile) ?? false;
                const canBuy = item.canBuy(profile) && !buying;
                const isBuying = buying === item.id;
                return (
                  <div key={item.id} style={{ background: 'var(--surface)', border: `1px solid ${isOwned ? 'var(--success)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: isOwned ? 0.75 : 1 }}>
                    <span style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</span>
                        {item.badge && <span style={{ fontSize: 9, fontWeight: 800, color: item.badgeColor, background: `${item.badgeColor}22`, borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase' }}>{item.badge}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.description}</div>
                    </div>
                    {isOwned
                      ? <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>✓ Owned</span>
                      : (
                        <button
                          style={{ background: canBuy ? (item.currency === 'gold' ? 'var(--gold)' : 'var(--info)') : 'var(--surface-hi)', color: canBuy ? '#fff' : 'var(--text-muted)', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, flexShrink: 0, border: canBuy ? 'none' : '1px solid var(--border)', minWidth: 80, opacity: isBuying ? 0.6 : 1 }}
                          disabled={!canBuy || isBuying}
                          onClick={() => handleBuy(item)}
                        >
                          {isBuying ? '…' : `${item.price} ${item.currency === 'gold' ? '🪙' : '💎'}`}
                        </button>
                      )
                    }
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Earn gold by completing study sessions and quests.<br />
          Gems are awarded from rare quest completions.
        </div>
      </div>
    </div>
  );
}

function CurrencyChip({ icon, amount, color }: { icon: string; amount: number; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${color}`, borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 13, color }}>{amount.toLocaleString()}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  back: { width: 36, height: 36, borderRadius: 999, background: 'var(--surface)', color: 'var(--text)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
