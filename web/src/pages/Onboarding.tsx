import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CHARACTERS } from '../data/characters';

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
    body: 'Our SRS engine shows you each word at exactly the right moment — just before you\'d forget it. Start with flashcards, then unlock 6 more study modes as your vocabulary grows.',
    cta: 'Next →',
    features: ['📖 Start with flashcards', '🔓 Unlock Quiz at 5 words', '🔓 More modes up to 35 words'],
  },
  {
    icon: '⚔️',
    title: 'Quests & Rewards',
    subtitle: 'Gamified learning',
    body: 'Complete quests to unlock new regions, earn XP and gold, collect spirit companions, and climb all the way to the Spirit Realm.',
    cta: 'Choose your guide →',
    features: ['🗺️ 7 regions to explore', '🏆 Achievements', '🔥 Daily streaks', '🎯 Daily challenges'],
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { createProfile } = useGame();
  const [step, setStep] = useState(0);
  const [selectedChar, setSelectedChar] = useState('byte');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isCharStep = step === STEPS.length;
  const isNameStep = step === STEPS.length + 1;

  const next = () => setStep(s => s + 1);

  const start = async () => {
    const n = name.trim();
    if (!n) { setErr('Enter your name to begin.'); return; }
    setBusy(true); setErr('');
    await createProfile(n, selectedChar);
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

      <div style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.97), rgba(14,7,38,0.95))', borderRadius: 20, padding: 24, border: '1px solid rgba(245,158,66,0.2)', boxShadow: '0 0 24px rgba(245,158,66,0.08), 0 4px 20px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
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

  if (isCharStep) {
    const selected = CHARACTERS.find(c => c.id === selectedChar) ?? CHARACTERS[0];
    return (
      <div style={s.root}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--primary)' }} />
          ))}
          <div style={{ width: 24, height: 8, borderRadius: 999, background: 'linear-gradient(90deg, var(--primary), var(--gold))', boxShadow: '0 0 8px rgba(245,158,66,0.5)' }} />
          <div style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--gold)', letterSpacing: -0.5, marginBottom: 4 }}>Choose Your Guide</div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>Each stray has a different specialty</div>
        </div>

        {/* Character grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1, alignContent: 'start' }}>
          {CHARACTERS.map(char => {
            const active = selectedChar === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.id)}
                style={{
                  background: active ? char.bgGradient : 'rgba(22,12,53,0.8)',
                  border: `2px solid ${active ? char.color : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 16, padding: '14px 12px',
                  textAlign: 'left',
                  boxShadow: active ? `0 0 20px ${char.glowColor}` : 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {active && <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${char.glowColor} 0%, transparent 70%)`, pointerEvents: 'none' }} />}
                <div style={{ fontSize: 32, marginBottom: 6, filter: active ? `drop-shadow(0 0 6px ${char.color})` : 'none' }}>{char.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: active ? char.color : 'var(--text)', letterSpacing: 0.5, marginBottom: 2 }}>{char.name}</div>
                <div style={{ fontSize: 10, color: active ? `${char.color}bb` : 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{char.role}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>{char.learnFocus}</div>
                {active && <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: char.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>✓</div>}
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        <div style={{ background: `linear-gradient(135deg, rgba(22,12,53,0.95), rgba(14,7,38,0.9))`, border: `1px solid ${selected.color}44`, borderRadius: 14, padding: '12px 16px', fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.5 }}>
          <span style={{ color: selected.color, fontWeight: 700 }}>{selected.name}:</span> {selected.description}
        </div>

        <button style={s.btn} onClick={next}>Continue as {selected.name} →</button>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div style={s.root}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 999, background: i === step ? 'linear-gradient(90deg, var(--primary), var(--gold))' : i < step ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s', boxShadow: i === step ? '0 0 8px rgba(245,158,66,0.5)' : 'none' }} />
        ))}
        <div style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }} />
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
              <div key={f} style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.94), rgba(14,7,38,0.9))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>{f}</div>
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
  title: { fontSize: 28, fontWeight: 900, color: 'var(--gold)', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: 'var(--text-sec)', marginTop: 4 },
  input: { background: 'rgba(22,12,53,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontSize: 15, outline: 'none', width: '100%' },
  btn: { background: 'linear-gradient(135deg, #D4801A 0%, #F59E42 45%, #FFB84D 80%, #F5C060 100%)', color: '#1A0800', borderRadius: 14, padding: '16px 0', fontWeight: 900, fontSize: 16, textAlign: 'center' as const, width: '100%', boxShadow: '0 6px 24px rgba(245,158,66,0.4)' },
};
