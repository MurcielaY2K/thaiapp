// Duolingo-style world and lesson definitions.
// Each lesson pulls from vocabulary.ts by word ID.

export interface Lesson {
  id: string;
  worldId: string;
  title: string;
  icon: string;
  xpReward: number;
  vocabIds: string[];      // word IDs from vocabulary.ts
  type: 'vocab' | 'checkpoint';
}

export interface World {
  id: string;
  title: string;
  subtitle: string;
  color: string;       // accent tint for nodes / highlights
  darkColor: string;   // darker shade
  realmTint: string;   // world header background tint
  emoji: string;
  isPremium: boolean;
  lessons: Lesson[];
}

export const WORLDS: World[] = [
  {
    id: 'w1',
    title: 'Survival Thai',
    subtitle: 'Essential words for day one',
    color: '#9ef5d4',
    darkColor: '#5fd9ac',
    realmTint: '#ff6a2e',
    emoji: '🙏',
    isPremium: false,
    lessons: [
      {
        id: 'w1-l1', worldId: 'w1', title: 'Hello & Goodbye', icon: '👋', xpReward: 15,
        type: 'vocab',
        vocabIds: ['g01', 'g02', 'g03', 'g04', 'g05', 'g06'],
      },
      {
        id: 'w1-l2', worldId: 'w1', title: 'Key Phrases', icon: '💬', xpReward: 15,
        type: 'vocab',
        vocabIds: ['g07', 'g08', 'g09', 'g10', 'g11', 'g12'],
      },
      {
        id: 'w1-l3', worldId: 'w1', title: 'People & Price', icon: '🛍️', xpReward: 15,
        type: 'vocab',
        vocabIds: ['g13', 'g14', 'g15', 'g16', 'g17', 'g18'],
      },
      {
        id: 'w1-l4', worldId: 'w1', title: 'Numbers 1–5', icon: '🔢', xpReward: 15,
        type: 'vocab',
        vocabIds: ['n02', 'n03', 'n04', 'n05', 'n06', 'n07'],
      },
      {
        id: 'w1-l5', worldId: 'w1', title: 'Numbers 6–10', icon: '🔟', xpReward: 15,
        type: 'vocab',
        vocabIds: ['n08', 'n09', 'n10', 'n11', 'n12', 'n13'],
      },
      {
        id: 'w1-cp', worldId: 'w1', title: 'Checkpoint', icon: '⭐', xpReward: 50,
        type: 'checkpoint',
        vocabIds: ['g01', 'g02', 'g05', 'g06', 'n02', 'n03', 'n10', 'g11', 'g13', 'g14'],
      },
    ],
  },
  {
    id: 'w2',
    title: 'Food & Flavors',
    subtitle: 'Eat like a local',
    color: '#ffb3d1',
    darkColor: '#f57aa8',
    realmTint: '#c0b2f8',
    emoji: '🍜',
    isPremium: false,
    lessons: [
      {
        id: 'w2-l1', worldId: 'w2', title: 'Thai Classics', icon: '🍛', xpReward: 15,
        type: 'vocab',
        vocabIds: ['f03', 'f04', 'f05', 'f06', 'f28', 'f01'],
      },
      {
        id: 'w2-l2', worldId: 'w2', title: 'Meat & Seafood', icon: '🦐', xpReward: 15,
        type: 'vocab',
        vocabIds: ['f09', 'f10', 'f11', 'f12', 'f13', 'f14'],
      },
      {
        id: 'w2-l3', worldId: 'w2', title: 'Drinks & Snacks', icon: '☕', xpReward: 15,
        type: 'vocab',
        vocabIds: ['f02', 'f19', 'f20', 'f21', 'f22', 'f30'],
      },
      {
        id: 'w2-l4', worldId: 'w2', title: 'Tastes & Feelings', icon: '😋', xpReward: 15,
        type: 'vocab',
        vocabIds: ['f15', 'f16', 'f17', 'f18', 'f26', 'f27'],
      },
      {
        id: 'w2-l5', worldId: 'w2', title: 'Colors', icon: '🎨', xpReward: 15,
        type: 'vocab',
        vocabIds: ['c01', 'c02', 'c03', 'c04', 'c05', 'c06'],
      },
      {
        id: 'w2-cp', worldId: 'w2', title: 'Checkpoint', icon: '⭐', xpReward: 50,
        type: 'checkpoint',
        vocabIds: ['f01', 'f03', 'f11', 'f15', 'f16', 'f19', 'f28', 'c01', 'c03', 'c05'],
      },
    ],
  },
  {
    id: 'w3',
    title: 'Bangkok Life',
    subtitle: 'Get around the city',
    color: '#8fe8ff',
    darkColor: '#4fc4e8',
    realmTint: '#b5cb51',
    emoji: '🏙️',
    isPremium: true,
    lessons: [
      {
        id: 'w3-l1', worldId: 'w3', title: 'Transport', icon: '🛺', xpReward: 20,
        type: 'vocab',
        vocabIds: ['p07', 'p08', 'p09', 'p10', 'p11', 'p06'],
      },
      {
        id: 'w3-l2', worldId: 'w3', title: 'Directions', icon: '🗺️', xpReward: 20,
        type: 'vocab',
        vocabIds: ['p12', 'p13', 'p14', 'p15', 'p16', 'p17'],
      },
      {
        id: 'w3-l3', worldId: 'w3', title: 'Places', icon: '📍', xpReward: 20,
        type: 'vocab',
        vocabIds: ['p01', 'p02', 'p03', 'p04', 'p05', 'p19'],
      },
      {
        id: 'w3-l4', worldId: 'w3', title: 'Time Basics', icon: '⏰', xpReward: 20,
        type: 'vocab',
        vocabIds: ['t01', 't02', 't05', 't06', 't07', 't08'],
      },
      {
        id: 'w3-l5', worldId: 'w3', title: 'Days of Week', icon: '📅', xpReward: 20,
        type: 'vocab',
        vocabIds: ['t14', 't15', 't16', 't17', 't18', 't19'],
      },
      {
        id: 'w3-cp', worldId: 'w3', title: 'Checkpoint', icon: '⭐', xpReward: 60,
        type: 'checkpoint',
        vocabIds: ['p07', 'p08', 'p13', 'p14', 'p19', 't06', 't07', 't14', 't18', 'p01'],
      },
    ],
  },
  {
    id: 'w4',
    title: 'Social Thai',
    subtitle: 'Talk like a local',
    color: '#9ef5d4',
    darkColor: '#5fd9ac',
    realmTint: '#f5d43e',
    emoji: '🗣️',
    isPremium: true,
    lessons: [
      {
        id: 'w4-l1', worldId: 'w4', title: 'Action Words I', icon: '🏃', xpReward: 20,
        type: 'vocab',
        vocabIds: ['v01', 'v02', 'v03', 'v04', 'v05', 'v06'],
      },
      {
        id: 'w4-l2', worldId: 'w4', title: 'Action Words II', icon: '💪', xpReward: 20,
        type: 'vocab',
        vocabIds: ['v09', 'v10', 'v11', 'v12', 'v13', 'v18'],
      },
      {
        id: 'w4-l3', worldId: 'w4', title: 'Buying & Helping', icon: '🛒', xpReward: 20,
        type: 'vocab',
        vocabIds: ['v14', 'v15', 'v16', 'v17', 'v19', 'v20'],
      },
      {
        id: 'w4-l4', worldId: 'w4', title: 'Family', icon: '👨‍👩‍👧', xpReward: 20,
        type: 'vocab',
        vocabIds: ['fam01', 'fam02', 'fam03', 'fam04', 'fam05', 'fam08'],
      },
      {
        id: 'w4-l5', worldId: 'w4', title: 'Relationships', icon: '🤝', xpReward: 20,
        type: 'vocab',
        vocabIds: ['fam06', 'fam07', 'fam09', 'fam10', 'v27', 'v28'],
      },
      {
        id: 'w4-cp', worldId: 'w4', title: 'Checkpoint', icon: '⭐', xpReward: 60,
        type: 'checkpoint',
        vocabIds: ['v01', 'v02', 'v09', 'v14', 'v19', 'v20', 'fam01', 'fam02', 'fam08', 'v16'],
      },
    ],
  },
  {
    id: 'w5',
    title: 'Fluency Path',
    subtitle: 'Master Thai expressions',
    color: '#ffd700',
    darkColor: '#e0ab00',
    realmTint: '#f06060',
    emoji: '🏆',
    isPremium: true,
    lessons: [
      {
        id: 'w5-l1', worldId: 'w5', title: 'Good & Bad', icon: '⚖️', xpReward: 25,
        type: 'vocab',
        vocabIds: ['a01', 'a02', 'a03', 'a04', 'a05', 'a25'],
      },
      {
        id: 'w5-l2', worldId: 'w5', title: 'Size & Temperature', icon: '📏', xpReward: 25,
        type: 'vocab',
        vocabIds: ['a06', 'a07', 'a08', 'a09', 'a14', 'a15'],
      },
      {
        id: 'w5-l3', worldId: 'w5', title: 'Feelings', icon: '😌', xpReward: 25,
        type: 'vocab',
        vocabIds: ['a10', 'a11', 'a12', 'a13', 'a16', 'a17'],
      },
      {
        id: 'w5-l4', worldId: 'w5', title: 'Speed & Cleanliness', icon: '💨', xpReward: 25,
        type: 'vocab',
        vocabIds: ['a18', 'a19', 'a20', 'a21', 'a22', 'a23'],
      },
      {
        id: 'w5-l5', worldId: 'w5', title: 'Intensity', icon: '🔥', xpReward: 25,
        type: 'vocab',
        vocabIds: ['a24', 'a25', 'v29', 'v30', 'v23', 'v24'],
      },
      {
        id: 'w5-cp', worldId: 'w5', title: 'Final Checkpoint', icon: '🏆', xpReward: 100,
        type: 'checkpoint',
        vocabIds: ['a01', 'a08', 'a11', 'a20', 'a24', 'v01', 'v09', 'v19', 'fam01', 'g01'],
      },
    ],
  },
];

// Flat list of all lessons in order
export const ALL_LESSONS: Lesson[] = WORLDS.flatMap(w => w.lessons);

export function getLessonById(id: string) { return ALL_LESSONS.find(l => l.id === id); }

export function getNextLesson(lessonId: string): { lesson: Lesson | null; isPremium: boolean } {
  const idx = ALL_LESSONS.findIndex(l => l.id === lessonId);
  if (idx < 0 || idx >= ALL_LESSONS.length - 1) return { lesson: null, isPremium: false };
  const next = ALL_LESSONS[idx + 1];
  const world = WORLDS.find(w => w.id === next.worldId)!;
  return { lesson: next, isPremium: world.isPremium };
}
