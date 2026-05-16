const STORAGE_KEY = 'thaiquest:daily_challenge';

export interface DailyChallenge {
  date: string;          // YYYY-MM-DD
  type: 'quiz' | 'study' | 'new_words' | 'tone_trainer' | 'memory_match' | 'sentence_builder';
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
  xpReward: number;
}

const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'date' | 'progress' | 'completed'>[] = [
  { type: 'quiz',             description: 'Score 8 or more on a quiz',        goal: 8,  xpReward: 50 },
  { type: 'study',            description: 'Review 15 flashcards today',       goal: 15, xpReward: 40 },
  { type: 'new_words',        description: 'Learn 5 new words today',          goal: 5,  xpReward: 60 },
  { type: 'study',            description: 'Complete a full study session',    goal: 10, xpReward: 45 },
  { type: 'quiz',             description: 'Get a perfect quiz score',         goal: 10, xpReward: 75 },
  { type: 'tone_trainer',     description: 'Identify 7+ tones correctly',      goal: 7,  xpReward: 55 },
  { type: 'memory_match',     description: 'Complete a Memory Match game',     goal: 1,  xpReward: 45 },
  { type: 'sentence_builder', description: 'Build 5 correct sentences',        goal: 5,  xpReward: 65 },
  { type: 'tone_trainer',     description: 'Ace the Tone Trainer (9+/10)',     goal: 9,  xpReward: 80 },
  { type: 'memory_match',     description: 'Win a Memory Match on Hard mode',  goal: 1,  xpReward: 70 },
  { type: 'quiz',             description: 'Answer 6 listening questions right', goal: 6, xpReward: 55 },
  { type: 'study',            description: 'Review 20 cards in one session',   goal: 20, xpReward: 60 },
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
