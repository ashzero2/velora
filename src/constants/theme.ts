// ============================================================
// Velora — Design Tokens
// Calm, neutral, non-stereotypical color palette
// ============================================================

export const colors = {
  // Primary — warm sage
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#6b9080',
    600: '#5a7d6e',
    700: '#4a6a5c',
    800: '#3d5a4e',
    900: '#334d42',
  },
  // Secondary — warm stone
  secondary: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  // Accent — soft amber
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#d4a574',
    600: '#b8956a',
    700: '#9c7f5a',
    800: '#80694a',
    900: '#64533a',
  },
  // Cycle phase colors
  phase: {
    menstruation: '#c97b7b',
    follicular: '#7ba5c9',
    ovulation: '#c9b87b',
    luteal: '#9b7bc9',
    fertile: '#7bc9a5',
    unknown: '#a8a29e',
  },
  // Semantic
  semantic: {
    success: '#6b9080',
    warning: '#d4a574',
    error: '#c97b7b',
    info: '#7ba5c9',
  },
  // Background
  background: {
    light: '#fafaf9',
    dark: '#1c1917',
  },
  // Surface
  surface: {
    light: '#ffffff',
    dark: '#292524',
  },
  // Text
  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    muted: '#a8a29e',
  },
  textDark: {
    primary: '#fafaf9',
    secondary: '#d6d3d1',
    muted: '#78716c',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
  card: 16,
  button: 12,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  stat: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
} as const;

/** Minimum touch target per Apple/Google HIG */
export const MIN_TOUCH_TARGET = 44;