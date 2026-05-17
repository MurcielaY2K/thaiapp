import React from 'react';
import { useGame } from '../context/GameContext';
import { getLevelConfig } from '@engine/engine/gameEngine';
import { getCharacter } from '../data/characters';
import { FeatureUnlocks } from '../utils/featureUnlocks';

const XP_PER_LEVEL = 500;

export function Home({ onStudy, onTone, onMatch, onSentence, unlocks }: {
  onStudy: () => void;
  onTone: () => void;
  onMatch: () => void;
  onSentence: () => void;
  unlocks: FeatureUnlocks | null;
}) {
  const { profile, stats, refreshStats, dailyChallenge } = useGame();
  React.useEffect(() => { refreshStats(); }, []);

  if (!profile || !stats) return null;

  const character = getCharacter(profile.avatarId ?? 'byte');
  const levelXP = profile.totalXP % XP_PER_LEVEL;
  const levelCfg = getLevelConfig(profile.currentLevel);
  const canStudy = stats.dueToday > 0 || stats.newAvailable > 0;

  return (
    <div className="scroll" style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* CHARACTER HERO CARD */}
      <div style={{
        position: 'relative',
        background: character.bgGradient,
        borderRadius: 24,
        border: `1px solid ${character.color}44`,
        boxShadow: `0 0 28px ${character.glowColor}, 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        padding: '20px 20px 18px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${character.glowColor} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Character avatar frame with pixel corners */}
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            border: `2px solid ${character.color}66`,
            boxShadow: `0 0 20px ${character.glowColor}, inset 0 0 20px rgba(0,0,0,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, flexShrink: 0, position: 'relative',
          }}>
            <span style={{ filter: `drop-shadow(0 0 8px ${character.color})` }}>{character.emoji}</span>
            <div style={{ position: 'absolute', top: -2, left: -2, width: 8, height: 8, borderTop: `2px solid ${character.color}`, borderLeft: `2px solid ${character.color}` }} />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderTop: `2px solid ${character.color}`, borderRight: `2px solid ${character.color}` }} />
            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 8, height: 8, borderBottom: `2px solid ${character.color}`, borderLeft: `2px solid ${character.color}` }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderBottom: `2px solid ${character.color}`, borderRight: `2px solid ${character.color}` }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: character.color, letterSpacing: 1, textShadow: `0 0 12px ${character.color}88` }}>{character.name}</span>
              <div style={{ background: 'linear-gradient(135deg, #D4801A, #FFB84D)', borderRadius: 6, padding: '2px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 7, color: 'rgba(30,10,0,0.7)', fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }}>LV</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#1A0A00', lineHeight: 1 }}>{profile.currentLevel}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: `${character.color}bb`, fontWeight: 600, marginBottom: 5 }}>{character.role}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{levelCfg.titleThai}</span>
              {profile.currentStreak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(245,158,66,0.15)', border: '1px solid rgba(245,158,66,0.35)', borderRadius: 999, padding: '2px 8px' }}>
                  <span style={{ fontSize: 11 }}>🔥</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)' }}>{profile.currentStreak}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(levelXP / XP_PER_LEVEL) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${character.color}88, ${character.color})`, borderRadius: 999, boxShadow: `0 0 8px ${character.color}` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            <span>{levelXP} XP</span>
            <span>{XP_PER_LEVEL - levelXP} to LV {profile.currentLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* STUDY CTA */}
      <button
        className={canStudy ? 'gold-pulse' : ''}
        style={{
          borderRadius: 18, padding: '18px 24px', fontWeight: 800, fontSize: 17, width: '100%',
          display: 'flex', alignItems: 'center', gap: 16,
          background: canStudy
            ? 'linear-gradient(135deg, #D4801A 0%, #F59E42 45%, #FFB84D 80%, #F5C060 100%)'
            : 'rgba(255,255,255,0.05)',
          color: canStudy ? '#1A0800' : 'var(--text-muted)',
          border: canStudy ? 'none' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: canStudy ? '0 6px 32px rgba(245,158,66,0.45)' : 'none',
        }}
        onClick={onStudy}
        disabled={!canStudy}
      >
        <span style={{ fontSize: 26 }}>{canStudy ? '⚔️' : '🎉'}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 900, fontSize: 17 }}>{canStudy ? 'Continue Journey' : 'All caught up!'}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
            {canStudy
              ? `${stats.dueToday} due · ${stats.newAvailable} new · ~${stats.estimatedMinutes} min`
              : 'Come back tomorrow for new words'}
          </div>
        </div>
        {canStudy && <span style={{ fontSize: 22, opacity: 0.8 }}>›</span>}
      </button>

      {/* STATS ROW */}
      {unlocks?.statsRow && (
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Due Today', value: stats.dueToday, icon: '📋', color: stats.dueToday > 0 ? 'var(--warning)' : 'var(--success)' },
            { label: 'New Words', value: stats.newAvailable, icon: '✨', color: 'var(--info)' },
            { label: 'Mastered', value: stats.masteredCards, icon: '⭐', color: 'var(--gold)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(22,12,53,0.9)', borderRadius: 16, padding: '14px 8px', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', borderTop: `2px solid ${color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* DAILY CHALLENGE */}
      {unlocks?.dailyChallenge && dailyChallenge && (() => {
        const challengeColor = dailyChallenge.completed ? 'var(--success)' : 'var(--gold)';
        const challengeNav: Record<string, (() => void) | undefined> = {
          study: onStudy, new_words: onStudy, tone_trainer: onTone, memory_match: onMatch, sentence_builder: onSentence,
        };
        const challengeIcon: Record<string, string> = {
          study: '📖', new_words: '✨', quiz: '🧠', tone_trainer: '🎵', memory_match: '🃏', sentence_builder: '🔤',
        };
        const startFn = challengeNav[dailyChallenge.type];
        return (
          <div style={{ background: 'linear-gradient(135deg, rgba(22,12,53,0.94), rgba(14,7,38,0.9))', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${challengeColor}`, boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: challengeColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {dailyChallenge.completed ? '✅ Daily Done!' : '🎯 Daily Challenge'}
              </div>
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>+{dailyChallenge.xpReward} XP</span>
            </div>
            <div style={{ fontSize: 14, marginBottom: 10 }}>{dailyChallenge.description}</div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (dailyChallenge.progress / dailyChallenge.goal) * 100)}%`, height: '100%', background: challengeColor, borderRadius: 999, boxShadow: `0 0 6px ${challengeColor}88` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dailyChallenge.progress}/{dailyChallenge.goal}</span>
              {!dailyChallenge.completed && startFn && (
                <button
                  style={{ background: 'linear-gradient(135deg, #D4801A, #FFB84D)', color: '#1A0800', borderRadius: 10, padding: '6px 16px', fontWeight: 700, fontSize: 12, boxShadow: '0 2px 10px rgba(245,158,66,0.3)' }}
                  onClick={startFn}
                >
                  {challengeIcon[dailyChallenge.type] ?? '▶'} Go
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
