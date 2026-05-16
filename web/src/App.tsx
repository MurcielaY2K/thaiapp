import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Study } from './pages/Study';
import { Quiz } from './pages/Quiz';
import { ToneTrainer } from './pages/ToneTrainer';
import { SentenceBuilder } from './pages/SentenceBuilder';
import { SessionComplete } from './pages/SessionComplete';
import { Quests } from './pages/Quests';
import { Profile } from './pages/Profile';
import { VocabBrowser } from './pages/VocabBrowser';
import { Settings } from './pages/Settings';
import { TONE_COLORS } from '@engine/types';
import { SessionSummary } from '@engine/engine/sessionManager';

type Tab = 'home' | 'learn' | 'browse' | 'profile';
type View = 'onboarding' | 'main' | 'study' | 'quiz' | 'tone' | 'sentence' | 'session_complete' | 'settings';

interface CompleteState { summary: SessionSummary; xp: number; questIds: string[] }

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',    icon: '🏠', label: 'Home' },
  { id: 'learn',   icon: '🧠', label: 'Practice' },
  { id: 'browse',  icon: '📚', label: 'Vocab' },
  { id: 'profile', icon: '🧭', label: 'Profile' },
];

export function App() {
  const { isLoading, hasProfile, newAchievements, dismissNewAchievements } = useGame();
  const [view, setView] = useState<View>('main');
  const [tab, setTab] = useState<Tab>('home');
  const [complete, setComplete] = useState<CompleteState | null>(null);

  // Show achievement toast
  const [toastAchievement, setToastAchievement] = useState<{ icon: string; title: string } | null>(null);
  useEffect(() => {
    if (newAchievements.length > 0) {
      const a = newAchievements[0];
      setToastAchievement({ icon: a.icon, title: a.title });
      const t = setTimeout(() => { setToastAchievement(null); dismissNewAchievements(); }, 3500);
      return () => clearTimeout(t);
    }
  }, [newAchievements]);

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: 48, animation: 'scaleIn 0.5s ease infinite alternate' }}>🇹🇭</div>
    </div>
  );

  if (!hasProfile || view === 'onboarding') return <Onboarding onDone={() => setView('main')} />;
  if (view === 'settings') return <Settings onBack={() => setView('main')} />;
  if (view === 'study') return (
    <Study
      onComplete={(summary, xp, questIds) => { setComplete({ summary, xp, questIds }); setView('session_complete'); }}
      onExit={() => { setView('main'); setTab('home'); }}
    />
  );
  if (view === 'quiz')     return <Quiz         onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'tone')     return <ToneTrainer  onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'sentence') return <SentenceBuilder onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'session_complete' && complete) return (
    <SessionComplete
      summary={complete.summary} xpGained={complete.xp} completedQuestIds={complete.questIds}
      onHome={() => { setView('main'); setTab('home'); setComplete(null); }}
      onStudyAgain={() => { setComplete(null); setView('study'); }}
    />
  );

  return (
    <>
      {/* Achievement toast */}
      {toastAchievement && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease forwards', maxWidth: 320 }}>
          <span style={{ fontSize: 28 }}>{toastAchievement.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievement Unlocked!</div>
            <div style={{ fontWeight: 700 }}>{toastAchievement.title}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'home'    && <Home onStudy={() => setView('study')} onQuiz={() => setView('quiz')} />}
        {tab === 'learn'   && <LearnTab onStudy={() => setView('study')} onQuiz={() => setView('quiz')} onTone={() => setView('tone')} onSentence={() => setView('sentence')} />}
        {tab === 'browse'  && <VocabBrowser />}
        {tab === 'profile' && <Profile onSettings={() => setView('settings')} />}
      </div>

      <nav className="bottom-nav">
        {TABS.map(({ id, icon, label }) => (
          <button key={id} className={`nav-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            <span className="icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}

function LearnTab({ onStudy, onQuiz, onTone, onSentence }: { onStudy: () => void; onQuiz: () => void; onTone: () => void; onSentence: () => void }) {
  const activities = [
    {
      icon: '📖', title: 'Flashcard Study', desc: 'SRS-based review — the best way to build long-term memory', color: 'var(--primary)', badge: '',
      onClick: onStudy,
    },
    {
      icon: '🧠', title: 'Multiple Choice Quiz', desc: 'Thai→English, English→Thai, or Pronunciation', color: 'var(--info)', badge: '5 modes',
      onClick: onQuiz,
    },
    {
      icon: '🎵', title: 'Tone Trainer', desc: 'Identify the 5 Thai tones — mid, low, falling, high, rising', color: '#6BBF6E', badge: '',
      onClick: onTone,
    },
    {
      icon: '🔤', title: 'Sentence Builder', desc: 'Arrange romanized words into correct sentence order', color: 'var(--gold)', badge: '',
      onClick: onSentence,
    },
  ];

  const toneRef = [
    { tone: 'Mid',     color: TONE_COLORS.mid,     contour: '━━━━' },
    { tone: 'Low',     color: TONE_COLORS.low,     contour: '▁▁▁▁' },
    { tone: 'Falling', color: TONE_COLORS.falling,  contour: '◥▁▁▁' },
    { tone: 'High',    color: TONE_COLORS.high,    contour: '▔▔▔▔' },
    { tone: 'Rising',  color: TONE_COLORS.rising,  contour: '▁▁▁◤' },
  ];

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>Practice</div>

      {activities.map(a => (
        <button key={a.title} style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderLeft: `4px solid ${a.color}`, borderRadius: 14, padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', width: '100%' }} onClick={a.onClick}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>{a.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.desc}</div>
            {a.badge && <span style={{ fontSize: 10, color: a.color, background: `${a.color}22`, borderRadius: 6, padding: '2px 8px', fontWeight: 700, display: 'inline-block', marginTop: 4 }}>{a.badge}</span>}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
        </button>
      ))}

      {/* Quick tone reference */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Thai Tone Quick Reference</div>
        {toneRef.map(({ tone, color, contour }) => (
          <div key={tone} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontFamily: 'monospace', color, minWidth: 44, letterSpacing: 2 }}>{contour}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{tone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
