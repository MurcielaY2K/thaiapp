import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { createProfile } = useGame();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const start = async () => {
    const n = name.trim();
    if (!n) { setErr('Enter your name to begin.'); return; }
    setBusy(true); setErr('');
    await createProfile(n);
    onDone();
  };

  return (
    <div style={s.root}>
      <div style={s.hero}>
        <div style={s.flag}>🇹🇭</div>
        <div style={s.title}>ThaiQuest</div>
        <div style={s.sub}>Learn Thai through adventure</div>
      </div>

      <div style={s.card}>
        <div style={s.regionThai}>เมืองกรุงทอง</div>
        <div style={s.regionEn}>The Golden Port</div>
        <p style={s.lore}>
          Your journey begins at the bustling port city. The harbor master eyes you suspiciously.
          Prove yourself, traveler — one word at a time.
        </p>

        <label style={s.label}>Your name</label>
        <input
          style={s.input}
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && start()}
          placeholder="Enter your name..."
          maxLength={30}
          autoFocus
        />
        {err && <div style={s.err}>{err}</div>}

        <button style={{ ...s.btn, opacity: !name.trim() || busy ? 0.5 : 1 }} onClick={start} disabled={busy || !name.trim()}>
          {busy ? 'Starting…' : 'Begin Journey →'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, gap: 32, overflowY: 'auto', minHeight: '100%' },
  hero: { textAlign: 'center' },
  flag: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 800, color: 'var(--gold)', letterSpacing: 1 },
  sub: { fontSize: 15, color: 'var(--text-sec)', marginTop: 4 },
  card: { background: 'var(--surface)', borderRadius: 20, padding: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 },
  regionThai: { fontSize: 26, fontWeight: 700, color: 'var(--gold)', textAlign: 'center' },
  regionEn: { fontSize: 14, color: 'var(--text-sec)', textAlign: 'center', marginBottom: 4 },
  lore: { fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 },
  label: { fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 },
  input: { background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', width: '100%' },
  err: { fontSize: 13, color: 'var(--error)' },
  btn: { background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: '14px 0', fontWeight: 700, fontSize: 15, textAlign: 'center', marginTop: 4 },
};
