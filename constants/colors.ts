// Sanuk Design System — Spirit Realm exact tokens from _ds_manifest.json

export const Colors = {
  // Night World — background surfaces
  bg:           '#161626',   // night-900 / surface-deep
  bgDeep:       '#111021',   // night-950
  bgInset:      '#1a1a2e',   // night-850 / surface-inset
  card:         '#1e1e34',   // night-800 / surface-night
  cardAlt:      '#262642',   // night-700 / surface-panel
  cardRaised:   '#313156',   // night-600 / surface-raised
  border:       '#3f3f6b',   // night-500 / border-subtle
  borderStrong: '#565488',   // night-400 / border-strong
  borderGlow:   '#8fe8ff',   // cyan / border-glow

  // Ghost-Glow pastels
  mint:         '#9ef5d4',   // mint
  mintLight:    '#c9ffe9',   // mint-300
  mintDark:     '#5fd9ac',   // mint-600
  cyan:         '#8fe8ff',   // cyan
  cyanLight:    '#c4f1ff',   // cyan-300
  cyanDark:     '#4fc4e8',   // cyan-600
  blush:        '#ffb3d1',   // blush
  blushLight:   '#ffd6e6',   // blush-300
  blushDark:    '#f57aa8',   // blush-600
  lavender:     '#c4b5fd',   // lavender
  lavenderLight:'#e3dcff',   // lavender-300
  lavenderDark: '#9d86f0',   // lavender-600

  // Sacred / Feedback
  gold:         '#ffd700',   // gold / premium
  goldDeep:     '#e0ab00',   // gold-deep
  amber:        '#ffb938',   // amber
  ember:        '#ff9f43',   // ember / brand primary CTA / xp / streak
  emberDeep:    '#e07a1f',   // ember-deep (button edge shadow)
  jade:         '#34d399',   // jade / guide / success / correct
  jadeDeep:     '#15a877',   // jade-deep
  rose:         '#ff7a8a',   // rose / hearts / wrong / error
  roseDeep:     '#e0485c',   // rose-deep

  // Text
  text:         '#f5f1e8',   // cream / text-primary
  textMoon:     '#e2e8f0',   // moon
  textDim:      '#b8c0d8',   // mist / text-secondary
  textMuted:    '#8b90b5',   // dusk / text-muted

  // Semantic aliases
  brand:        '#ff9f43',   // ember
  onBrand:      '#2a1606',   // on-brand text on ember buttons
  guide:        '#34d399',   // jade
  premium:      '#ffd700',   // gold

  // Functional
  correct:      '#34d399',   // jade
  correctBg:    'rgba(52,211,153,0.12)',
  wrong:        '#ff7a8a',   // rose
  wrongBg:      'rgba(255,122,138,0.12)',
  xp:           '#ff9f43',   // ember
  streak:       '#ff9f43',   // ember
  hearts:       '#ff7a8a',   // rose

  // Realm world tints (world header backgrounds)
  realmVillage:    '#2a3a4a',   // w1 Survival Thai
  realmMarket:     '#3a2a44',   // w2 Food & Flavors
  realmUnderworld: '#1f3340',   // w3 Bangkok Life
  realmGrove:      '#213a30',   // w4 Social Thai
  realmSummit:     '#3a3320',   // w5 Fluency Path

  // Backwards-compatible aliases
  accent:       '#ff9f43',   // ember (was lavender — UPDATED)
  teal:         '#34d399',   // jade alias
  tealDim:      '#15a877',
  sky:          '#8fe8ff',   // cyan alias
  peach:        '#ffb3d1',   // blush alias
  goldDim:      '#e0ab00',
  premiumBg:    'rgba(255,215,0,0.08)',
  xpGlow:       'rgba(255,159,67,0.6)',
};

export type ColorKey = keyof typeof Colors;
