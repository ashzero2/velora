// ============================================================
// Velora — Cycle Store (Zustand)
// Manages cycle list, current cycle, and phase info.
// Actions call CycleRepository then update state.
// ============================================================

import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Cycle, CyclePhaseInfo } from '@src/types';
import * as CycleRepository from '@src/database/repositories/CycleRepository';
import { getCurrentCycleDay, getCurrentPhase } from '@src/engines/CycleEngine';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';

interface CycleState {
  cycles: Cycle[];
  currentCycle: Cycle | null;
  currentPhaseInfo: CyclePhaseInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: (db: SQLiteDatabase) => Promise<void>;
  startPeriod: (db: SQLiteDatabase, startDate: string) => Promise<void>;
  endPeriod: (db: SQLiteDatabase, periodEndDate: string) => Promise<void>;
  startNewCycle: (db: SQLiteDatabase, newStartDate: string) => Promise<void>;
  updateCycle: (
    db: SQLiteDatabase,
    id: string,
    updates: Partial<Pick<Cycle, 'endDate' | 'periodEndDate' | 'cycleLength' | 'periodLength' | 'notes'>>,
  ) => Promise<void>;
  deleteCycle: (db: SQLiteDatabase, id: string) => Promise<void>;
  refreshPhaseInfo: (cycleLength: number, periodLength: number, lutealPhase?: number) => void;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  currentCycle: null,
  currentPhaseInfo: null,
  isLoading: false,
  error: null,

  initialize: async (db) => {
    set({ isLoading: true, error: null });
    try {
      const cycles = await CycleRepository.getAllCycles(db);
      const currentCycle = cycles.length > 0 ? cycles[0] : null;

      set({ cycles, currentCycle, isLoading: false });

      // Calculate phase info if we have a current cycle
      if (currentCycle) {
        const avgCycleLength =
          cycles.find((c) => c.cycleLength)?.cycleLength ?? DEFAULT_CYCLE_LENGTH;
        const avgPeriodLength =
          currentCycle.periodLength ?? DEFAULT_PERIOD_LENGTH;
        get().refreshPhaseInfo(avgCycleLength, avgPeriodLength);
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load cycles',
        isLoading: false,
      });
    }
  },

  startPeriod: async (db, startDate) => {
    set({ isLoading: true, error: null });
    try {
      const newCycle = await CycleRepository.createCycle(db, startDate);
      const cycles = await CycleRepository.getAllCycles(db);
      set({ cycles, currentCycle: newCycle, isLoading: false });

      // Refresh phase info
      get().refreshPhaseInfo(DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to start period',
        isLoading: false,
      });
    }
  },

  endPeriod: async (db, periodEndDate) => {
    const { currentCycle } = get();
    if (!currentCycle) return;

    set({ isLoading: true, error: null });
    try {
      await CycleRepository.endPeriod(db, currentCycle.id, periodEndDate);
      const updatedCycle = await CycleRepository.getCycleById(db, currentCycle.id);
      const cycles = await CycleRepository.getAllCycles(db);
      set({ cycles, currentCycle: updatedCycle, isLoading: false });

      if (updatedCycle) {
        const avgCycleLength =
          cycles.find((c) => c.cycleLength)?.cycleLength ?? DEFAULT_CYCLE_LENGTH;
        get().refreshPhaseInfo(
          avgCycleLength,
          updatedCycle.periodLength ?? DEFAULT_PERIOD_LENGTH,
        );
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to end period',
        isLoading: false,
      });
    }
  },

  startNewCycle: async (db, newStartDate) => {
    set({ isLoading: true, error: null });
    try {
      const newCycle = await CycleRepository.startNewCycle(db, newStartDate);
      const cycles = await CycleRepository.getAllCycles(db);
      set({ cycles, currentCycle: newCycle, isLoading: false });

      get().refreshPhaseInfo(DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to start new cycle',
        isLoading: false,
      });
    }
  },

  updateCycle: async (db, id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await CycleRepository.updateCycle(db, id, updates);
      const cycles = await CycleRepository.getAllCycles(db);
      const currentCycle = cycles.length > 0 ? cycles[0] : null;
      set({ cycles, currentCycle, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update cycle',
        isLoading: false,
      });
    }
  },

  deleteCycle: async (db, id) => {
    set({ isLoading: true, error: null });
    try {
      await CycleRepository.deleteCycle(db, id);
      const cycles = await CycleRepository.getAllCycles(db);
      const currentCycle = cycles.length > 0 ? cycles[0] : null;
      set({ cycles, currentCycle, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete cycle',
        isLoading: false,
      });
    }
  },

  refreshPhaseInfo: (cycleLength, periodLength, lutealPhase = DEFAULT_LUTEAL_PHASE) => {
    const { currentCycle } = get();
    if (!currentCycle) {
      set({ currentPhaseInfo: null });
      return;
    }

    const cycleDay = getCurrentCycleDay(currentCycle.startDate);
    const phaseInfo = getCurrentPhase(cycleDay, cycleLength, periodLength, lutealPhase);
    set({ currentPhaseInfo: phaseInfo });
  },
}));