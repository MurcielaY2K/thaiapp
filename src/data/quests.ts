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

// ─── paa_isaan (The Spirit Forest) — 10 story quests ─────────────────────────
// Arc: enter the forest at dusk → earn the spirits' trust → face the Forest Spirit.

const PAA_ISAAN_QUESTS: Quest[] = [
  {
    id: 'pi_01_forest_entry',
    type: 'story',
    region: 'paa_isaan',
    title: 'Into the Spirit Forest',
    description: 'The treeline swallows the last light. Unseen eyes watch you from every shadow.',
    flavorText: '"ป่า speaks before any creature does. Learn to listen."',
    objectives: [
      {
        type: 'learn_words',
        count: 8,
        cardCategory: 'nature',
        description: 'Learn 8 nature words',
      },
    ],
    rewards: { xp: 200, gold: 35 },
  },
  {
    id: 'pi_02_village_customs',
    type: 'story',
    region: 'paa_isaan',
    title: 'The Hidden Village',
    description: 'Smoke rises through the canopy. A village that appears on no map offers a cautious welcome.',
    flavorText: '"We do not greet with words here. We greet with knowledge."',
    objectives: [
      {
        type: 'learn_words',
        count: 6,
        cardCategory: 'culture',
        description: 'Learn 6 cultural words',
      },
    ],
    rewards: { xp: 220, gold: 40 },
    prerequisiteQuestIds: ['pi_01_forest_entry'],
  },
  {
    id: 'pi_03_feast_table',
    type: 'story',
    region: 'paa_isaan',
    title: 'The Spirit Feast',
    description: 'The villagers set a feast for the forest spirits. You are invited — if you can name what you are eating.',
    flavorText: '"ส้มตำ ข้าวเหนียว ลาบ — every dish is a prayer."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'food',
        description: 'Learn 4 Isaan food words',
      },
    ],
    rewards: { xp: 200, gold: 35 },
    prerequisiteQuestIds: ['pi_02_village_customs'],
  },
  {
    id: 'pi_04_forest_paths',
    type: 'story',
    region: 'paa_isaan',
    title: 'Paths Without Signs',
    description: 'The forest elder sends you to gather herbs. No trail markers. Only the language of direction.',
    flavorText: '"เหนือ ใต้ ออก ตก — the compass has no needle here, only words."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'direction',
        description: 'Learn 4 direction words',
      },
    ],
    rewards: { xp: 200, gold: 35 },
    prerequisiteQuestIds: ['pi_03_feast_table'],
  },
  {
    id: 'pi_05_spirit_vigil',
    type: 'story',
    region: 'paa_isaan',
    title: 'The Night Vigil',
    description: 'To gain the spirits\' trust you must sit awake all night and review what you have learned. They are watching.',
    flavorText: '"Spirits do not respect those who forget. Review and remember."',
    objectives: [
      {
        type: 'review_cards',
        count: 30,
        description: 'Review 30 cards across any sessions',
      },
    ],
    rewards: { xp: 280, gold: 55, gems: 1 },
    prerequisiteQuestIds: ['pi_04_forest_paths'],
  },
  {
    id: 'pi_06_shrine_keeper',
    type: 'story',
    region: 'paa_isaan',
    title: 'The Shrine Keeper',
    description: 'An ancient woman tends a spirit shrine at the forest heart. She tests your understanding of sacred things.',
    flavorText: '"ผี เฝ้า บ้าน — spirits guard homes. Do they guard yours?"',
    objectives: [
      {
        type: 'learn_words',
        count: 3,
        cardCategory: 'religion',
        description: 'Learn 3 sacred words',
      },
    ],
    rewards: { xp: 250, gold: 50 },
    prerequisiteQuestIds: ['pi_05_spirit_vigil'],
  },
  {
    id: 'pi_07_voice_of_forest',
    type: 'story',
    region: 'paa_isaan',
    title: 'Voice of the Forest',
    description: 'The spirits communicate through sound. To be heard, you must speak Thai correctly — tones and all.',
    flavorText: '"Wrong tone, wrong meaning. Here, that angers the wrong spirit."',
    objectives: [
      {
        type: 'speaking_score',
        count: 3,
        minimumScore: 65,
        description: 'Score 65+ on 3 speaking cards',
      },
    ],
    rewards: { xp: 350, gold: 65, gems: 2 },
    prerequisiteQuestIds: ['pi_06_shrine_keeper'],
  },
  {
    id: 'pi_08_elder_grammar',
    type: 'story',
    region: 'paa_isaan',
    title: 'The Elder\'s Challenge',
    description: 'The village elder will not speak with you until you can connect ideas — not just name things.',
    flavorText: '"แต่ ถ้า เพราะ ก็ — without these, you speak like a child, not a traveler."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'grammar',
        description: 'Learn 4 grammar connector words',
      },
    ],
    rewards: { xp: 300, gold: 55 },
    prerequisiteQuestIds: ['pi_07_voice_of_forest'],
  },
  {
    id: 'pi_09_forest_scholar',
    type: 'story',
    region: 'paa_isaan',
    title: 'Becoming a Forest Scholar',
    description: 'The elder declares you ready for the final trial — but only if your vocabulary proves it.',
    flavorText: '"The forest has a thousand words. You must know at least thirty-five."',
    objectives: [
      {
        type: 'learn_words',
        count: 35,
        description: 'Learn 35 total words in the Spirit Forest',
      },
    ],
    rewards: { xp: 550, gold: 100, gems: 3 },
    prerequisiteQuestIds: ['pi_08_elder_grammar'],
  },
  {
    id: 'pi_10_forest_spirit',
    type: 'boss',
    region: 'paa_isaan',
    title: 'The Forest Spirit\'s Trial',
    description: 'A towering presence of light and shadow steps from behind the oldest tree. It speaks to you — in Thai.',
    flavorText: '"มนุษย์ — you have learned much. Now prove you have earned the right to pass."',
    objectives: [
      {
        type: 'perfect_session',
        count: 1,
        description: 'Complete a perfect review session',
      },
      {
        type: 'speaking_score',
        count: 3,
        minimumScore: 75,
        description: 'Score 75+ on 3 speaking cards',
      },
    ],
    rewards: { xp: 900, gold: 160, gems: 5, cardUnlockIds: ['doi_nuea_unlock'] },
    prerequisiteQuestIds: ['pi_09_forest_scholar'],
  },
];

const PAA_ISAAN_SIDE_QUESTS: Quest[] = [
  {
    id: 'pi_side_creatures',
    type: 'side',
    region: 'paa_isaan',
    title: 'Creatures of the Forest',
    description: 'Strange animals watch from the undergrowth. A young tracker offers to teach you their names.',
    flavorText: '"ช้าง นาค กบ — every creature has power here."',
    objectives: [
      {
        type: 'learn_words',
        count: 3,
        cardCategory: 'animal',
        description: 'Learn 3 animal words',
      },
    ],
    rewards: { xp: 130, gold: 25 },
  },
  {
    id: 'pi_side_darkness',
    type: 'side',
    region: 'paa_isaan',
    title: 'Light and Shadow',
    description: 'The forest plays tricks with light. An old painter wants you to name what you see.',
    flavorText: '"มืด สว่าง ลึกลับ — darkness, light, mystery. The forest is all three."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'adjectives_core',
        description: 'Learn 5 descriptive words',
      },
    ],
    rewards: { xp: 140, gold: 25 },
  },
];

// ─── doi_nuea (The Northern Peaks) — 10 story quests ─────────────────────────
// Arc: climb the misty mountains → earn the Temple Guardian's blessing.

const DOI_NUEA_QUESTS: Quest[] = [
  {
    id: 'dn_01_mountain_path',
    type: 'story',
    region: 'doi_nuea',
    title: 'The Mountain Path',
    description: 'The road north winds up through cloud forest. Every step brings colder air and older stones.',
    flavorText: '"ยอดดอย ไม่เคยรอคอย — the peaks wait for no one."',
    objectives: [
      {
        type: 'learn_words',
        count: 8,
        cardCategory: 'nature',
        description: 'Learn 8 mountain nature words',
      },
    ],
    rewards: { xp: 280, gold: 50 },
  },
  {
    id: 'dn_02_lanna_welcome',
    type: 'story',
    region: 'doi_nuea',
    title: 'Welcome to Lanna',
    description: 'The walled city of the north has its own language, its own history, its own pride.',
    flavorText: '"ล้านนา — a million rice fields, a thousand years of kings."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'lanna',
        description: 'Learn 5 Lanna cultural words',
      },
    ],
    rewards: { xp: 300, gold: 55 },
    prerequisiteQuestIds: ['dn_01_mountain_path'],
  },
  {
    id: 'dn_03_temple_dawn',
    type: 'story',
    region: 'doi_nuea',
    title: 'Dawn at the Temple',
    description: 'Monks file out at first light, alms bowls in hand. You are invited to walk with them — if you know the words.',
    flavorText: '"ตักบาตร ทุกวัน — give to monks every day, and the day gives back."',
    objectives: [
      {
        type: 'learn_words',
        count: 6,
        cardCategory: 'temple',
        description: 'Learn 6 temple and Buddhist words',
      },
    ],
    rewards: { xp: 320, gold: 60 },
    prerequisiteQuestIds: ['dn_02_lanna_welcome'],
  },
  {
    id: 'dn_04_craftwork',
    type: 'story',
    region: 'doi_nuea',
    title: 'The Craft Quarter',
    description: 'Weavers, silversmiths, and umbrella makers crowd the workshop streets. Each will only trade with someone who understands their work.',
    flavorText: '"Craft is language. Learn its words."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'professions',
        description: 'Learn 4 craftwork profession words',
      },
    ],
    rewards: { xp: 300, gold: 55 },
    prerequisiteQuestIds: ['dn_03_temple_dawn'],
  },
  {
    id: 'dn_05_meditation_hall',
    type: 'story',
    region: 'doi_nuea',
    title: 'The Meditation Hall',
    description: 'A senior monk teaches meditation to foreigners — once a year, to one who proves worthy.',
    flavorText: '"สมาธิ is not silence. It is the loudest thing you will ever hear."',
    objectives: [
      {
        type: 'review_cards',
        count: 40,
        description: 'Review 40 cards across any sessions',
      },
    ],
    rewards: { xp: 380, gold: 70, gems: 2 },
    prerequisiteQuestIds: ['dn_04_craftwork'],
  },
  {
    id: 'dn_06_healer_hut',
    type: 'story',
    region: 'doi_nuea',
    title: 'The Mountain Healer',
    description: 'An herbalist in the hills has medicines that cannot be found in any city. She only helps those who speak carefully.',
    flavorText: '"เยียวยา — to heal. The word itself must be said with intention."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'body',
        description: 'Learn 4 body and health words',
      },
    ],
    rewards: { xp: 340, gold: 65 },
    prerequisiteQuestIds: ['dn_05_meditation_hall'],
  },
  {
    id: 'dn_07_teacher_test',
    type: 'story',
    region: 'doi_nuea',
    title: 'The Teacher\'s Test',
    description: 'The schoolmaster of the mountain village refuses to let you pass until you can explain things, not just say them.',
    flavorText: '"สอน อธิบาย เข้าใจ — teaching, explaining, understanding. These are one thing."',
    objectives: [
      {
        type: 'learn_words',
        count: 6,
        cardCategory: 'verbs_advanced',
        description: 'Learn 6 advanced action verbs',
      },
    ],
    rewards: { xp: 360, gold: 65, gems: 1 },
    prerequisiteQuestIds: ['dn_06_healer_hut'],
  },
  {
    id: 'dn_08_peak_voice',
    type: 'story',
    region: 'doi_nuea',
    title: 'Voice at the Summit',
    description: 'The peak amplifies every sound. A wrong tone echoes for miles. A right one reaches the temple below.',
    flavorText: '"At this height, tones do not forgive mistakes."',
    objectives: [
      {
        type: 'speaking_score',
        count: 4,
        minimumScore: 72,
        description: 'Score 72+ on 4 speaking cards',
      },
    ],
    rewards: { xp: 420, gold: 80, gems: 2 },
    prerequisiteQuestIds: ['dn_07_teacher_test'],
  },
  {
    id: 'dn_09_northern_mastery',
    type: 'story',
    region: 'doi_nuea',
    title: 'Northern Mastery',
    description: 'The temple abbot will grant you an audience when your knowledge of the north is complete.',
    flavorText: '"ห้าสิบคำ — fifty words. The north is demanding."',
    objectives: [
      {
        type: 'learn_words',
        count: 50,
        description: 'Learn 50 total words in the Northern Peaks',
      },
    ],
    rewards: { xp: 650, gold: 120, gems: 4 },
    prerequisiteQuestIds: ['dn_08_peak_voice'],
  },
  {
    id: 'dn_10_temple_guardian',
    type: 'boss',
    region: 'doi_nuea',
    title: 'The Temple Guardian\'s Trial',
    description: 'Carved in gold at the temple gate, the Guardian stirs. Ancient and patient, it has turned away ten thousand before you.',
    flavorText: '"You have climbed far. Now prove the climb changed you."',
    objectives: [
      {
        type: 'perfect_session',
        count: 1,
        description: 'Complete a perfect review session',
      },
      {
        type: 'speaking_score',
        count: 4,
        minimumScore: 82,
        description: 'Score 82+ on 4 speaking cards',
      },
    ],
    rewards: { xp: 1100, gold: 200, gems: 6, cardUnlockIds: ['talee_tong_unlock'] },
    prerequisiteQuestIds: ['dn_09_northern_mastery'],
  },
];

const DOI_NUEA_SIDE_QUESTS: Quest[] = [
  {
    id: 'dn_side_ancient_time',
    type: 'side',
    region: 'doi_nuea',
    title: 'Chronicles of the North',
    description: 'The temple library holds scrolls written before living memory. A scholar needs a translator.',
    flavorText: '"โบราณกาล — ancient times. Every stone here has a story."',
    objectives: [
      {
        type: 'learn_words',
        count: 4,
        cardCategory: 'time_adv',
        description: 'Learn 4 advanced time words',
      },
    ],
    rewards: { xp: 180, gold: 35 },
  },
  {
    id: 'dn_side_cold_words',
    type: 'side',
    region: 'doi_nuea',
    title: 'Words for Cold Places',
    description: 'A cartographer mapping the high passes needs precise descriptions. She pays in maps — and knowledge.',
    flavorText: '"หนาว ชัน กว้าง สูง — the mountain demands exact words."',
    objectives: [
      {
        type: 'learn_words',
        count: 5,
        cardCategory: 'adjectives_adv',
        description: 'Learn 5 intermediate descriptive words',
      },
    ],
    rewards: { xp: 190, gold: 35 },
  },
];

// ─── All quests ───────────────────────────────────────────────────────────────

export const ALL_QUESTS: Quest[] = [
  ...KRUNG_THON_QUESTS,
  ...KRUNG_THON_SIDE_QUESTS,
  ...PAA_ISAAN_QUESTS,
  ...PAA_ISAAN_SIDE_QUESTS,
  ...DOI_NUEA_QUESTS,
  ...DOI_NUEA_SIDE_QUESTS,
  ...DAILY_QUEST_POOL,
];

export function getQuestsByRegion(region: GameRegion): Quest[] {
  return ALL_QUESTS.filter(q => q.region === region);
}

export function getQuestById(id: string): Quest | undefined {
  return ALL_QUESTS.find(q => q.id === id);
}
