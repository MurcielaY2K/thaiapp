export interface Character {
  id: string;
  name: string;
  species: 'cat' | 'dog';
  role: string;
  specialty: string;
  description: string;
  emoji: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  learnFocus: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'byte',
    name: 'BYTE',
    species: 'cat',
    role: 'The Hacker Cat',
    specialty: 'Tech & Modern Slang',
    description: 'A clever stray who cracked data chips to learn Thai. Picks up slang faster than anyone in the city.',
    emoji: '🐱',
    color: '#00D4FF',
    glowColor: 'rgba(0,212,255,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(0,50,80,0.9), rgba(0,20,40,0.95))',
    learnFocus: 'Slang, Tech vocab, Modern life',
  },
  {
    id: 'mao_mao',
    name: 'MAO MAO',
    species: 'cat',
    role: 'The Scout Cat',
    specialty: 'Questions & Exploration',
    description: 'Curious and fearless. Learns by wandering Bangkok alleys and chatting up vendors at every night market.',
    emoji: '🐈',
    color: '#FFB800',
    glowColor: 'rgba(255,184,0,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(80,50,0,0.9), rgba(40,20,0,0.95))',
    learnFocus: 'Questions, Directions, Travel',
  },
  {
    id: 'shiro',
    name: 'SHIRO',
    species: 'dog',
    role: 'The Monk Dog',
    specialty: 'Wisdom & Polite Speech',
    description: 'A calm dog who sat outside temples so long he absorbed ancient Thai. Knows every polite particle.',
    emoji: '🐕',
    color: '#C084FC',
    glowColor: 'rgba(192,132,252,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(60,20,100,0.9), rgba(30,10,50,0.95))',
    learnFocus: 'Polite speech, Culture, Temples',
  },
  {
    id: 'chai',
    name: 'CHAI',
    species: 'dog',
    role: 'The Street Dog',
    specialty: 'Daily Life & Actions',
    description: 'Loyal guardian of the soi. Knows every vendor, every verb, every shortcut through Bangkok.',
    emoji: '🦮',
    color: '#F97316',
    glowColor: 'rgba(249,115,22,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(80,30,0,0.9), rgba(40,15,0,0.95))',
    learnFocus: 'Daily life, Actions, Verbs',
  },
  {
    id: 'sai',
    name: 'SAI',
    species: 'cat',
    role: 'The Engineer Cat',
    specialty: 'Objects & Problem Solving',
    description: 'Builds gadgets from scrap metal found in the sewers. Learns Thai by labeling every single thing.',
    emoji: '🐱',
    color: '#34D399',
    glowColor: 'rgba(52,211,153,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(0,60,40,0.9), rgba(0,25,20,0.95))',
    learnFocus: 'Objects, Tools, Numbers',
  },
  {
    id: 'kapi',
    name: 'KAPI',
    species: 'cat',
    role: 'The Night Runner',
    specialty: 'Idioms & Advanced Thai',
    description: 'Invisible in shadows, fluent in rare expressions overheard at midnight markets and rooftop gardens.',
    emoji: '🐈‍⬛',
    color: '#A855F7',
    glowColor: 'rgba(168,85,247,0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(60,15,100,0.9), rgba(25,5,50,0.95))',
    learnFocus: 'Idioms, Advanced expressions',
  },
];

export function getCharacter(id: string): Character {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}
