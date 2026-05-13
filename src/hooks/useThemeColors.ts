// ============================================================
// Velora — Dynamic Theme Hook
// Returns semantic colors based on dark mode setting.
// Supports: true (always dark), false (always light), 'system'
// ============================================================

import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { colors } from '@src/constants/theme';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  cardBackground: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Borders & dividers
  border: string;
  divider: string;

  // Interactive
  inputBackground: string;
  chipBackground: string;
  chipBackgroundActive: string;

  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;

  // Status bar
  statusBarStyle: 'light-content' | 'dark-content';

  // Misc
  isDark: boolean;
}

const LIGHT_THEME: ThemeColors = {
  background: colors.background.light,       // #fafaf9
  surface: colors.surface.light,             // #ffffff
  cardBackground: '#ffffff',

  textPrimary: colors.text.primary,          // #1c1917
  textSecondary: colors.text.secondary,      // #57534e
  textMuted: colors.text.muted,              // #a8a29e

  border: colors.secondary[200],             // #e7e5e4
  divider: colors.secondary[100],            // #f5f5f4

  inputBackground: colors.secondary[50],     // #fafaf9
  chipBackground: colors.secondary[50],
  chipBackgroundActive: colors.secondary[100],

  tabBarBackground: '#fafaf9',
  tabBarBorder: '#e7e5e4',

  statusBarStyle: 'dark-content',
  isDark: false,
};

const DARK_THEME: ThemeColors = {
  background: '#0f0e0d',                    // deeper than secondary[900]
  surface: '#1c1917',                        // secondary[900]
  cardBackground: '#262220',                 // slightly lighter than surface

  textPrimary: '#fafaf9',                    // secondary[50]
  textSecondary: '#d6d3d1',                  // secondary[300]
  textMuted: '#78716c',                      // secondary[500]

  border: '#44403c',                         // secondary[700]
  divider: '#2e2a27',                        // between 800 and 900

  inputBackground: '#1c1917',
  chipBackground: '#262220',
  chipBackgroundActive: '#3d3530',

  tabBarBackground: '#0f0e0d',
  tabBarBorder: '#2e2a27',

  statusBarStyle: 'light-content',
  isDark: true,
};

/**
 * Returns themed colors based on user's dark mode preference.
 * - `true` → always dark
 * - `false` → always light
 * - `'system'` → follows device setting
 */
export function useThemeColors(): ThemeColors {
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const systemScheme = useColorScheme();

  if (darkMode === true) return DARK_THEME;
  if (darkMode === false) return LIGHT_THEME;

  // 'system' mode
  return systemScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}