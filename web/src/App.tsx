import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Study } from './pages/Study';
import { Quiz } from './pages/Quiz';
import { SessionComplete } from './pages/SessionComplete';
import { Quests } from './pages/Quests';
import { Profile } from './pages/Profile';
import { SessionSummary } from '@engine/engine/sessionManager';

type Tab = 'home' | 'quiz' | 'quests' | 'profile';
type View = 'onboarding' | 'main' | 'study' | 'quiz' | 'session_complete';

interface CompleteState {
  summary: SessionSummary;
  xp: number;
  questIds: string[];
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',    icon: '🏠', label: 'Home' },
  { id: 'quiz',    icon: '🧠', label: 'Quiz' },
  { id: 'quests',  icon: '⚔️', label: 'Quests' },
  { id: 'profile', icon: '🧭', label: 'Profile' },
];

export function App() {
  const { isLoading, hasProfile } = useGame();
  const [view, setView] = useState<View>('main');
  const [tab, setTab] = useState<Tab>('home');
  const [complete, setComplete] = useState<CompleteState | null>(null);

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ fontSize: 48, animation: 'scaleIn 0.5s ease infinite alternate' }}>🇹🇭</div>
      </div>
    );
  }

  if (!hasProfile || view === 'onboarding') {
    return <Onboarding onDone={() => setView('main')} />;
  }

  if (view === 'study') {
    return (
      <Study
        onComplete={(summary, xp, questIds) => {
          setComplete({ summary, xp, questIds });
          setView('session_complete');
        }}
        onExit={() => { setView('main'); setTab('home'); }}
      />
    );
  }

  if (view === 'quiz') {
    return <Quiz onExit={() => { setView('main'); setTab('home'); }} />;
  }

  if (view === 'session_complete' && complete) {
    return (
      <SessionComplete
        summary={complete.summary}
        xpGained={complete.xp}
        completedQuestIds={complete.questIds}
        onHome={() => { setView('main'); setTab('home'); setComplete(null); }}
        onStudyAgain={() => { setComplete(null); setView('study'); }}
      />
    );
  }

  const goStudy = () => setView('study');
  const goQuiz  = () => setView('quiz');

  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'home'    && <Home onStudy={goStudy} onQuiz={goQuiz} />}
        {tab === 'quiz'    && <QuizTab onStart={goQuiz} />}
        {tab === 'quests'  && <Quests />}
        {tab === 'profile' && <Profile />}
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

function QuizTab({ onStart }: { onStart: () => void }) {
  const MODES = [
    { icon: '🇹🇭', title: 'Thai → English', desc: 'Read Thai, choose the meaning', color: 'var(--r-kt)' },
    { icon: '🔤', title: 'English → Thai', desc: 'Read English, pick the Thai word', color: 'var(--r-pi)' },
    { icon: '🔊', title: 'Pronunciation', desc: 'Match Thai to its romanization', color: 'var(--r-dn)' },
  ];
  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>Practice Quiz</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: -8 }}>Test yourself with multiple-choice questions</div>

      <button
        style={{ background: 'var(--primary)', color: '#fff', borderRadius: 16, padding: '20px 24px', fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 12 }}
        onClick={onStart}
      >
        <span style={{ fontSize: 28 }}>🧠</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div>Start Quiz</div>
          <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>10 questions · Pick your mode</div>
        </div>
        <span style={{ fontSize: 20 }}>→</span>
      </button>

      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Quiz types</div>
      {MODES.map(m => (
        <div key={m.title} style={{ background: 'var(--surface)', border: `1px solid var(--border)`, borderLeft: `3px solid ${m.color}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>{m.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.desc}</div>
          </div>
        </div>
      ))}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginTop: 4 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>How it works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['10 random questions from your unlocked vocabulary', 'Choose from 4 options per question', 'See missed words reviewed at the end', 'No pressure — this does not affect your SRS schedule'].map(t => (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
