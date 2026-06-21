export interface RewardStats {
  xp: number;
  streak: number;
  wordsMastered: number;
  lessonsCompleted: number;
}

export type FrameId = 'default' | 'silver' | 'gold' | 'diamond' | 'platinum';
export type AvatarPackId = 'starter' | 'animals' | 'nature' | 'symbols' | 'legendary';

export const AVATAR_PACKS: Record<AvatarPackId, string[]> = {
  starter:   ['🐉', '🦅', '🌊', '🔥', '⚡', '🌙', '🌟', '💫', '🎭', '🎯'],
  animals:   ['🦁', '🐯', '🦊', '🐺', '🦋', '🐬', '🦄', '🐼', '🦖', '🐘'],
  nature:    ['🌺', '🌸', '☀️', '🌈', '⛩️', '🎋', '🌿', '🌴', '🍀', '🌻'],
  symbols:   ['⚔️', '🛡️', '🔮', '💎', '🏺', '👁️', '🌀', '🎪', '🗡️', '🔱'],
  legendary: ['👑', '🏆', '💍', '✨', '🎆', '💰', '🏅', '🌠', '☄️', '🐲'],
};

export const FRAME_STYLES: Record<FrameId, { border: string; glow: string; label: string }> = {
  default:  { border: '#252540', glow: 'transparent',  label: 'Default' },
  silver:   { border: '#9ca3af', glow: '#9ca3af30',    label: '🥈 Silver' },
  gold:     { border: '#ffd700', glow: '#ffd70040',    label: '🥇 Gold' },
  diamond:  { border: '#60f0ff', glow: '#60f0ff40',    label: '💠 Diamond' },
  platinum: { border: '#e2e8f0', glow: '#e2e8f060',    label: '✨ Platinum' },
};

export type RewardUnlock =
  | { type: 'avatar-pack'; packId: AvatarPackId; label: string }
  | { type: 'frame'; frameId: FrameId; label: string }
  | { type: 'content'; contentKey: string; label: string };

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (s: RewardStats) => boolean;
  unlocks: RewardUnlock[];
}

export const REWARDS: Reward[] = [
  {
    id: 'first-lesson',
    title: 'Explorer',
    description: 'Complete your first lesson',
    icon: '🌱',
    condition: s => s.lessonsCompleted >= 1,
    unlocks: [{ type: 'avatar-pack', packId: 'animals', label: '🐯 Animal Avatars' }],
  },
  {
    id: 'words-10',
    title: 'Word Collector',
    description: 'Master 10 words',
    icon: '📖',
    condition: s => s.wordsMastered >= 10,
    unlocks: [{ type: 'content', contentKey: 'bonus-slang', label: '🤙 Thai Slang Pack' }],
  },
  {
    id: 'xp-500',
    title: 'Dedicated',
    description: 'Earn 500 XP',
    icon: '⭐',
    condition: s => s.xp >= 500,
    unlocks: [
      { type: 'frame', frameId: 'silver', label: '🥈 Silver Frame' },
      { type: 'avatar-pack', packId: 'nature', label: '🌺 Nature Avatars' },
    ],
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: s => s.streak >= 7,
    unlocks: [{ type: 'frame', frameId: 'gold', label: '🥇 Gold Frame' }],
  },
  {
    id: 'words-50',
    title: 'Vocabularian',
    description: 'Master 50 words',
    icon: '📚',
    condition: s => s.wordsMastered >= 50,
    unlocks: [
      { type: 'avatar-pack', packId: 'symbols', label: '🔮 Symbol Avatars' },
      { type: 'content', contentKey: 'bonus-business', label: '💼 Business Thai Pack' },
    ],
  },
  {
    id: 'xp-1000',
    title: 'Thai Scholar',
    description: 'Earn 1,000 XP',
    icon: '🏆',
    condition: s => s.xp >= 1000,
    unlocks: [{ type: 'frame', frameId: 'diamond', label: '💠 Diamond Frame' }],
  },
  {
    id: 'streak-30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    condition: s => s.streak >= 30,
    unlocks: [
      { type: 'frame', frameId: 'platinum', label: '✨ Platinum Frame' },
      { type: 'avatar-pack', packId: 'legendary', label: '👑 Legendary Avatars' },
      { type: 'content', contentKey: 'bonus-advanced', label: '🎓 Advanced Thai Pack' },
    ],
  },
  {
    id: 'words-100',
    title: 'Thai Master',
    description: 'Master 100 words',
    icon: '🥋',
    condition: s => s.wordsMastered >= 100,
    unlocks: [{ type: 'content', contentKey: 'bonus-culture', label: '🏛️ Thai Culture Pack' }],
  },
];

// Bonus vocabulary content packs (unlocked by rewards)
export const BONUS_PACKS: Record<string, { title: string; icon: string; words: { th: string; rom: string; en: string }[] }> = {
  'bonus-slang': {
    title: 'Thai Slang',
    icon: '🤙',
    words: [
      { th: 'เจ๋ง',     rom: 'jěng',       en: 'cool / awesome' },
      { th: 'ชิลๆ',     rom: 'chin-chin',   en: 'chill / relaxed' },
      { th: 'โอเค',     rom: 'oh-keh',      en: 'okay (loanword)' },
      { th: 'เด็ดมาก',  rom: 'dèt-mâak',   en: 'super great' },
      { th: 'แจ่ม',     rom: 'jàem',        en: 'awesome / brilliant' },
      { th: 'กิน',      rom: 'gin',         en: 'to eat (informal)' },
      { th: 'นัด',      rom: 'nát',         en: 'to meet up' },
      { th: 'ปัง',      rom: 'pang',        en: 'on point / stunning' },
    ],
  },
  'bonus-business': {
    title: 'Business Thai',
    icon: '💼',
    words: [
      { th: 'ประชุม',   rom: 'prà-chum',    en: 'meeting' },
      { th: 'สัญญา',   rom: 'sǎn-yaa',     en: 'contract' },
      { th: 'บริษัท',  rom: 'bor-rí-sàt',  en: 'company' },
      { th: 'ลูกค้า',  rom: 'lûuk-kháa',   en: 'customer' },
      { th: 'โครงการ', rom: 'khrong-gaan',  en: 'project' },
      { th: 'กำไร',    rom: 'gam-rai',      en: 'profit' },
      { th: 'ราคา',    rom: 'raa-khaa',     en: 'price' },
      { th: 'นำเสนอ',  rom: 'nam-sà-něr',  en: 'to present' },
    ],
  },
  'bonus-advanced': {
    title: 'Advanced Thai',
    icon: '🎓',
    words: [
      { th: 'แม้ว่า',   rom: 'máe-wâa',    en: 'even though' },
      { th: 'ทั้งๆ ที่', rom: 'tháng-tháng-thîi', en: 'despite' },
      { th: 'เนื่องจาก', rom: 'nêuang-jàak', en: 'because of' },
      { th: 'อย่างไรก็ตาม', rom: 'yàang-rai-gôr-taam', en: 'however' },
      { th: 'นอกจากนี้', rom: 'nôk-jàak-níi', en: 'furthermore' },
      { th: 'กล่าวคือ',  rom: 'glàao-kheu',  en: 'that is to say' },
      { th: 'ดังนั้น',   rom: 'dang-nán',    en: 'therefore' },
      { th: 'ประการแรก', rom: 'prà-gaan-râek', en: 'firstly' },
    ],
  },
  'bonus-culture': {
    title: 'Thai Culture',
    icon: '🏛️',
    words: [
      { th: 'วัด',      rom: 'wát',          en: 'temple' },
      { th: 'เจดีย์',  rom: 'jeh-dee',       en: 'pagoda / stupa' },
      { th: 'ไหว้',    rom: 'wâi',           en: 'respectful greeting gesture' },
      { th: 'สงกรานต์', rom: 'sǒng-graan',   en: 'Thai New Year festival' },
      { th: 'ลอยกระทง', rom: 'loi-grà-tong', en: 'floating lantern festival' },
      { th: 'ตลาดนัด',  rom: 'tà-làat-nát',  en: 'weekend market' },
      { th: 'นาฏศิลป์', rom: 'nâat-sǐn',     en: 'classical Thai dance' },
      { th: 'มวยไทย',  rom: 'muay-thai',      en: 'Thai boxing' },
    ],
  },
};
