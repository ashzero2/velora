// ============================================================
// Velora — Settings Store (Zustand)
// Manages onboarding data and user settings.
// Actions call SettingsRepository then update state.
// ============================================================

import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { UserSettings, OnboardingData } from '@src/types';
import * as SettingsRepository from '@src/database/repositories/SettingsRepository';
import { DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';

const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  darkMode: 'system',
  fertilityTrackingEnabled: false,
  temperatureUnit: 'fahrenheit',
  weightUnit: 'kg',
  waterUnit: 'ml',
  defaultLutealPhase: DEFAULT_LUTEAL_PHASE,
};

interface SettingsState {
  settings: UserSettings;
  onboardingData: OnboardingData | null;
  isLoading: boolean;

  // Actions
  initialize: (db: SQLiteDatabase) => Promise<void>;
  completeOnboarding: (db: SQLiteDatabase, data: OnboardingData) => Promise<void>;
  updateSettings: (db: SQLiteDatabase, updates: Partial<UserSettings>) => Promise<void>;
  resetOnboarding: (db: SQLiteDatabase) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  onboardingData: null,
  isLoading: false,

  initialize: async (db) => {
    set({ isLoading: true });
    try {
      const settings = await SettingsRepository.getUserSettings(db);
      const onboardingData = await SettingsRepository.getOnboardingData(db);
      set({ settings, onboardingData, isLoading: false });
    } catch (err) {
      console.error('Failed to initialize settings:', err);
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (db, data) => {
    set({ isLoading: true });
    try {
      await SettingsRepository.saveOnboardingData(db, data);
      const settings = await SettingsRepository.getUserSettings(db);
      set({
        settings,
        onboardingData: data,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      set({ isLoading: false });
    }
  },

  updateSettings: async (db, updates) => {
    set({ isLoading: true });
    try {
      await SettingsRepository.saveUserSettings(db, updates);
      const settings = await SettingsRepository.getUserSettings(db);
      set({ settings, isLoading: false });
    } catch (err) {
      console.error('Failed to update settings:', err);
      set({ isLoading: false });
    }
  },

  resetOnboarding: async (db) => {
    set({ isLoading: true });
    try {
      await SettingsRepository.resetOnboarding(db);
      const settings = await SettingsRepository.getUserSettings(db);
      set({
        settings,
        onboardingData: null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to reset onboarding:', err);
      set({ isLoading: false });
    }
  },
}));