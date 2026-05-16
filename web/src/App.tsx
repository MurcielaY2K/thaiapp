import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Study } from './pages/Study';
import { SessionComplete } from './pages/SessionComplete';
import { Quests } from './pages/Quests';
import { Profile } from './pages/Profile';
import { SessionSummary } from '@engine/engine/sessionManager';

type Tab = 'home' | 'quests' | 'profile';
type View = 'onboarding' | 'main' | 'study' | 'session_complete';

interface CompleteState {
  summary: SessionSummary;
  xp: number;
  questIds: string[];
}

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

  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'home'    && <Home onStudy={() => setView('study')} />}
        {tab === 'quests'  && <Quests />}
        {tab === 'profile' && <Profile />}
      </div>

      <nav className="bottom-nav">
        {([
          ['home',    '🏠', 'Home'],
          ['quests',  '⚔️', 'Quests'],
          ['profile', '🧭', 'Profile'],
        ] as [Tab, string, string][]).map(([t, icon, label]) => (
          <button key={t} className={`nav-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            <span className="icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
