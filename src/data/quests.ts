import { Quest, GameRegion } from '../types';

// ─── krung_thon (The Golden Port) — 10 story quests ──────────────────────────
// Each quest unlocks the next via prerequisiteQuestIds.
// The arc: arrive → explore market → master basics → face the Harbor Master.

const KRUNG_THON_QUESTS: Quest[] = [
  {
    id: 'kt_01_first_steps',
    type: 'story',
    region: 'krung_thon',
    title: 'First Steps on the Dock',
    description: 'You step off the boat and onto the bustling pier. The dock master eyes you suspiciously.',
    flavorText: '"Can you even speak Thai? Prove yourself before I let you pass."',
    objectives: [
      {
        type: 'learn_words',
        count: 10,
        description: 'Learn 10 Thai words',
      },
    ],
    rewards: { xp: 100, gold: 20 },
  },
  {
    id: 'kt_02_market_greetings',
    type: 'story',
    region: 'krung_thon',
    title: 'The Greeting Merchant',
    description: 'A fruit seller waves you over. She won\'t sell to anyone who can\'t greet her properly.',
    flavorText: '"สวัสดี! That\'s all it takes, but you must mean it."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'greetings',
        description: 'Learn 5 greeting words',
      },
    ],
    rewards: { xp: 150, gold: 30 },
    prerequisiteQuestIds: ['kt_01_first_steps'],
  },
  {
    id: 'kt_03_counting_coins',
    type: 'story',
    region: 'krung_thon',
    title: 'The Coin Counter',
    description: 'The inn keeper needs payment. He speaks only in numbers.',
    flavorText: '"หนึ่ง... สอง... สาม... Can you follow along, traveler?"',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'numbers',
        description: 'Learn 5 number words',
      },
    ],
    rewards: { xp: 120, gold: 25 },
    prerequisiteQuestIds: ['kt_02_market_greetings'],
  },
  {
    id: 'kt_04_food_stall',
    type: 'story',
    region: 'krung_thon',
    title: 'The Night Market',
    description: 'The night market glows with lanterns. Every stall demands you name what you want in Thai.',
    flavorText: '"กิน! อิ่ม! อร่อย! The language of food is the language of life."',
    objectives: [
      {
        type: 'learn_words',
        count: 8,
        cardCategory: 'food',
        description: 'Learn 8 food words',
      },
    ],
    rewards: { xp: 200, gold: 40 },
    prerequisiteQuestIds: ['kt_03_counting_coins'],
  },
  {
    id: 'kt_05_finding_way',
    type: 'story',
    region: 'krung_thon',
    title: 'Lost in the Alleys',
    description: 'The port city\'s maze of alleys swallows you whole. You need directions.',
    flavorText: '"ซ้าย ขวา ตรงไป — left, right, straight ahead. Simple. Until it\'s not."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'direction',
        description: 'Learn 5 direction words',
      },
    ],
    rewards: { xp: 150, gold: 30 },
    prerequisiteQuestIds: ['kt_04_food_stall'],
  },
  {
    id: 'kt_06_daily_discipline',
    type: 'story',
    region: 'krung_thon',
    title: 'The Monk\'s Lesson',
    description: 'An old monk at the waterfront temple notices your studies. He offers a challenge.',
    flavorText: '"Discipline is the only path. Return to practice three times."',
    objectives: [
      {
        type: 'review_cards',
        count: 30,
        description: 'Review 30 cards across any sessions',
      },
    ],
    rewards: { xp: 250, gold: 50, gems: 1 },
    prerequisiteQuestIds: ['kt_05_finding_way'],
  },
  {
    id: 'kt_07_flawless',
    type: 'story',
    region: 'krung_thon',
    title: 'No Mistakes Allowed',
    description: 'A strict scribe at the port authority demands perfection before she stamps your papers.',
    flavorText: '"One wrong answer and you start again. I have all day."',
    objectives: [
      {
        type: 'perfect_session',
        count: 1,
        description: 'Complete one session with no Blackout answers',
      },
    ],
    rewards: { xp: 300, gold: 50, gems: 2 },
    prerequisiteQuestIds: ['kt_06_daily_discipline'],
  },
  {
    id: 'kt_08_voice',
    type: 'story',
    region: 'krung_thon',
    title: 'The Speaker\'s Trial',
    description: 'A theatrical troupe challenges you to speak Thai aloud. Tones matter here.',
    flavorText: '"Your mouth must know what your mind knows. Speak!"',
    objectives: [
      {
        type: 'speaking_score',
        count: 5,
        minimumScore: 70,
        description: 'Score 70+ on 5 speaking cards',
      },
    ],
    rewards: { xp: 350, gold: 60, companionId: 'phi_lok' },
    prerequisiteQuestIds: ['kt_07_flawless'],
  },
  {
    id: 'kt_09_word_hoarder',
    type: 'story',
    region: 'krung_thon',
    title: 'The Scholar\'s Library',
    description: 'The port archivist will only share her knowledge with someone equally learned.',
    flavorText: '"Show me you have learned fifty words, and I will show you the city\'s secrets."',
    objectives: [
      {
        type: 'learn_words',
        count: 50,
        description: 'Learn 50 total words',
      },
    ],
    rewards: { xp: 500, gold: 100, gems: 3 },
    prerequisiteQuestIds: ['kt_08_voice'],
  },
  {
    id: 'kt_10_harbor_master',
    type: 'boss',
    region: 'krung_thon',
    title: 'The Harbor Master\'s Test',
    description: 'The Harbor Master stands between you and the rest of Thailand. He has seen a thousand travelers fail.',
    flavorText: '"You think you are ready? Then show me everything."',
    objectives: [
      {
        type: 'perfect_session',
        count: 1,
        description: 'Complete a perfect review session',
      },
      {
        type: 'speaking_score',
        count: 3,
        minimumScore: 80,
        description: 'Score 80+ on 3 speaking cards',
      },
    ],
    rewards: { xp: 800, gold: 150, gems: 5, cardUnlockIds: ['paa_isaan_unlock'] },
    prerequisiteQuestIds: ['kt_09_word_hoarder'],
  },
];

// ─── Side quests (no prerequisites, available from the start) ─────────────────

const KRUNG_THON_SIDE_QUESTS: Quest[] = [
  {
    id: 'kt_side_family',
    type: 'side',
    region: 'krung_thon',
    title: 'Family Ties',
    description: 'A homesick sailor wants to write a letter home. Help him find the words.',
    flavorText: '"พ่อ แม่ พี่ น้อง... I cannot remember how to write them."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'family',
        description: 'Learn 5 family words',
      },
    ],
    rewards: { xp: 120, gold: 20 },
  },
  {
    id: 'kt_side_emotions',
    type: 'side',
    region: 'krung_thon',
    title: 'Reading the Room',
    description: 'A fortune teller claims she can read your heart — but only if you speak her language.',
    flavorText: '"ดีใจ เสียใจ โกรธ... What does your heart say today?"',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'emotion',
        description: 'Learn 5 emotion words',
      },
    ],
    rewards: { xp: 120, gold: 20 },
  },
  {
    id: 'kt_side_time',
    type: 'side',
    region: 'krung_thon',
    title: 'A Race Against the Clock',
    description: 'Miss the evening tide and you miss the supply run. Learn to talk about time.',
    flavorText: '"วันนี้ พรุ่งนี้ เมื่อวาน — today, tomorrow, yesterday. Don\'t be late."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'time',
        description: 'Learn 5 time words',
      },
    ],
    rewards: { xp: 100, gold: 15 },
  },
];

// ─── Daily quests (rotate every day) ─────────────────────────────────────────

export const DAILY_QUEST_POOL: Quest[] = [
  {
    id: 'daily_review_20',
    type: 'daily',
    region: 'krung_thon',
    title: 'Morning Practice',
    description: 'Start the day with twenty reviews.',
    flavorText: '"Every morning the monk sweeps the same steps."',
    objectives: [{ type: 'review_cards', count: 20, description: 'Review 20 cards' }],
    rewards: { xp: 80, gold: 10 },
    expiresInHours: 24,
  },
  {
    id: 'daily_new_5',
    type: 'daily',
    region: 'krung_thon',
    title: 'New Horizons',
    description: 'Learn five new words today.',
    flavorText: '"The sea gives new things every day."',
    objectives: [{ type: 'learn_words', count: 5, description: 'Learn 5 new words' }],
    rewards: { xp: 100, gold: 15 },
    expiresInHours: 24,
  },
  {
    id: 'daily_perfect',
    type: 'daily',
    region: 'krung_thon',
    title: 'Flawless Run',
    description: 'Complete a session without a single blackout.',
    flavorText: '"The kite that does not fall teaches more than the one that does."',
    objectives: [{ type: 'perfect_session', count: 1, description: 'Complete a perfect session' }],
    rewards: { xp: 150, gold: 20, gems: 1 },
    expiresInHours: 24,
  },
];

// ─── All quests ───────────────────────────────────────────────────────────────

export const ALL_QUESTS: Quest[] = [
  ...KRUNG_THON_QUESTS,
  ...KRUNG_THON_SIDE_QUESTS,
  ...DAILY_QUEST_POOL,
];

export function getQuestsByRegion(region: GameRegion): Quest[] {
  return ALL_QUESTS.filter(q => q.region === region);
}

export function getQuestById(id: string): Quest | undefined {
  return ALL_QUESTS.find(q => q.id === id);
}
