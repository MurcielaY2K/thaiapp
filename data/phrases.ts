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
  {
    key: 'colors',
    th: 'สี',
    label: 'Colors',
    icon: '🎨',
    sentences: [
      {
        tokens: [
          { th: 'เสื้อ', rom: 'sɯ̂a', en: 'shirt' },
          { th: 'สี', rom: 'sǐi', en: 'color' },
          { th: 'อะไร', rom: 'à-rai', en: 'what' },
        ],
        en: 'What color is the shirt?',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ชอบ', rom: 'chɔ̂ɔp', en: 'like' },
          { th: 'สี', rom: 'sǐi', en: 'color' },
          { th: 'แดง', rom: 'dɛɛng', en: 'red' },
        ],
        en: 'I like red.',
      },
      {
        tokens: [
          { th: 'ท้องฟ้า', rom: 'tɔ́ɔng-fáa', en: 'sky' },
          { th: 'สี', rom: 'sǐi', en: 'color' },
          { th: 'ฟ้า', rom: 'fáa', en: 'light blue' },
        ],
        en: 'The sky is blue.',
      },
      {
        tokens: [
          { th: 'มี', rom: 'mii', en: 'have' },
          { th: 'สี', rom: 'sǐi', en: 'color' },
          { th: 'อื่น', rom: 'ɯ̀ɯn', en: 'other' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Do you have other colors?',
      },
    ],
  },
  {
    key: 'health',
    th: 'สุขภาพ',
    label: 'Health',
    icon: '🏥',
    sentences: [
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ไม่', rom: 'mâi', en: 'not' },
          { th: 'สบาย', rom: 'sà-baai', en: 'well' },
        ],
        en: "I'm not feeling well.",
      },
      {
        tokens: [
          { th: 'ปวด', rom: 'pùat', en: 'ache / hurt' },
          { th: 'หัว', rom: 'hǔa', en: 'head' },
        ],
        en: 'I have a headache.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ต้องการ', rom: 'tɔ̂ng-kaan', en: 'need' },
          { th: 'หมอ', rom: 'mɔ̌ɔ', en: 'doctor' },
        ],
        en: 'I need a doctor.',
      },
      {
        tokens: [
          { th: 'โรงพยาบาล', rom: 'roong-phá-yaa-baan', en: 'hospital' },
          { th: 'อยู่', rom: 'yùu', en: 'is (located)' },
          { th: 'ที่ไหน', rom: 'thîi-nǎi', en: 'where' },
        ],
        en: 'Where is the hospital?',
      },
      {
        tokens: [
          { th: 'ช่วย', rom: 'chûay', en: 'help' },
          { th: 'ด้วย', rom: 'dûay', en: '[please / with]' },
        ],
        en: 'Help!',
      },
    ],
  },
  {
    key: 'hotel',
    th: 'โรงแรม',
    label: 'Hotel',
    icon: '🏨',
    sentences: [
      {
        tokens: [
          { th: 'มี', rom: 'mii', en: 'have' },
          { th: 'ห้อง', rom: 'hɔ̂ng', en: 'room' },
          { th: 'ว่าง', rom: 'wâang', en: 'vacant / free' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Do you have a room available?',
      },
      {
        tokens: [
          { th: 'ราคา', rom: 'raa-khaa', en: 'price' },
          { th: 'เท่าไร', rom: 'thâo-rai', en: 'how much' },
        ],
        en: "What's the price?",
      },
      {
        tokens: [
          { th: 'ขอ', rom: 'khɔ̌ɔ', en: 'may I have' },
          { th: 'กุญแจ', rom: 'kun-jɛɛ', en: 'key' },
          { th: 'ห้อง', rom: 'hɔ̂ng', en: 'room' },
        ],
        en: 'May I have the room key.',
      },
      {
        tokens: [
          { th: 'ไวไฟ', rom: 'wai-faai', en: 'wifi' },
          { th: 'รหัส', rom: 'rá-hàt', en: 'password / code' },
          { th: 'อะไร', rom: 'à-rai', en: 'what' },
        ],
        en: "What's the wifi password?",
      },
    ],
  },
  {
    key: 'feelings',
    th: 'ความรู้สึก',
    label: 'Feelings',
    icon: '😊',
    sentences: [
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'มี', rom: 'mii', en: 'have' },
          { th: 'ความสุข', rom: 'khwaam-sùk', en: 'happiness' },
        ],
        en: "I'm happy.",
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'เหนื่อย', rom: 'nɯ̀ay', en: 'tired' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: "I'm very tired.",
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'คิดถึง', rom: 'khít-thǔng', en: 'miss (someone)' },
          { th: 'คุณ', rom: 'khun', en: 'you' },
        ],
        en: 'I miss you.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ดีใจ', rom: 'dii-jai', en: 'glad' },
          { th: 'ที่', rom: 'thîi', en: 'that' },
          { th: 'ได้', rom: 'dâai', en: 'got to' },
          { th: 'เจอ', rom: 'jɤɤ', en: 'meet' },
          { th: 'คุณ', rom: 'khun', en: 'you' },
        ],
        en: "I'm glad to meet you.",
      },
    ],
  },
  {
    key: 'weather',
    th: 'อากาศ',
    label: 'Weather',
    icon: '🌦️',
    sentences: [
      {
        tokens: [
          { th: 'วันนี้', rom: 'wan-níi', en: 'today' },
          { th: 'อากาศ', rom: 'aa-kàat', en: 'weather' },
          { th: 'ดี', rom: 'dii', en: 'good / nice' },
        ],
        en: 'The weather is nice today.',
      },
      {
        tokens: [
          { th: 'ร้อน', rom: 'rɔ́ɔn', en: 'hot' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: "It's very hot.",
      },
      {
        tokens: [
          { th: 'ฝน', rom: 'fǒn', en: 'rain' },
          { th: 'ตก', rom: 'tòk', en: 'fall' },
        ],
        en: "It's raining.",
      },
      {
        tokens: [
          { th: 'พรุ่งนี้', rom: 'phrûng-níi', en: 'tomorrow' },
          { th: 'ฝน', rom: 'fǒn', en: 'rain' },
          { th: 'จะ', rom: 'jà', en: '[future marker]' },
          { th: 'ตก', rom: 'tòk', en: 'fall' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Will it rain tomorrow?',
      },
    ],
  },
  {
    key: 'numbers',
    th: 'ตัวเลข',
    label: 'Numbers',
    icon: '🔢',
    sentences: [
      {
        tokens: [
          { th: 'หนึ่ง', rom: 'nɯ̀ng', en: 'one' },
          { th: 'สอง', rom: 'sɔ̌ɔng', en: 'two' },
          { th: 'สาม', rom: 'sǎam', en: 'three' },
        ],
        en: 'One, two, three.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'อายุ', rom: 'aa-yú', en: 'age' },
          { th: 'สาม', rom: 'sǎam', en: 'three' },
          { th: 'สิบ', rom: 'sìp', en: 'ten' },
          { th: 'ปี', rom: 'pii', en: 'year' },
        ],
        en: 'I am thirty years old.',
      },
      {
        tokens: [
          { th: 'ขอ', rom: 'khɔ̌ɔ', en: 'may I have' },
          { th: 'สอง', rom: 'sɔ̌ɔng', en: 'two' },
          { th: 'ที่', rom: 'thîi', en: '[seats / portions]' },
        ],
        en: 'A table for two, please.',
      },
      {
        tokens: [
          { th: 'รวม', rom: 'ruam', en: 'total' },
          { th: 'ทั้งหมด', rom: 'táng-mòt', en: 'all together' },
          { th: 'เท่าไร', rom: 'thâo-rai', en: 'how much' },
        ],
        en: 'How much is it all together?',
      },
    ],
  },
  {
    key: 'slang',
    th: 'คำแสลง',
    label: 'Slang',
    icon: '💬',
    sentences: [
      {
        tokens: [
          { th: 'หนัง', rom: 'nǎng', en: 'movie' },
          { th: 'เรื่อง', rom: 'rɯ̂ang', en: '[title / classifier]' },
          { th: 'นี้', rom: 'níi', en: 'this' },
          { th: 'ปัง', rom: 'pang', en: 'awesome / a hit (slang)' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: 'This movie is amazing.',
      },
      {
        tokens: [
          { th: 'ร้าน', rom: 'ráan', en: 'shop / eatery' },
          { th: 'นี้', rom: 'níi', en: 'this' },
          { th: 'อาหาร', rom: 'aa-hǎan', en: 'food' },
          { th: 'แซ่บ', rom: 'sɛ̂ɛp', en: 'banging / delicious (slang)' },
        ],
        en: 'The food here is so good.',
      },
      {
        tokens: [
          { th: 'จริง', rom: 'jing', en: 'true / really' },
          { th: 'ดิ', rom: 'dì', en: '[emphatic particle]' },
        ],
        en: 'For real?',
      },
      {
        tokens: [
          { th: 'วันนี้', rom: 'wan-níi', en: 'today' },
          { th: 'ขอ', rom: 'khɔ̌ɔ', en: 'let me' },
          { th: 'ชิลๆ', rom: 'chiu-chiu', en: 'chill out (slang)' },
        ],
        en: 'Today I just want to chill.',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'งง', rom: 'ngong', en: 'confused (slang)' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: "I'm so confused.",
      },
      {
        tokens: [
          { th: 'เขา', rom: 'khǎo', en: 'he / she' },
          { th: 'เทพ', rom: 'thêep', en: 'a pro / godlike (slang)' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
          { th: 'เลย', rom: 'lɤɤy', en: '[emphasis]' },
        ],
        en: 'They are seriously a pro.',
      },
    ],
  },
  {
    key: 'movies',
    th: 'หนังและซีรีส์',
    label: 'Movies & Series',
    icon: '🎬',
    sentences: [
      {
        tokens: [
          { th: 'คืนนี้', rom: 'khɯɯn-níi', en: 'tonight' },
          { th: 'ดู', rom: 'duu', en: 'watch' },
          { th: 'หนัง', rom: 'nǎng', en: 'movie' },
          { th: 'กัน', rom: 'kan', en: 'together' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Want to watch a movie tonight?',
      },
      {
        tokens: [
          { th: 'มี', rom: 'mii', en: 'have' },
          { th: 'ซีรีส์', rom: 'sii-rîi', en: 'series' },
          { th: 'อะไร', rom: 'à-rai', en: 'what / any' },
          { th: 'แนะนำ', rom: 'nɛ́-nam', en: 'recommend' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Any series to recommend?',
      },
      {
        tokens: [
          { th: 'เรื่อง', rom: 'rɯ̂ang', en: 'story / title' },
          { th: 'นี้', rom: 'níi', en: 'this' },
          { th: 'สนุก', rom: 'sà-nùk', en: 'fun / entertaining' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: 'This one is really fun.',
      },
      {
        tokens: [
          { th: 'อย่า', rom: 'yàa', en: "don't" },
          { th: 'สปอยล์', rom: 'sà-pɔɔy', en: 'spoil / spoiler' },
          { th: 'นะ', rom: 'ná', en: '[softening particle]' },
        ],
        en: "Don't spoil it!",
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ดู', rom: 'duu', en: 'watch' },
          { th: 'จบ', rom: 'jòp', en: 'finish' },
          { th: 'แล้ว', rom: 'lɛ́ɛw', en: 'already' },
        ],
        en: 'I already finished watching it.',
      },
      {
        tokens: [
          { th: 'พระเอก', rom: 'phrá-èek', en: 'male lead' },
          { th: 'หล่อ', rom: 'lɔ̀ɔ', en: 'handsome' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: 'The male lead is so handsome.',
      },
    ],
  },
  {
    key: 'online',
    th: 'ออนไลน์',
    label: 'Online',
    icon: '📱',
    sentences: [
      {
        tokens: [
          { th: 'เปิด', rom: 'pɤ̀ɤt', en: 'open / turn on' },
          { th: 'เน็ตฟลิกซ์', rom: 'nét-flíks', en: 'Netflix' },
          { th: 'หน่อย', rom: 'nɔ̀i', en: '[a bit / please]' },
        ],
        en: 'Put on Netflix.',
      },
      {
        tokens: [
          { th: 'กด', rom: 'kòt', en: 'press / tap' },
          { th: 'ติดตาม', rom: 'tìt-taam', en: 'follow' },
          { th: 'ด้วย', rom: 'dûay', en: 'too / also' },
          { th: 'นะ', rom: 'ná', en: '[particle]' },
        ],
        en: 'Hit follow too, okay?',
      },
      {
        tokens: [
          { th: 'ฉัน', rom: 'chǎn', en: 'I / me' },
          { th: 'ไลก์', rom: 'láai', en: 'like' },
          { th: 'โพสต์', rom: 'póost', en: 'post' },
          { th: 'ของ', rom: 'khɔ̌ɔng', en: 'of' },
          { th: 'คุณ', rom: 'khun', en: 'you' },
          { th: 'แล้ว', rom: 'lɛ́ɛw', en: 'already' },
        ],
        en: 'I already liked your post.',
      },
      {
        tokens: [
          { th: 'เน็ต', rom: 'nét', en: 'internet' },
          { th: 'ช้า', rom: 'cháa', en: 'slow' },
          { th: 'มาก', rom: 'mâak', en: 'very' },
        ],
        en: 'The internet is so slow.',
      },
      {
        tokens: [
          { th: 'แชร์', rom: 'chɛɛ', en: 'share' },
          { th: 'ให้', rom: 'hâi', en: '[for me]' },
          { th: 'หน่อย', rom: 'nɔ̀i', en: 'a bit' },
          { th: 'ได้', rom: 'dâai', en: 'can / able' },
          { th: 'ไหม', rom: 'mǎi', en: '[question particle]' },
        ],
        en: 'Can you share it for me?',
      },
      {
        tokens: [
          { th: 'มือถือ', rom: 'mɯɯ-thɯ̌ɯ', en: 'mobile phone' },
          { th: 'ฉัน', rom: 'chǎn', en: 'my' },
          { th: 'แบต', rom: 'bɛ̀t', en: 'battery' },
          { th: 'หมด', rom: 'mòt', en: 'run out / dead' },
        ],
        en: "My phone's battery is dead.",
      },
    ],
  },
];
