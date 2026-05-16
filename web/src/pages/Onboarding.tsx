import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const STEPS = [
  {
    icon: '🇹🇭',
    title: 'Welcome to ThaiQuest',
    subtitle: 'Learn Thai through adventure',
    body: 'Master the Thai language by exploring 7 mystical regions, each filled with new vocabulary, quests, and challenges.',
    cta: 'Let\'s go →',
  },
  {
    icon: '🧠',
    title: 'Smart Spaced Repetition',
    subtitle: 'The science of memory',
    body: 'Our SRS engine shows you each word at exactly the right moment — just before you\'d forget it. Study 15 minutes a day and words stick for life.',
    cta: 'Next →',
    features: ['📖 Flashcard review', '🧠 6 quiz modes', '🃏 Memory match', '🎵 Tone trainer', '🔤 Sentence builder', '🔡 Thai alphabet'],
  },
  {
    icon: '⚔️',
    title: 'Quests & Rewards',
    subtitle: 'Gamified learning',
    body: 'Complete quests to unlock new regions, earn XP and gold, collect spirit companions, and climb all the way to the Spirit Realm.',
    cta: 'Next →',
    features: ['🗺️ 7 regions to explore', '🏆 Achievements', '🔥 Daily streaks', '🎯 Daily challenges'],
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { createProfile } = useGame();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isNameStep = step === STEPS.length;

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else setStep(STEPS.length);
  };

  const start = async () => {
    const n = name.trim();
    if (!n) { setErr('Enter your name to begin.'); return; }
    setBusy(true); setErr('');
    await createProfile(n);
    onDone();
  };

  if (isNameStep) return (
    <div style={s.root}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 52 }}>🗺️</div>
        <div style={s.title}>Begin Your Journey</div>
        <div style={s.sub}>เมืองกรุงทอง — The Golden Port</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', marginTop: 8 }}>
          The harbor master eyes you suspiciously. "Can you speak Thai? Prove yourself, traveler."
        </p>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 }}>Your traveler name</label>
        <input
          style={s.input}
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && start()}
          placeholder="Enter your name…"
          maxLength={30}
          autoFocus
        />
        {err && <div style={{ fontSize: 13, color: 'var(--error)' }}>{err}</div>}
        <button style={{ ...s.btn, opacity: !name.trim() || busy ? 0.5 : 1 }} onClick={start} disabled={busy || !name.trim()}>
          {busy ? 'Starting…' : 'Begin Journey →'}
        </button>
      </div>

      <button style={{ fontSize: 13, color: 'var(--text-muted)', background: 'transparent' }} onClick={() => setStep(step - 1)}>← Back</button>
    </div>
  );

  const current = STEPS[step];

  return (
    <div style={s.root}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 999, background: i === step ? 'var(--primary)' : i < step ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s' }} />
        ))}
        <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--border)' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{current.icon}</div>
          <div style={s.title}>{current.title}</div>
          <div style={s.sub}>{current.subtitle}</div>
          <p style={{ fontSize: 14, color: 'var(--text-sec)', lineHeight: 1.7, marginTop: 12 }}>{current.body}</p>
        </div>

        {current.features && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {current.features.map(f => (
              <div key={f} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>{f}</div>
            ))}
          </div>
        )}
      </div>

      <button style={s.btn} onClick={next}>{current.cta}</button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', padding: 28, gap: 24, overflowY: 'auto', minHeight: '100%', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: 800, color: 'var(--gold)' },
  sub: { fontSize: 14, color: 'var(--text-sec)', marginTop: 4 },
  input: { background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', width: '100%' },
  btn: { background: 'var(--primary)', color: '#fff', borderRadius: 14, padding: '16px 0', fontWeight: 700, fontSize: 16, textAlign: 'center', width: '100%' },
};
