export const colors = {
  // Backgrounds
  bg: '#0A0A1B',
  surface: '#13132E',
  surfaceHigh: '#1C1C42',
  border: '#2D2D6B',
  borderLight: '#3D3D8B',

  // Brand
  primary: '#8B5CF6',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',

  // Accent
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldDark: '#D97706',

  // Status
  success: '#10B981',
  successDark: '#059669',
  error: '#EF4444',
  errorDark: '#DC2626',
  warning: '#F59E0B',
  info: '#60A5FA',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  // Quality button colors (SRS ratings)
  again: '#EF4444',     // 0 – Blackout/Again
  hard: '#F97316',      // 2 – Hard
  good: '#6366F1',      // 3 – Good
  easy: '#10B981',      // 4 – Easy/Perfect

  // Region accent colors
  region: {
    krung_thon: '#F59E0B',
    paa_isaan: '#10B981',
    doi_nuea: '#60A5FA',
    talee_tong: '#06B6D4',
    mueang_hin: '#A78BFA',
    wang_loi_faa: '#F472B6',
    daen_winyaan: '#C084FC',
  } as Record<string, string>,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  hero: 48,
  thai: 56,
};
