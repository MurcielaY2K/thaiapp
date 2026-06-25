// Sanuk Design System — Spirit Realm palette
export const Colors = {
  // Night World — backgrounds
  bg:         '#09071a',
  bgDeep:     '#050413',
  card:       '#110f28',
  cardAlt:    '#181535',
  border:     '#1e1b3d',
  borderGlow: '#2d2860',

  // Ghost-Glow pastels
  lavender:   '#c4b5f4',
  lavenderDim:'#7c6faf',
  mint:       '#86efac',
  mintDim:    '#4ade80',
  peach:      '#fca5a5',
  sky:        '#7dd3fc',
  blush:      '#f9a8d4',

  // Sacred Light — primary accent
  gold:       '#fbbf24',
  goldDim:    '#d97706',
  teal:       '#2dd4bf',
  tealDim:    '#0d9488',

  // Text
  text:       '#e8e4ff',
  textDim:    '#6b6390',
  textMuted:  '#3d3860',
  textThai:   '#c4b5f4',

  // Semantic
  correct:    '#4ade80',
  correctBg:  '#052e16',
  wrong:      '#f87171',
  wrongBg:    '#2d0d0d',
  warning:    '#fb923c',
  info:       '#60a5fa',

  // XP / progress
  xp:         '#a78bfa',
  xpGlow:     '#7c3aed',
  streak:     '#fb923c',
  hearts:     '#f43f5e',

  // Premium
  premium:    '#fbbf24',
  premiumBg:  '#1c1505',

  // Backwards-compatible alias — maps to lavender (primary brand accent in Spirit Realm)
  accent:     '#c4b5f4',
};

export type ColorKey = keyof typeof Colors;
