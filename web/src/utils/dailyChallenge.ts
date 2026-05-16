const STORAGE_KEY = 'thaiquest:daily_challenge';

export interface DailyChallenge {
  date: string;          // YYYY-MM-DD
  type: 'quiz' | 'study' | 'new_words';
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

const CHALLENGE_TEMPLATES = [
  { type: 'quiz'      as const, description: 'Score 8 or more on a quiz',    goal: 8,  xpReward: 50 },
  { type: 'study'     as const, description: 'Review 15 flashcards today',   goal: 15, xpReward: 40 },
  { type: 'new_words' as const, description: 'Learn 5 new words today',      goal: 5,  xpReward: 60 },
  { type: 'study'     as const, description: 'Complete a full study session', goal: 10, xpReward: 45 },
  { type: 'quiz'      as const, description: 'Get a perfect quiz score',      goal: 10, xpReward: 75 },
];

function todayStr(): string { return new Date().toISOString().split('T')[0]; }

export function getDailyChallenge(): DailyChallenge {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: DailyChallenge = JSON.parse(raw);
      if (saved.date === todayStr()) return saved;
    }
  } catch { /* ignore */ }

  // Generate new challenge for today
  const dayIndex = Math.floor(Date.now() / 86400000);
  const template = CHALLENGE_TEMPLATES[dayIndex % CHALLENGE_TEMPLATES.length];
  const challenge: DailyChallenge = { ...template, date: todayStr(), progress: 0, completed: false };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  return challenge;
}

export function updateChallengeProgress(type: DailyChallenge['type'], amount: number): DailyChallenge {
  const challenge = getDailyChallenge();
  if (challenge.completed || challenge.type !== type) return challenge;
  const progress = Math.min(challenge.goal, challenge.progress + amount);
  const updated = { ...challenge, progress, completed: progress >= challenge.goal };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
