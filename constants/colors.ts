// Sanuk Design System v2 — "Paper Arcade": warm-light surfaces, chunky
// saturated color-block cards, near-black ink, pixel-art accents.
// Token NAMES are stable (the whole app references them); only values change.

export const Colors = {
  // Paper — background surfaces
  bg:           '#f0eee7',   // warm off-white
  bgDeep:       '#e7e4da',
  bgInset:      '#e7e4da',
  card:         '#ffffff',
  cardAlt:      '#eae7dd',
  cardRaised:   '#ffffff',
  border:       '#d9d5c9',
  borderStrong: '#17150f',   // chunky ink outline
  borderGlow:   '#17150f',

  // Accent inks (readable as text on paper)
  mint:         '#7d9930',   // olive
  mintLight:    '#cede84',   // olive fill
  mintDark:     '#5d7423',
  cyan:         '#3f8fd4',   // blue
  cyanLight:    '#a9cdf2',   // blue fill
  cyanDark:     '#2a6faa',
  blush:        '#e2557c',   // pink
  blushLight:   '#f6c2d2',   // pink fill
  blushDark:    '#c23a60',
  lavender:     '#8f7be8',   // violet
  lavenderLight:'#cfc4fa',   // violet fill
  lavenderDark: '#6f57d4',

  // Sacred / Feedback
  gold:         '#dfa300',
  goldDeep:     '#b88600',
  amber:        '#d98e1b',
  ember:        '#ff5c1e',   // brand primary orange / CTA / xp / streak
  emberDeep:    '#d6440e',   // button edge shadow
  jade:         '#3f9d58',   // success / correct
  jadeDeep:     '#2c7a41',
  rose:         '#e84a52',   // hearts / wrong / error
  roseDeep:     '#c02f38',

  // Text
  text:         '#17150f',   // ink
  textMoon:     '#2b2820',
  textDim:      '#6e6a5d',
  textMuted:    '#94907e',

  // Semantic aliases
  brand:        '#ff5c1e',
  onBrand:      '#17150f',   // black-on-orange, reference style
  guide:        '#3f9d58',
  premium:      '#dfa300',

  // Functional
  correct:      '#3f9d58',
  correctBg:    'rgba(63,157,88,0.14)',
  wrong:        '#e84a52',
  wrongBg:      'rgba(232,74,82,0.12)',
  xp:           '#ff5c1e',
  streak:       '#ff5c1e',
  hearts:       '#e84a52',

  // Realm world tints — the chunky color-block card fills (black text on top)
  realmVillage:    '#ff6a2e',   // w1 Survival Thai — orange
  realmMarket:     '#c0b2f8',   // w2 Food & Flavors — lavender
  realmUnderworld: '#b5cb51',   // w3 Bangkok Life — olive
  realmGrove:      '#f5d43e',   // w4 Social Thai — yellow
  realmSummit:     '#f06060',   // w5 Fluency Path — red

  // Backwards-compatible aliases
  accent:       '#ff5c1e',
  teal:         '#3f9d58',
  tealDim:      '#2c7a41',
  sky:          '#3f8fd4',
  peach:        '#e2557c',
  goldDim:      '#b88600',
  premiumBg:    'rgba(223,163,0,0.12)',
  xpGlow:       'rgba(255,92,30,0.4)',
};

export type ColorKey = keyof typeof Colors;
