import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function Settings({ onBack }: { onBack: () => void }) {
  const { resetProgress } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = async () => {
    await resetProgress();
    setConfirmReset(false);
    onBack();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-hi)', color: 'var(--text-sec)', fontSize: 18 }} onClick={onBack}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Settings</span>
      </div>

      <div className="scroll" style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* App info */}
        <div style={s.section}>
          <div style={s.sectionTitle}>About</div>
          <InfoRow label="App" value="ThaiQuest" />
          <InfoRow label="Engine" value="SRS · SM-2 algorithm" />
          <InfoRow label="Vocabulary" value="Regions 1–3 available" />
        </div>

        {/* How to use */}
        <div style={s.section}>
          <div style={s.sectionTitle}>How To Learn</div>
          {[
            { icon: '📖', title: 'Study daily', desc: 'Review flashcards every day to build long-term memory. The SRS schedules cards at optimal intervals.' },
            { icon: '🧠', title: 'Quiz yourself', desc: 'Multiple choice, typing, and tone trainer sessions help test what you know without affecting SRS.' },
            { icon: '🔤', title: 'Sentence builder', desc: 'Arrange romanized words into correct sentence order to practice grammar patterns.' },
            { icon: '📚', title: 'Browse vocab', desc: 'Use the vocabulary browser to look up any word and study its cultural context.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Thai tones reference */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Thai Tone Reference</div>
          {[
            { tone: 'Mid',     color: '#9E9E9E', desc: 'Flat, normal speaking pitch' },
            { tone: 'Low',     color: '#5B9FD4', desc: 'Below normal, steady and low' },
            { tone: 'Falling', color: '#E85D3A', desc: 'Starts high, falls sharply' },
            { tone: 'High',    color: '#F5C542', desc: 'Above normal, slightly rising' },
            { tone: 'Rising',  color: '#6BBF6E', desc: 'Starts low, rises like a question' },
          ].map(({ tone, color, desc }) => (
            <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 28, borderRadius: 4, background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color }}>{tone}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Data */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Data</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            All progress is stored locally in your browser. Clearing browser data or using a different device will not carry over your progress.
          </div>
          {!confirmReset ? (
            <button style={s.dangerBtn} onClick={() => setConfirmReset(true)}>
              Reset All Progress
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--error)', lineHeight: 1.5 }}>
                This will permanently delete all your progress, XP, and vocabulary history. This cannot be undone.
              </div>
              <button style={{ ...s.dangerBtn, background: 'var(--error)', color: '#fff' }} onClick={handleReset}>
                Yes, Reset Everything
              </button>
              <button style={s.cancelBtn} onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 14, color: 'var(--text-sec)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  section: { background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  dangerBtn: { background: 'transparent', border: '1px solid var(--error)', borderRadius: 12, padding: 14, color: 'var(--error)', fontWeight: 600, fontSize: 14, textAlign: 'center' },
  cancelBtn: { background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, color: 'var(--text-sec)', fontWeight: 600, fontSize: 14 },
};
