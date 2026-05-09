// ============================================================
// Velora — Prediction Store (Zustand)
// Manages prediction state with auto-recalculation.
// Actions call PredictionEngine + PredictionRepository.
// ============================================================

import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Cycle, Prediction, CycleStatistics, UserSettings, OnboardingData } from '@src/types';
import { generatePrediction, generateCycleStatistics } from '@src/engines/PredictionEngine';
import * as PredictionRepository from '@src/database/repositories/PredictionRepository';
import { DEFAULT_LUTEAL_PHASE, DEFAULT_PERIOD_LENGTH } from '@src/constants/medical';

interface PredictionState {
  currentPrediction: Prediction | null;
  cycleStats: CycleStatistics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: (db: SQLiteDatabase) => Promise<void>;
  recalculate: (
    db: SQLiteDatabase,
    cycles: Cycle[],
    settings: UserSettings,
    onboardingData: OnboardingData | null,
  ) => Promise<void>;
  clear: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  currentPrediction: null,
  cycleStats: null,
  isLoading: false,
  error: null,

  initialize: async (db) => {
    set({ isLoading: true, error: null });
    try {
      const latest = await PredictionRepository.getLatestPrediction(db);
      set({ currentPrediction: latest, isLoading: false });
    } catch (err) {
      console.error('Failed to initialize predictions:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load predictions',
        isLoading: false,
      });
    }
  },

  recalculate: async (db, cycles, settings, onboardingData) => {
    set({ isLoading: true, error: null });
    try {
      // Determine average period length from cycles or onboarding data
      const completedWithPeriod = cycles.filter((c) => c.periodLength !== null);
      const avgPeriodLength =
        completedWithPeriod.length > 0
          ? Math.round(
              completedWithPeriod.reduce((sum, c) => sum + (c.periodLength ?? 0), 0) /
                completedWithPeriod.length,
            )
          : onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;

      // Generate new prediction
      const prediction = generatePrediction(cycles, {
        lutealPhase: settings.defaultLutealPhase ?? DEFAULT_LUTEAL_PHASE,
        fertilityTracking: settings.fertilityTrackingEnabled,
        avgPeriodLength,
      });

      // Generate cycle statistics
      const cycleStats = generateCycleStatistics(cycles);

      // Persist to database
      if (prediction) {
        await PredictionRepository.deleteAllPredictions(db);
        await PredictionRepository.createPrediction(db, prediction);
      }

      set({
        currentPrediction: prediction,
        cycleStats,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to recalculate predictions:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to calculate predictions',
        isLoading: false,
      });
    }
  },

  clear: () => {
    set({
      currentPrediction: null,
      cycleStats: null,
      isLoading: false,
      error: null,
    });
  },
}));