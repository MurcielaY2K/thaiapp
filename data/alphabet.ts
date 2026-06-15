// The Thai writing system: 44 consonants, the core vowels, and Thai numerals.
// `name` is the traditional spelling name Thai children learn (e.g. ก = "ko kai").
// `sound` is the practical Latin sound used when reading.

export type CharType = 'consonant' | 'vowel' | 'number';

export interface ThaiChar {
  id: string;
  char: string;
  name: string;   // traditional name, e.g. "ko kai"
  meaning: string; // what the name word means, e.g. "chicken"
  sound: string;  // practical sound, e.g. "k"
  type: CharType;
}

export const CONSONANTS: ThaiChar[] = [
  { id: 'c01', char: 'ก', name: 'ko kai', meaning: 'chicken', sound: 'g/k', type: 'consonant' },
  { id: 'c02', char: 'ข', name: 'kho khai', meaning: 'egg', sound: 'k', type: 'consonant' },
  { id: 'c03', char: 'ฃ', name: 'kho khuat', meaning: 'bottle (obsolete)', sound: 'k', type: 'consonant' },
  { id: 'c04', char: 'ค', name: 'kho khwai', meaning: 'buffalo', sound: 'k', type: 'consonant' },
  { id: 'c05', char: 'ฅ', name: 'kho khon', meaning: 'person (obsolete)', sound: 'k', type: 'consonant' },
  { id: 'c06', char: 'ฆ', name: 'kho rakhang', meaning: 'bell', sound: 'k', type: 'consonant' },
  { id: 'c07', char: 'ง', name: 'ngo ngu', meaning: 'snake', sound: 'ng', type: 'consonant' },
  { id: 'c08', char: 'จ', name: 'cho chan', meaning: 'plate', sound: 'j', type: 'consonant' },
  { id: 'c09', char: 'ฉ', name: 'cho ching', meaning: 'cymbals', sound: 'ch', type: 'consonant' },
  { id: 'c10', char: 'ช', name: 'cho chang', meaning: 'elephant', sound: 'ch', type: 'consonant' },
  { id: 'c11', char: 'ซ', name: 'so so', meaning: 'chain', sound: 's', type: 'consonant' },
  { id: 'c12', char: 'ฌ', name: 'cho choe', meaning: 'tree', sound: 'ch', type: 'consonant' },
  { id: 'c13', char: 'ญ', name: 'yo ying', meaning: 'woman', sound: 'y', type: 'consonant' },
  { id: 'c14', char: 'ฎ', name: 'do chada', meaning: 'headdress', sound: 'd', type: 'consonant' },
  { id: 'c15', char: 'ฏ', name: 'to patak', meaning: 'goad', sound: 't', type: 'consonant' },
  { id: 'c16', char: 'ฐ', name: 'tho than', meaning: 'pedestal', sound: 't', type: 'consonant' },
  { id: 'c17', char: 'ฑ', name: 'tho montho', meaning: 'Montho', sound: 't', type: 'consonant' },
  { id: 'c18', char: 'ฒ', name: 'tho phuthao', meaning: 'elder', sound: 't', type: 'consonant' },
  { id: 'c19', char: 'ณ', name: 'no nen', meaning: 'novice monk', sound: 'n', type: 'consonant' },
  { id: 'c20', char: 'ด', name: 'do dek', meaning: 'child', sound: 'd', type: 'consonant' },
  { id: 'c21', char: 'ต', name: 'to tao', meaning: 'turtle', sound: 'dt/t', type: 'consonant' },
  { id: 'c22', char: 'ถ', name: 'tho thung', meaning: 'sack', sound: 't', type: 'consonant' },
  { id: 'c23', char: 'ท', name: 'tho thahan', meaning: 'soldier', sound: 't', type: 'consonant' },
  { id: 'c24', char: 'ธ', name: 'tho thong', meaning: 'flag', sound: 't', type: 'consonant' },
  { id: 'c25', char: 'น', name: 'no nu', meaning: 'mouse', sound: 'n', type: 'consonant' },
  { id: 'c26', char: 'บ', name: 'bo baimai', meaning: 'leaf', sound: 'b', type: 'consonant' },
  { id: 'c27', char: 'ป', name: 'po pla', meaning: 'fish', sound: 'bp/p', type: 'consonant' },
  { id: 'c28', char: 'ผ', name: 'pho phueng', meaning: 'bee', sound: 'p', type: 'consonant' },
  { id: 'c29', char: 'ฝ', name: 'fo fa', meaning: 'lid', sound: 'f', type: 'consonant' },
  { id: 'c30', char: 'พ', name: 'pho phan', meaning: 'tray', sound: 'p', type: 'consonant' },
  { id: 'c31', char: 'ฟ', name: 'fo fan', meaning: 'teeth', sound: 'f', type: 'consonant' },
  { id: 'c32', char: 'ภ', name: 'pho samphao', meaning: 'sailboat', sound: 'p', type: 'consonant' },
  { id: 'c33', char: 'ม', name: 'mo ma', meaning: 'horse', sound: 'm', type: 'consonant' },
  { id: 'c34', char: 'ย', name: 'yo yak', meaning: 'giant', sound: 'y', type: 'consonant' },
  { id: 'c35', char: 'ร', name: 'ro ruea', meaning: 'boat', sound: 'r', type: 'consonant' },
  { id: 'c36', char: 'ล', name: 'lo ling', meaning: 'monkey', sound: 'l', type: 'consonant' },
  { id: 'c37', char: 'ว', name: 'wo waen', meaning: 'ring', sound: 'w', type: 'consonant' },
  { id: 'c38', char: 'ศ', name: 'so sala', meaning: 'pavilion', sound: 's', type: 'consonant' },
  { id: 'c39', char: 'ษ', name: 'so ruesi', meaning: 'hermit', sound: 's', type: 'consonant' },
  { id: 'c40', char: 'ส', name: 'so suea', meaning: 'tiger', sound: 's', type: 'consonant' },
  { id: 'c41', char: 'ห', name: 'ho hip', meaning: 'chest/box', sound: 'h', type: 'consonant' },
  { id: 'c42', char: 'ฬ', name: 'lo chula', meaning: 'kite', sound: 'l', type: 'consonant' },
  { id: 'c43', char: 'อ', name: 'o ang', meaning: 'basin', sound: 'o/silent', type: 'consonant' },
  { id: 'c44', char: 'ฮ', name: 'ho nokhuk', meaning: 'owl', sound: 'h', type: 'consonant' },
];

// Core vowels shown with the placeholder อ to indicate where the consonant sits.
export const VOWELS: ThaiChar[] = [
  { id: 'v01', char: 'อะ', name: 'sara a', meaning: 'short a', sound: 'a', type: 'vowel' },
  { id: 'v02', char: 'อา', name: 'sara aa', meaning: 'long a', sound: 'aa', type: 'vowel' },
  { id: 'v03', char: 'อิ', name: 'sara i', meaning: 'short i', sound: 'i', type: 'vowel' },
  { id: 'v04', char: 'อี', name: 'sara ii', meaning: 'long i', sound: 'ee', type: 'vowel' },
  { id: 'v05', char: 'อึ', name: 'sara ue', meaning: 'short ue', sound: 'ue', type: 'vowel' },
  { id: 'v06', char: 'อื', name: 'sara uee', meaning: 'long ue', sound: 'uee', type: 'vowel' },
  { id: 'v07', char: 'อุ', name: 'sara u', meaning: 'short u', sound: 'u', type: 'vowel' },
  { id: 'v08', char: 'อู', name: 'sara uu', meaning: 'long u', sound: 'oo', type: 'vowel' },
  { id: 'v09', char: 'เอะ', name: 'sara e', meaning: 'short e', sound: 'e', type: 'vowel' },
  { id: 'v10', char: 'เอ', name: 'sara ee', meaning: 'long e', sound: 'ay', type: 'vowel' },
  { id: 'v11', char: 'แอะ', name: 'sara ae', meaning: 'short ae', sound: 'ae', type: 'vowel' },
  { id: 'v12', char: 'แอ', name: 'sara aae', meaning: 'long ae', sound: 'aae', type: 'vowel' },
  { id: 'v13', char: 'โอะ', name: 'sara o', meaning: 'short o', sound: 'o', type: 'vowel' },
  { id: 'v14', char: 'โอ', name: 'sara oo', meaning: 'long o', sound: 'oh', type: 'vowel' },
  { id: 'v15', char: 'เอาะ', name: 'sara aw', meaning: 'short aw', sound: 'aw', type: 'vowel' },
  { id: 'v16', char: 'ออ', name: 'sara aaw', meaning: 'long aw', sound: 'or', type: 'vowel' },
  { id: 'v17', char: 'เออ', name: 'sara oe', meaning: 'oe', sound: 'er', type: 'vowel' },
  { id: 'v18', char: 'เอีย', name: 'sara ia', meaning: 'ia', sound: 'ia', type: 'vowel' },
  { id: 'v19', char: 'เอือ', name: 'sara uea', meaning: 'uea', sound: 'uea', type: 'vowel' },
  { id: 'v20', char: 'อัว', name: 'sara ua', meaning: 'ua', sound: 'ua', type: 'vowel' },
  { id: 'v21', char: 'ไอ', name: 'sara ai (maimalai)', meaning: 'ai', sound: 'ai', type: 'vowel' },
  { id: 'v22', char: 'ใอ', name: 'sara ai (maimuan)', meaning: 'ai', sound: 'ai', type: 'vowel' },
  { id: 'v23', char: 'เอา', name: 'sara ao', meaning: 'ao', sound: 'ao', type: 'vowel' },
  { id: 'v24', char: 'อำ', name: 'sara am', meaning: 'am', sound: 'am', type: 'vowel' },
];

export const NUMBERS: ThaiChar[] = [
  { id: 'n00', char: '๐', name: 'soon', meaning: 'zero', sound: '0', type: 'number' },
  { id: 'n01', char: '๑', name: 'nueng', meaning: 'one', sound: '1', type: 'number' },
  { id: 'n02', char: '๒', name: 'song', meaning: 'two', sound: '2', type: 'number' },
  { id: 'n03', char: '๓', name: 'sam', meaning: 'three', sound: '3', type: 'number' },
  { id: 'n04', char: '๔', name: 'si', meaning: 'four', sound: '4', type: 'number' },
  { id: 'n05', char: '๕', name: 'ha', meaning: 'five', sound: '5', type: 'number' },
  { id: 'n06', char: '๖', name: 'hok', meaning: 'six', sound: '6', type: 'number' },
  { id: 'n07', char: '๗', name: 'jet', meaning: 'seven', sound: '7', type: 'number' },
  { id: 'n08', char: '๘', name: 'paet', meaning: 'eight', sound: '8', type: 'number' },
  { id: 'n09', char: '๙', name: 'kao', meaning: 'nine', sound: '9', type: 'number' },
];

export interface CharGroup {
  key: CharType;
  label: string;
  emoji: string;
  chars: ThaiChar[];
}

export const CHAR_GROUPS: CharGroup[] = [
  { key: 'consonant', label: 'Consonants', emoji: 'ก', chars: CONSONANTS },
  { key: 'vowel', label: 'Vowels', emoji: 'อา', chars: VOWELS },
  { key: 'number', label: 'Numbers', emoji: '๑', chars: NUMBERS },
];

export const ALL_CHARS: ThaiChar[] = [...CONSONANTS, ...VOWELS, ...NUMBERS];
