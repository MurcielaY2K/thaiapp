import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { REGIONS, TONE_COLORS } from '@engine/types';
import { VOCABULARY } from '@engine/data/vocabulary';

const XP_PER_LEVEL = 500;
const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

export function Home({ onStudy, onQuiz }: { onStudy: () => void; onQuiz: () => void }) {
  const { profile, stats, refreshStats, wordOfDay, dailyChallenge, facade } = useGame();
  useEffect(() => { refreshStats(); }, []);

  if (!profile || !stats) return null;

  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const region = profile.unlockedRegions[profile.unlockedRegions.length - 1] ?? 'krung_thon';
  const regionCfg = REGIONS[region as keyof typeof REGIONS];
  const regionColor = REGION_COLOR[region] ?? 'var(--primary)';
  const canStudy = stats.dueToday > 0 || stats.newAvailable > 0;

  const hour = new Date().getHours();
  const thaiGreeting = hour < 6 ? 'สวัสดีตอนดึก' : hour < 12 ? 'สวัสดีตอนเช้า' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
  const streakMsg = profile.currentStreak === 0
    ? 'Start your streak today!'
    : profile.currentStreak === 1
    ? '1 day streak — keep going!'
    : `${profile.currentStreak} day streak — amazing!`;

  return (
    <div className="scroll" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.greeting}>{thaiGreeting}!</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{profile.name}</div>
          <div style={s.sub}>{streakMsg}</div>
        </div>
        <div style={s.streak}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>{profile.currentStreak}</span>
        </div>
      </div>

      {/* Level bar */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontWeight: 700 }}>Level {profile.currentLevel}</span>
          </div>
          <span style={{ color: 'var(--text-sec)', fontSize: 13 }}>{levelXP} / {XP_PER_LEVEL} XP</span>
        </div>
        <div className="progress-track" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${(levelXP / XP_PER_LEVEL) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--gold))' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>{profile.totalXP.toLocaleString()} total XP</span>
          <span>{XP_PER_LEVEL - levelXP} XP to level {profile.currentLevel + 1}</span>
        </div>
      </div>

      {/* Region banner */}
      <div style={{ ...s.card, borderLeft: `4px solid ${regionColor}`, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{regionCfg.nameThai}</div>
          <div style={{ fontSize: 13, color: regionColor, fontWeight: 600 }}>{regionCfg.nameEnglish}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{regionCfg.description}</div>
        </div>
        <div style={{ fontSize: 32 }}>🗺️</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Due Today', value: stats.dueToday, icon: '📋', color: stats.dueToday > 0 ? 'var(--warning)' : 'var(--success)' },
          { label: 'New Words', value: stats.newAvailable, icon: '✨', color: 'var(--info)' },
          { label: 'Mastered', value: stats.masteredCards, icon: '⭐', color: 'var(--gold)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ ...s.card, flex: 1, borderTop: `3px solid ${color}`, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Primary actions */}
      <button
        style={{ ...s.studyBtn, background: canStudy ? 'var(--primary)' : 'var(--surface-hi)', color: canStudy ? '#fff' : 'var(--text-muted)' }}
        onClick={onStudy}
        disabled={!canStudy}
      >
        <span style={{ fontSize: 22 }}>{canStudy ? '📖' : '🎉'}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700 }}>{canStudy ? 'Study Now' : 'All caught up!'}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            {canStudy ? `~${stats.estimatedMinutes} min · Flashcard review` : 'Come back tomorrow'}
          </div>
        </div>
        {canStudy && <span style={{ fontSize: 18 }}>→</span>}
      </button>

      <button style={s.quizBtn} onClick={onQuiz}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700 }}>Quick Quiz</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>10 questions · Test your memory</div>
        </div>
        <span style={{ fontSize: 18 }}>→</span>
      </button>

      {/* Daily challenge */}
      {dailyChallenge && (
        <div style={{ ...s.card, borderLeft: `4px solid ${dailyChallenge.completed ? 'var(--success)' : 'var(--gold)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: dailyChallenge.completed ? 'var(--success)' : 'var(--gold)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {dailyChallenge.completed ? '✅ Daily Challenge Done!' : '🎯 Daily Challenge'}
            </div>
            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>+{dailyChallenge.xpReward} XP</span>
          </div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>{dailyChallenge.description}</div>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (dailyChallenge.progress / dailyChallenge.goal) * 100)}%`, background: dailyChallenge.completed ? 'var(--success)' : 'var(--gold)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{dailyChallenge.progress}/{dailyChallenge.goal}</div>
        </div>
      )}

      {/* SRS level distribution */}
      {facade && <SrsLevelChart srsMap={facade.srsMap} />}

      {/* Word of the day */}
      {wordOfDay && (
        <div style={{ ...s.card, background: 'var(--surface-hi)', border: '1px solid var(--primary)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Word of the Day</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{wordOfDay.thai}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{wordOfDay.romanization}</div>
              <div style={{ fontSize: 15, color: 'var(--text-sec)', marginTop: 4 }}>{wordOfDay.englishMeaning}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TONE_COLORS[wordOfDay.tone], background: `${TONE_COLORS[wordOfDay.tone]}22`, borderRadius: 8, padding: '4px 10px' }}>{wordOfDay.tone}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{wordOfDay.category.replace(/_/g, ' ')}</div>
            </div>
          </div>
          {wordOfDay.culturalNote && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontStyle: 'italic', lineHeight: 1.5 }}>
              💡 {wordOfDay.culturalNote}
            </div>
          )}
        </div>
      )}

      {/* Active quests */}
      {profile.activeQuestIds.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Active Quests</div>
          {profile.activeQuestIds.slice(0, 2).map(qid => (
            <div key={qid} style={{ ...s.card, borderLeft: `3px solid ${regionColor}`, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⚔️</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-sec)' }}>
                {qid.replace(/_/g, ' ').replace(/^[a-z]+\s\d+\s/, '')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, paddingBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📚 {stats.totalCards} cards</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📝 {profile.totalWordsLearned} learned</span>
        {stats.strugglingCards > 0 && (
          <span style={{ fontSize: 12, color: 'var(--warning)' }}>⚠️ {stats.strugglingCards} struggling</span>
        )}
      </div>
    </div>
  );
}

function SrsLevelChart({ srsMap }: { srsMap: Map<string, { interval: number }> }) {
  const BUCKETS = [
    { label: 'New',    max: 0,    color: 'var(--border)' },
    { label: '1d',     max: 2,    color: '#1d5fa8' },
    { label: '4d',     max: 7,    color: '#2070cc' },
    { label: '1wk',    max: 14,   color: 'var(--info)' },
    { label: '2wk',    max: 30,   color: 'var(--primary)' },
    { label: '1mo+',   max: 9999, color: 'var(--success)' },
  ];

  const counts = BUCKETS.map(() => 0);
  const total = VOCABULARY.length;
  let seen = 0;
  for (const [, state] of srsMap) {
    seen++;
    const iv = state.interval;
    const bi = BUCKETS.findIndex((b, i) => i === BUCKETS.length - 1 || iv <= b.max);
    if (bi >= 0) counts[bi]++;
  }
  counts[0] = total - seen;

  const max = Math.max(1, ...counts);

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>SRS Level Distribution</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 48 }}>
        {BUCKETS.map((b, i) => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: Math.max(3, (counts[i] / max) * 40), background: counts[i] > 0 ? b.color : 'var(--border)', borderRadius: 3, transition: 'height 0.4s ease' }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{b.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        {seen} / {total} words in SRS · {counts[counts.length - 1]} long-term
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: 700 },
  sub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 },
  streak: { background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  studyBtn: { borderRadius: 14, padding: '16px 20px', fontWeight: 700, fontSize: 15, width: '100%', display: 'flex', alignItems: 'center', gap: 14 },
  quizBtn: { borderRadius: 14, padding: '16px 20px', fontWeight: 700, fontSize: 15, width: '100%', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-hi)', border: '1px solid var(--primary)', color: 'var(--primary)' },
};
