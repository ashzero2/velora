// ============================================================
// Velora — Insight Store (Zustand)
// Manages insights state with auto-generation from logs + cycles.
// Actions call SymptomAnalyticsEngine then update state.
// ============================================================

import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Cycle, InsightItem } from '@src/types';
import { generateAllInsights } from '@src/engines/SymptomAnalyticsEngine';
import * as DailyLogRepository from '@src/database/repositories/DailyLogRepository';

interface InsightState {
  insights: InsightItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  generateInsights: (
    db: SQLiteDatabase,
    cycles: Cycle[],
    cycleLength: number,
    periodLength: number,
  ) => Promise<void>;
  clear: () => void;
}

export const useInsightStore = create<InsightState>((set) => ({
  insights: [],
  isLoading: false,
  error: null,

  generateInsights: async (db, cycles, cycleLength, periodLength) => {
    set({ isLoading: true, error: null });
    try {
      // Load all daily logs from DB
      const dailyLogs = await DailyLogRepository.getAllDailyLogs(db);

      // Generate insights using SymptomAnalyticsEngine (pure function)
      const insights = generateAllInsights(dailyLogs, cycles, cycleLength, periodLength);

      set({ insights, isLoading: false });
    } catch (err) {
      console.error('Failed to generate insights:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to generate insights',
        isLoading: false,
      });
    }
  },

  clear: () => {
    set({ insights: [], isLoading: false, error: null });
  },
}));