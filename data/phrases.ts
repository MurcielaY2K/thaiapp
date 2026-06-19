import type { Sentence } from './reading';

// Context sentences grouped by everyday category. Each word is glossed so a
// learner can tap it to hear it and see how vocabulary is used in real phrases.

export interface PhraseCategory {
  key: string;
  th: string;     // Thai label
  label: string;  // English label
  icon: string;   // emoji shown in the tab
  sentences: Sentence[];
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    key: 'greetings',
    th: 'ทักทาย',
    label: 'Greetings',
    icon: '🙏',
    sentences: [
      {
        tokens: [
          { th: 'สวัสดี', rom: 'sà-wàt-dii', en: 'hello' },
          { th: 'ครับ', rom: 'khráp', en: '[polite particle, male]' },
        ],
        en: 'Hello.',
      },
      {
        tokens: [
          { th: 'คุณ', rom: 'khun', en: 'you' },
          { th: 'สบาย', rom: 'sà-baai', en: 'well / comfortable' },
          { th: 'ดี', rom: 'dii', en: 'good' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'How are you?',
      },
      {
        tokens: [
          { th: 'ขอบคุณ', rom: 'khɔ̀ɔp-khun', en: 'thank you' },
          { th: 'มาก', rom: 'mâak', en: 'very / a lot' },
          { th: 'ครับ', rom: 'khráp', en: '[polite particle]' },
        ],
        en: 'Thank you very much.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ไม่', rom: 'mâi', en: 'not' },
          { th: 'เข้าใจ', rom: 'khâo-jai', en: 'understand' },
        ],
        en: "I don't understand.",
      },
      {
        tokens: [
          { th: 'พูด', rom: 'phûut', en: 'speak' },
          { th: 'ช้าๆ', rom: 'cháa-cháa', en: 'slowly' },
          { th: 'ได้', rom: 'dâai', en: 'can / able' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Can you speak slowly?',
      },
    ],
  },
  {
    key: 'food',
    th: 'อาหาร',
    label: 'Food',
    icon: '🍜',
    sentences: [
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'หิว', rom: 'hǐu', en: 'hungry' },
          { th: 'ข้าว', rom: 'khâao', en: 'rice / food' },
        ],
        en: "I'm hungry.",
      },
      {
        tokens: [
          { th: 'อาหาร', rom: 'aa-hǎan', en: 'food' },
          { th: 'อร่อย', rom: 'à-rɔ̀i', en: 'delicious' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: 'The food is very delicious.',
      },
      {
        tokens: [
          { th: 'ขอ', rom: 'khɔ̌ɔ', en: 'may I have' },
          { th: 'น้ำ', rom: 'náam', en: 'water' },
          { th: 'หนึ่ง', rom: 'nɯ̀ng', en: 'one' },
          { th: 'แก้ว', rom: 'kɛ̂ɛw', en: 'glass' },
        ],
        en: 'May I have a glass of water.',
      },
      {
        tokens: [
          { th: 'ไม่', rom: 'mâi', en: 'not' },
          { th: 'เผ็ด', rom: 'phèt', en: 'spicy' },
          { th: 'ครับ', rom: 'khráp', en: '[polite particle]' },
        ],
        en: 'Not spicy, please.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ชอบ', rom: 'chɔ̂ɔp', en: 'like' },
          { th: 'ผัดไทย', rom: 'phàt-thai', en: 'pad thai' },
        ],
        en: 'I like pad thai.',
      },
    ],
  },
  {
    key: 'shopping',
    th: 'ซื้อของ',
    label: 'Shopping',
    icon: '🛍️',
    sentences: [
      {
        tokens: [
          { th: 'อันนี้', rom: 'an-níi', en: 'this one' },
          { th: 'เท่าไร', rom: 'thâo-rai', en: 'how much' },
        ],
        en: 'How much is this?',
      },
      {
        tokens: [
          { th: 'แพง', rom: 'phɛɛng', en: 'expensive' },
          { th: 'เกินไป', rom: 'kɤɤn-pai', en: 'too much' },
        ],
        en: 'Too expensive.',
      },
      {
        tokens: [
          { th: 'ลด', rom: 'lót', en: 'reduce / discount' },
          { th: 'ได้', rom: 'dâai', en: 'can / able' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Can you lower the price?',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ซื้อ', rom: 'sɯ́ɯ', en: 'buy' },
          { th: 'อันนี้', rom: 'an-níi', en: 'this one' },
        ],
        en: "I'll buy this one.",
      },
      {
        tokens: [
          { th: 'สอง', rom: 'sɔ̌ɔng', en: 'two' },
          { th: 'ร้อย', rom: 'rɔ́ɔi', en: 'hundred' },
          { th: 'บาท', rom: 'bàat', en: 'baht' },
        ],
        en: 'Two hundred baht.',
      },
    ],
  },
  {
    key: 'travel',
    th: 'เดินทาง',
    label: 'Travel',
    icon: '🗺️',
    sentences: [
      {
        tokens: [
          { th: 'ห้องน้ำ', rom: 'hɔ̂ng-náam', en: 'bathroom' },
          { th: 'อยู่', rom: 'yùu', en: 'is (located)' },
          { th: 'ที่ไหน', rom: 'thîi-nǎi', en: 'where' },
        ],
        en: 'Where is the bathroom?',
      },
      {
        tokens: [
          { th: 'ไป', rom: 'pai', en: 'go' },
          { th: 'ตลาด', rom: 'tà-làat', en: 'market' },
          { th: 'ยังไง', rom: 'yang-ngai', en: 'how' },
        ],
        en: 'How do I get to the market?',
      },
      {
        tokens: [
          { th: 'เลี้ยว', rom: 'líaw', en: 'turn' },
          { th: 'ซ้าย', rom: 'sáai', en: 'left' },
        ],
        en: 'Turn left.',
      },
      {
        tokens: [
          { th: 'ตรงไป', rom: 'trong-pai', en: 'straight ahead' },
          { th: 'ครับ', rom: 'khráp', en: '[polite particle]' },
        ],
        en: 'Go straight ahead.',
      },
      {
        tokens: [
          { th: 'ไกล', rom: 'klai', en: 'far' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Is it far?',
      },
    ],
  },
  {
    key: 'time',
    th: 'เวลา',
    label: 'Time',
    icon: '🕒',
    sentences: [
      {
        tokens: [
          { th: 'วันนี้', rom: 'wan-níi', en: 'today' },
          { th: 'วัน', rom: 'wan', en: 'day' },
          { th: 'อะไร', rom: 'à-rai', en: 'what' },
        ],
        en: 'What day is it today?',
      },
      {
        tokens: [
          { th: 'ตอนนี้', rom: 'tɔɔn-níi', en: 'now' },
          { th: 'กี่', rom: 'kìi', en: 'how many' },
          { th: 'โมง', rom: 'moong', en: "o'clock" },
        ],
        en: 'What time is it now?',
      },
      {
        tokens: [
          { th: 'พรุ่งนี้', rom: 'phrûng-níi', en: 'tomorrow' },
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ไป', rom: 'pai', en: 'go' },
          { th: 'ทำงาน', rom: 'tham-ngaan', en: 'work' },
        ],
        en: 'Tomorrow I go to work.',
      },
      {
        tokens: [
          { th: 'เจอ', rom: 'jɤɤ', en: 'meet' },
          { th: 'กัน', rom: 'kan', en: 'together / each other' },
          { th: 'พรุ่งนี้', rom: 'phrûng-níi', en: 'tomorrow' },
        ],
        en: 'See you tomorrow.',
      },
    ],
  },
  {
    key: 'family',
    th: 'ครอบครัว',
    label: 'Family',
    icon: '👪',
    sentences: [
      {
        tokens: [
          { th: 'นี่', rom: 'nîi', en: 'this' },
          { th: 'คือ', rom: 'khɯɯ', en: 'is' },
          { th: 'ครอบครัว', rom: 'khrɔ̂ɔp-khrua', en: 'family' },
          { th: 'ของ', rom: 'khɔ̌ɔng', en: 'of' },
          { th: 'ฉัน', rom: 'chǎn', en: 'me / my' },
        ],
        en: 'This is my family.',
      },
      {
        tokens: [
          { th: 'พ่อ', rom: 'phɔ̂ɔ', en: 'father' },
          { th: 'กับ', rom: 'kàp', en: 'and / with' },
          { th: 'แม่', rom: 'mɛ̂ɛ', en: 'mother' },
        ],
        en: 'Father and mother.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'มี', rom: 'mii', en: 'have' },
          { th: 'พี่', rom: 'phîi', en: 'older sibling' },
          { th: 'สอง', rom: 'sɔ̌ɔng', en: 'two' },
          { th: 'คน', rom: 'khon', en: '[classifier for people]' },
        ],
        en: 'I have two older siblings.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'รัก', rom: 'rák', en: 'love' },
          { th: 'ครอบครัว', rom: 'khrɔ̂ɔp-khrua', en: 'family' },
        ],
        en: 'I love my family.',
      },
    ],
  },
];
