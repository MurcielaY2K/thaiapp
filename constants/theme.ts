// Sanuk Design System — Spirit Realm spatial tokens

export const Radii = {
  none:  0,
  xs:    6,    // buttons, tags, small chips
  sm:    10,   // input fields, small cards
  md:    14,   // standard cards, modals
  lg:    20,   // large cards, world headers
  xl:    28,   // hero elements
  '2xl': 36,   // overlays
  full:  999,  // pill / fully circular
};

export const Spacing = {
  '0':   0,
  '1':   4,
  '2':   8,
  '3':   12,
  '4':   16,
  '5':   20,
  '6':   24,
  '8':   32,
  '10':  40,
  '12':  48,
  '16':  64,
};

// Web-only box-shadow strings
export const Shadows = {
  // Structural
  sm:   '0 2px 0 rgba(10,9,25,0.45)',
  md:   '0 4px 0 rgba(10,9,25,0.45), 0 8px 18px rgba(0,0,0,0.35)',
  card: '0 4px 16px rgba(0,0,0,0.6)',

  // 3D pixel-edge button bottom lips
  edgeEmber:  '0 5px 0 0 #e07a1f',
  edgeJade:   '0 5px 0 0 #15a877',
  edgeGold:   '0 5px 0 0 #e0ab00',

  // Ghost-glow halos
  glowMint:     '0 0 16px rgba(158,245,212,0.65)',
  glowCyan:     '0 0 16px rgba(143,232,255,0.65)',
  glowLavender: '0 0 16px rgba(196,181,253,0.65)',
  glowGold:     '0 0 20px rgba(255,215,0,0.6)',
  glowEmber:    '0 0 18px rgba(255,159,67,0.6)',
  glowJade:     '0 0 16px rgba(52,211,153,0.6)',
  glowRose:     '0 0 16px rgba(255,122,138,0.6)',

  // Rim highlight (inset top edge)
  rimTop: 'inset 0 2px 0 rgba(255,255,255,0.08)',
};

export const PixelStyle = {
  imageRendering: 'pixelated' as const,
};
