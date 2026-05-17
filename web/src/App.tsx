import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Study } from './pages/Study';
import { Quiz } from './pages/Quiz';
import { ToneTrainer } from './pages/ToneTrainer';
import { SentenceBuilder } from './pages/SentenceBuilder';
import { AlphabetDrill } from './pages/AlphabetDrill';
import { Phrasebook } from './pages/Phrasebook';
import { SessionComplete } from './pages/SessionComplete';
import { Quests } from './pages/Quests';
import { Profile } from './pages/Profile';
import { VocabBrowser } from './pages/VocabBrowser';
import { WorldMap } from './pages/WorldMap';
import { Settings } from './pages/Settings';
import { MatchGame } from './pages/MatchGame';
import { Shop } from './pages/Shop';
import { TONE_COLORS } from '@engine/types';
import { SessionSummary } from '@engine/engine/sessionManager';
import { getLevelConfig } from '@engine/engine/gameEngine';
import { sfx } from './utils/audio';
import { getFeatureUnlocks, UNLOCK_AT, FeatureUnlocks } from './utils/featureUnlocks';

type Tab = 'home' | 'learn' | 'map' | 'browse' | 'profile';
type View = 'onboarding' | 'main' | 'study' | 'quiz' | 'quiz_fav' | 'quiz_hard' | 'tone' | 'sentence' | 'alphabet' | 'phrasebook' | 'match' | 'session_complete' | 'settings' | 'shop';

interface CompleteState { summary: SessionSummary; xp: number; questIds: string[] }
interface StudyState { region?: string }

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home',    icon: '⚔️', label: 'Home' },
  { id: 'learn',   icon: '🎯', label: 'Practice' },
  { id: 'map',     icon: '🗺️', label: 'Regions' },
  { id: 'browse',  icon: '📜', label: 'Vocab' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export function App() {
  const { isLoading, hasProfile, newAchievements, dismissNewAchievements, levelUp, dismissLevelUp, profile } = useGame();
  const [view, setView] = useState<View>('main');
  const [tab, setTab] = useState<Tab>('home');
  const [complete, setComplete] = useState<CompleteState | null>(null);
  const [studyState, setStudyState] = useState<StudyState>({});

  const unlocks = profile ? getFeatureUnlocks(profile) : null;

  // Feature unlock toast
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  const prevUnlocksRef = React.useRef<FeatureUnlocks | null>(null);
  useEffect(() => {
    if (!unlocks) return;
    const prev = prevUnlocksRef.current;
    prevUnlocksRef.current = unlocks;
    if (!prev) return;
    const FEATURE_LABELS: Partial<Record<keyof FeatureUnlocks, string>> = {
      quiz: 'Quiz Mode', phrasebook: 'Phrasebook', memoryMatch: 'Memory Match',
      toneTrainer: 'Tone Trainer', alphabetDrill: 'Thai Alphabet', sentenceBuilder: 'Sentence Builder',
      vocabBrowser: 'Vocab Browser',
    };
    for (const [key, label] of Object.entries(FEATURE_LABELS) as [keyof FeatureUnlocks, string][]) {
      if (!prev[key] && unlocks[key]) {
        setUnlockToast(label);
        sfx.correct();
        const t = setTimeout(() => setUnlockToast(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [unlocks]);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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

  // Level-up toast
  const [showLevelUp, setShowLevelUp] = useState(false);
  useEffect(() => {
    if (levelUp !== null) {
      setShowLevelUp(true);
      sfx.levelUp();
      const t = setTimeout(() => { setShowLevelUp(false); dismissLevelUp(); }, 4000);
      return () => clearTimeout(t);
    }
  }, [levelUp]);

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: 48, animation: 'scaleIn 0.5s ease infinite alternate' }}>🇹🇭</div>
    </div>
  );

  if (!hasProfile || view === 'onboarding') return <Onboarding onDone={() => setView('main')} />;
  if (view === 'settings') return <Settings onBack={() => setView('main')} />;
  if (view === 'shop')     return <Shop     onBack={() => setView('main')} />;
  if (view === 'study') return (
    <Study
      regionFilter={studyState.region}
      onComplete={(summary, xp, questIds) => { setComplete({ summary, xp, questIds }); setView('session_complete'); }}
      onExit={() => { setStudyState({}); setView('main'); setTab('home'); }}
    />
  );
  if (view === 'quiz')     return <Quiz         onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'quiz_fav') return <Quiz         onExit={() => { setView('main'); setTab('learn'); }} favoritesOnly />;
  if (view === 'quiz_hard') return <Quiz        onExit={() => { setView('main'); setTab('learn'); }} hardOnly />;
  if (view === 'tone')     return <ToneTrainer  onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'sentence') return <SentenceBuilder onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'alphabet')    return <AlphabetDrill  onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'phrasebook')  return <Phrasebook     onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'match')       return <MatchGame      onExit={() => { setView('main'); setTab('learn'); }} />;
  if (view === 'session_complete' && complete) return (
    <SessionComplete
      summary={complete.summary} xpGained={complete.xp} completedQuestIds={complete.questIds}
      onHome={() => { setView('main'); setTab('home'); setComplete(null); }}
      onStudyAgain={() => { setComplete(null); setView('study'); }}
    />
  );

  return (
    <>
      {/* PWA install banner */}
      {showInstall && (
        <div style={{ position: 'fixed', bottom: 80, left: 12, right: 12, zIndex: 999, background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease forwards' }}>
          <span style={{ fontSize: 24 }}>📱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Install ThaiQuest</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Add to home screen for the full experience</div>
          </div>
          <button style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, flexShrink: 0 }} onClick={() => {
            (installPrompt as any)?.prompt?.();
            setShowInstall(false);
          }}>Install</button>
          <button style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 18, padding: 4, flexShrink: 0 }} onClick={() => setShowInstall(false)}>✕</button>
        </div>
      )}

      {/* Level-up toast */}
      {showLevelUp && levelUp !== null && (() => {
        const cfg = getLevelConfig(levelUp);
        return (
          <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1001, background: 'linear-gradient(135deg, var(--primary), var(--gold))', borderRadius: 16, padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 6px 32px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease forwards', maxWidth: 300 }}>
            <div style={{ fontSize: 28 }}>⚡</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Level Up!</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{cfg.titleThai}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Level {levelUp} · {cfg.titleEnglish}</div>
          </div>
        );
      })()}

      {/* Feature unlock toast */}
      {unlockToast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1002, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 16, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 32px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease forwards', maxWidth: 300, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 24 }}>🔓</span>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Feature Unlocked!</div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{unlockToast}</div>
          </div>
        </div>
      )}

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
        {tab === 'home'    && <Home onStudy={() => setView('study')} onQuiz={() => setView('quiz')} onFavQuiz={() => setView('quiz_fav')} onHardQuiz={() => setView('quiz_hard')} onTone={() => setView('tone')} onMatch={() => setView('match')} onSentence={() => setView('sentence')} unlocks={unlocks} />}
        {tab === 'learn'   && <LearnTab onStudy={() => setView('study')} onQuiz={() => setView('quiz')} onTone={() => setView('tone')} onSentence={() => setView('sentence')} onAlphabet={() => setView('alphabet')} onPhrasebook={() => setView('phrasebook')} onMatch={() => setView('match')} unlocks={unlocks} />}
        {tab === 'map'     && <MapTab onStudyRegion={r => { setStudyState({ region: r }); setView('study'); }} />}
        {tab === 'browse'  && <VocabBrowser />}
        {tab === 'profile' && <Profile onSettings={() => setView('settings')} onShop={() => setView('shop')} />}
      </div>

      <nav className="bottom-nav">
        {TABS.map(({ id, icon, label }) => {
          const locked = id === 'browse' && unlocks && !unlocks.vocabBrowser;
          return (
            <button
              key={id}
              className={`nav-tab${tab === id ? ' active' : ''}`}
              onClick={() => { if (!locked) setTab(id); }}
              style={{ position: 'relative', opacity: locked ? 0.4 : 1 }}
              title={locked ? `Vocab unlocks after learning ${UNLOCK_AT.vocabBrowser} words` : undefined}
            >
              <span className="icon">{locked ? '🔒' : icon}</span>
              {id === 'home' && <DueBadge />}
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function DueBadge() {
  const { stats } = useGame();
  const due = (stats?.dueToday ?? 0) + (stats?.newAvailable ?? 0);
  if (due === 0) return null;
  return (
    <span style={{ position: 'absolute', top: 4, right: 'calc(50% - 18px)', background: 'var(--error)', color: '#fff', borderRadius: 999, fontSize: 9, fontWeight: 800, padding: '1px 5px', minWidth: 16, textAlign: 'center', lineHeight: '14px' }}>
      {due > 99 ? '99+' : due}
    </span>
  );
}

function MapTab({ onStudyRegion }: { onStudyRegion: (region: string) => void }) {
  const [sub, setSub] = useState<'map' | 'quests'>('map');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 0, padding: '12px 20px 0', background: 'var(--bg)', flexShrink: 0 }}>
        {(['map', 'quests'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSub(s)}
            style={{
              flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 700,
              color: sub === s ? 'var(--primary)' : 'var(--text-muted)',
              background: 'transparent',
              borderBottom: `2px solid ${sub === s ? 'var(--primary)' : 'transparent'}`,
              borderRadius: 0, transition: 'all 0.2s',
            }}
          >
            {s === 'map' ? '🗺️ World Map' : '⚔️ Quests'}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {sub === 'map'    && <WorldMap onStudyRegion={onStudyRegion} />}
        {sub === 'quests' && <Quests />}
      </div>
    </div>
  );
}

function LearnTab({ onStudy, onQuiz, onTone, onSentence, onAlphabet, onPhrasebook, onMatch, unlocks }: {
  onStudy: () => void; onQuiz: () => void; onTone: () => void; onSentence: () => void;
  onAlphabet: () => void; onPhrasebook: () => void; onMatch: () => void;
  unlocks: ReturnType<typeof getFeatureUnlocks> | null;
}) {
  const activities = [
    {
      icon: '📖', title: 'Flashcard Study', desc: 'SRS-based review — the best way to build long-term memory',
      color: 'var(--primary)', badge: '', onClick: onStudy, unlocked: true,
    },
    {
      icon: '🧠', title: 'Multiple Choice Quiz', desc: 'Thai→English, English→Thai, Listening, and more',
      color: 'var(--info)', badge: '6 modes', onClick: onQuiz,
      unlocked: unlocks?.quiz ?? false, unlockAt: UNLOCK_AT.quiz,
    },
    {
      icon: '💬', title: 'Phrasebook', desc: 'Practical everyday phrases with native TTS playback',
      color: 'var(--r-wl)', badge: '7 categories', onClick: onPhrasebook,
      unlocked: unlocks?.phrasebook ?? false, unlockAt: UNLOCK_AT.phrasebook,
    },
    {
      icon: '🃏', title: 'Memory Match', desc: 'Flip cards to match Thai words to English meanings',
      color: 'var(--r-pi)', badge: '3 difficulties', onClick: onMatch,
      unlocked: unlocks?.memoryMatch ?? false, unlockAt: UNLOCK_AT.memoryMatch,
    },
    {
      icon: '🎵', title: 'Tone Trainer', desc: 'Identify the 5 Thai tones — mid, low, falling, high, rising',
      color: '#6BBF6E', badge: '', onClick: onTone,
      unlocked: unlocks?.toneTrainer ?? false, unlockAt: UNLOCK_AT.toneTrainer,
    },
    {
      icon: '🔡', title: 'Thai Alphabet', desc: 'Explore consonants & vowels — tap to hear pronunciation',
      color: 'var(--warning)', badge: '29 consonants', onClick: onAlphabet,
      unlocked: unlocks?.alphabetDrill ?? false, unlockAt: UNLOCK_AT.alphabetDrill,
    },
    {
      icon: '🔤', title: 'Sentence Builder', desc: 'Arrange romanized words into correct sentence order',
      color: 'var(--gold)', badge: '', onClick: onSentence,
      unlocked: unlocks?.sentenceBuilder ?? false, unlockAt: UNLOCK_AT.sentenceBuilder,
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
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 2 }}>Practice</div>

      {activities.map(a => {
        const locked = !a.unlocked;
        return (
          <button
            key={a.title}
            style={{
              background: locked
                ? 'rgba(22,12,53,0.6)'
                : 'linear-gradient(135deg, rgba(22,12,53,0.95), rgba(14,7,38,0.9))',
              border: `1px solid ${locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
              borderLeft: `4px solid ${locked ? 'rgba(255,255,255,0.1)' : a.color}`,
              borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16,
              textAlign: 'left', width: '100%',
              opacity: locked ? 0.5 : 1,
              cursor: locked ? 'default' : 'pointer',
              boxShadow: locked ? 'none' : `0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
            onClick={locked ? undefined : a.onClick}
            disabled={locked}
          >
            <span style={{ fontSize: 28, flexShrink: 0, filter: locked ? 'grayscale(1) brightness(0.6)' : 'none' }}>{locked ? '🔒' : a.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3, color: locked ? 'var(--text-muted)' : 'var(--text)', letterSpacing: -0.1 }}>{a.title}</div>
              {locked
                ? <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Learn {a.unlockAt} words to unlock</div>
                : <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.4 }}>{a.desc}</div>
              }
              {!locked && a.badge && (
                <span style={{ fontSize: 10, color: a.color, background: `${a.color}18`, border: `1px solid ${a.color}33`, borderRadius: 6, padding: '2px 8px', fontWeight: 700, display: 'inline-block', marginTop: 5, letterSpacing: 0.3 }}>{a.badge}</span>
              )}
            </div>
            {!locked && <span style={{ color: 'var(--text-muted)', fontSize: 16, flexShrink: 0 }}>›</span>}
          </button>
        );
      })}

      {/* Quick tone reference */}
      <div style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.92), rgba(14,7,38,0.88))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
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
