// Sanuk Design System — Spirit Realm spatial tokens
export const Radii = {
  none:  0,
  sm:    4,   // pixel edge — hard corners
  md:    8,
  lg:    12,
  xl:    16,
  '2xl': 24,
  full:  9999,
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

// Ghost-Glow shadow helpers (web only via boxShadow, native approximated)
export const Shadows = {
  ghost:    '0 0 12px rgba(196, 181, 244, 0.35)',
  ghostLg:  '0 0 24px rgba(196, 181, 244, 0.5)',
  gold:     '0 0 12px rgba(251, 191, 36, 0.45)',
  teal:     '0 0 12px rgba(45, 212, 191, 0.4)',
  card:     '0 4px 16px rgba(0, 0, 0, 0.6)',
  correct:  '0 0 16px rgba(74, 222, 128, 0.4)',
  wrong:    '0 0 16px rgba(248, 113, 113, 0.4)',
};

// Pixel-art image rendering (web)
export const PixelStyle = {
  imageRendering: 'pixelated' as const,
};
