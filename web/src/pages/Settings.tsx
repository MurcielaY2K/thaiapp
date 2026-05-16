import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { VOCABULARY_STATS } from '@engine/data/vocabulary';

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
          <div style={s.sectionTitle}>About ThaiQuest</div>
          <InfoRow label="Version" value="1.0 · 7 regions" />
          <InfoRow label="Algorithm" value="SRS · SM-2 spaced repetition" />
          <InfoRow label="Total vocabulary" value={`${VOCABULARY_STATS.total} words`} />
          <InfoRow label="With cultural notes" value={`${VOCABULARY_STATS.withCulturalNotes} cards`} />
        </div>

        {/* Thai Grammar Quick Reference */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Thai Grammar Quick Reference</div>
          {[
            { pattern: 'ผม / ฉัน + verb', english: 'I + verb (first person)', note: 'ผม (phom) = male, ฉัน (chan) = female/neutral' },
            { pattern: 'SVO word order', english: 'Subject → Verb → Object', note: 'Thai follows the same basic order as English' },
            { pattern: 'verb + ไม่', english: 'Negation: "do not"', note: 'ไม่ (mai) before verb negates it: ไม่กิน = don\'t eat' },
            { pattern: 'verb + ไหม / ใช่ไหม', english: 'Yes/no question', note: 'Add ไหม (mai) at end of statement to make a question' },
            { pattern: 'มาก / เล็กน้อย', english: 'Very / a little', note: 'Post-verbal modifiers: กินมาก = eat a lot' },
            { pattern: 'กำลัง + verb', english: 'Currently doing (progressive)', note: 'กำลังกิน = currently eating / is eating' },
            { pattern: 'จะ + verb', english: 'Will / going to (future)', note: 'จะไป = will go / going to go' },
            { pattern: 'เคย + verb', english: 'Have ever done (experiential)', note: 'เคยไป = have been to / ever went' },
          ].map(({ pattern, english, note }) => (
            <div key={pattern} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{pattern}</span>
                <span style={{ fontSize: 12, color: 'var(--text-sec)', flexShrink: 0 }}>{english}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{note}</div>
            </div>
          ))}
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

        {/* Essential phrases */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Essential Phrases</div>
          {[
            { thai: 'สวัสดี', roman: 'sa-wat-dii', eng: 'Hello / Goodbye' },
            { thai: 'ขอบคุณ', roman: 'khob-khun', eng: 'Thank you' },
            { thai: 'ไม่เป็นไร', roman: 'mai pen rai', eng: 'No problem / Never mind' },
            { thai: 'ไม่เข้าใจ', roman: 'mai khao-jai', eng: 'I don\'t understand' },
            { thai: 'พูดช้าๆ ได้ไหม', roman: 'phut chaa chaa dai mai', eng: 'Can you speak slowly?' },
            { thai: 'เท่าไหร่', roman: 'thao-rai', eng: 'How much?' },
            { thai: 'อยู่ที่ไหน', roman: 'yuu thi-nai', eng: 'Where is it?' },
            { thai: 'ชื่ออะไร', roman: 'chue a-rai', eng: 'What is your name?' },
          ].map(({ thai, roman, eng }) => (
            <div key={thai} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{thai}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{roman}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', textAlign: 'right' }}>{eng}</div>
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
