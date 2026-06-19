import type { SpriteName } from './sprites';

// A reading exercise: a pixel-art scene + a few short sentences built from
// individually glossed words. Each word can be tapped for its reading and
// meaning, and every sentence can be read aloud.

export interface Token {
  th: string;   // Thai word
  rom: string;  // phonemic reading (romanization)
  en: string;   // English gloss for this single word
}

export interface Sentence {
  tokens: Token[];
  en: string;   // translation of the whole sentence
}

export interface SceneItem {
  sprite: SpriteName;
  size: number;
  opacity?: number;
}

export interface ReadingLesson {
  id: string;
  title: string;    // Thai title
  titleEn: string;  // English title
  scene: SceneItem[];
  sentences: Sentence[];
}

// Reusable glossed words
const W = {
  chan:  { th: 'ฉัน',  rom: 'chǎn',  en: 'I / me' },
  pai:   { th: 'ไป',   rom: 'pai',   en: 'go' },
  duu:   { th: 'ดู',   rom: 'duu',   en: 'look at' },
  chop:  { th: 'ชอบ',  rom: 'chɔ̂ɔp', en: 'like' },
  rak:   { th: 'รัก',  rom: 'rák',   en: 'love' },
  kin:   { th: 'กิน',  rom: 'kin',   en: 'eat' },
  yai:   { th: 'ใหญ่', rom: 'yài',   en: 'big' },
  suay:  { th: 'สวย',  rom: 'sǔay',  en: 'beautiful' },
  maak:  { th: 'มาก',  rom: 'mâak',  en: 'very / a lot' },
  tua:   { th: 'ตัว',  rom: 'tua',   en: '[classifier for animals]' },
  sii:   { th: 'สี',   rom: 'sǐi',   en: 'color' },
  mai:   { th: 'ไม่',  rom: 'mâi',   en: 'not' },
  nai:   { th: 'ใน',   rom: 'nai',   en: 'in' },
  lae:   { th: 'และ',  rom: 'lɛ́',    en: 'and' },
  wat:   { th: 'วัด',  rom: 'wát',   en: 'temple' },
  chang: { th: 'ช้าง', rom: 'cháang', en: 'elephant' },
  phak:  { th: 'ผัก',  rom: 'phàk',  en: 'vegetables' },
  maew:  { th: 'แมว',  rom: 'mɛɛw',  en: 'cat' },
  bua:   { th: 'บัว',  rom: 'bua',   en: 'lotus' },
  chompoo:{ th: 'ชมพู', rom: 'chom-phuu', en: 'pink' },
  dek:   { th: 'เด็ก', rom: 'dèk',   en: 'child' },
  naak:  { th: 'นาค',  rom: 'nâak',  en: 'naga (serpent)' },
  yuu:   { th: 'อยู่', rom: 'yùu',   en: 'to be (located)' },
  naam:  { th: 'น้ำ',  rom: 'náam',  en: 'water' },
  klua:  { th: 'กลัว', rom: 'klua',  en: 'afraid' },
} as const;

export const READING_LESSONS: ReadingLesson[] = [
  {
    id: 'r1',
    title: 'ที่วัด',
    titleEn: 'At the temple',
    scene: [
      { sprite: 'palm', size: 54, opacity: 0.9 },
      { sprite: 'temple', size: 120 },
      { sprite: 'chedi', size: 70 },
    ],
    sentences: [
      { tokens: [W.chan, W.pai, W.wat], en: 'I go to the temple.' },
      { tokens: [W.wat, W.suay, W.maak], en: 'The temple is very beautiful.' },
      { tokens: [W.chan, W.chop, W.wat], en: 'I like the temple.' },
    ],
  },
  {
    id: 'r2',
    title: 'ช้างใหญ่',
    titleEn: 'The big elephant',
    scene: [
      { sprite: 'palm', size: 50, opacity: 0.9 },
      { sprite: 'elephant', size: 120 },
      { sprite: 'lotus', size: 44, opacity: 0.9 },
    ],
    sentences: [
      { tokens: [W.chang, W.tua, W.yai], en: 'The elephant is big.' },
      { tokens: [W.chang, W.kin, W.phak], en: 'The elephant eats vegetables.' },
      { tokens: [W.chan, W.rak, W.chang], en: 'I love the elephant.' },
    ],
  },
  {
    id: 'r3',
    title: 'แมวกับบัว',
    titleEn: 'The cat and the lotus',
    scene: [
      { sprite: 'girl', size: 88 },
      { sprite: 'cat', size: 70 },
      { sprite: 'lotus', size: 56 },
    ],
    sentences: [
      { tokens: [W.maew, W.duu, W.bua], en: 'The cat looks at the lotus.' },
      { tokens: [W.bua, W.sii, W.chompoo], en: 'The lotus is pink.' },
      { tokens: [W.dek, W.chop, W.maew], en: 'The child likes the cat.' },
    ],
  },
  {
    id: 'r4',
    title: 'พญานาค',
    titleEn: 'The naga',
    scene: [
      { sprite: 'naga', size: 96 },
      { sprite: 'lotus', size: 48, opacity: 0.9 },
    ],
    sentences: [
      { tokens: [W.naak, W.yuu, W.nai, W.naam], en: 'The naga is in the water.' },
      { tokens: [W.naak, W.tua, W.yai, W.maak], en: 'The naga is very big.' },
      { tokens: [W.chan, W.mai, W.klua, W.naak], en: 'I am not afraid of the naga.' },
    ],
  },
];
