// ============================================================
// Velora — Log Store (Zustand)
// Manages daily log state with CRUD operations.
// Actions call DailyLogRepository then update state.
// ============================================================

import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { DailyLog } from '@src/types';
import { Severity } from '@src/types';
import * as DailyLogRepository from '@src/database/repositories/DailyLogRepository';
import { today, subDays, nowISO } from '@src/utils/dateUtils';
import { generateId } from '@src/utils/idUtils';

interface LogState {
  todayLog: DailyLog | null;
  recentLogs: DailyLog[];          // last 7 days
  selectedDateLog: DailyLog | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: (db: SQLiteDatabase) => Promise<void>;
  loadLogForDate: (db: SQLiteDatabase, date: string) => Promise<DailyLog | null>;
  upsertLog: (db: SQLiteDatabase, log: DailyLog) => Promise<void>;
  deleteLog: (db: SQLiteDatabase, date: string) => Promise<void>;
  loadRecentLogs: (db: SQLiteDatabase, days?: number) => Promise<void>;
}

/**
 * Create a blank DailyLog for a given date.
 */
export function createBlankLog(date: string, cycleId: string | null): DailyLog {
  const now = nowISO();
  return {
    id: generateId(),
    date,
    cycleId,
    flow: null,
    mood: [],
    crampsSeverity: Severity.NONE,
    headacheSeverity: Severity.NONE,
    acneSeverity: Severity.NONE,
    bloatingSeverity: Severity.NONE,
    backPainSeverity: Severity.NONE,
    breastTendernessSeverity: Severity.NONE,
    libido: Severity.NONE,
    discharge: null,
    sleepHours: null,
    exerciseMinutes: null,
    waterIntakeMl: null,
    bodyTemperature: null,
    basalBodyTemperature: null,
    weight: null,
    medication: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export const useLogStore = create<LogState>((set, get) => ({
  todayLog: null,
  recentLogs: [],
  selectedDateLog: null,
  isLoading: false,
  error: null,

  initialize: async (db) => {
    set({ isLoading: true, error: null });
    try {
      const todayStr = today();
      const todayLog = await DailyLogRepository.getDailyLogByDate(db, todayStr);

      // Load last 7 days
      const weekAgo = subDays(todayStr, 6);
      const recentLogs = await DailyLogRepository.getDailyLogsByDateRange(db, weekAgo, todayStr);

      set({ todayLog, recentLogs, isLoading: false });
    } catch (err) {
      console.error('Failed to initialize log store:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load logs',
        isLoading: false,
      });
    }
  },

  loadLogForDate: async (db, date) => {
    try {
      const log = await DailyLogRepository.getDailyLogByDate(db, date);
      set({ selectedDateLog: log });
      return log;
    } catch (err) {
      console.error('Failed to load log for date:', err);
      return null;
    }
  },

  upsertLog: async (db, log) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure updatedAt is current
      const updatedLog = { ...log, updatedAt: nowISO() };
      await DailyLogRepository.upsertDailyLog(db, updatedLog);

      const todayStr = today();

      // Update todayLog if this is today's log
      if (updatedLog.date === todayStr) {
        set({ todayLog: updatedLog });
      }

      // Update selectedDateLog
      set({ selectedDateLog: updatedLog });

      // Refresh recent logs
      const weekAgo = subDays(todayStr, 6);
      const recentLogs = await DailyLogRepository.getDailyLogsByDateRange(db, weekAgo, todayStr);

      set({ recentLogs, isLoading: false });
    } catch (err) {
      console.error('Failed to upsert log:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to save log',
        isLoading: false,
      });
    }
  },

  deleteLog: async (db, date) => {
    set({ isLoading: true, error: null });
    try {
      await DailyLogRepository.deleteDailyLog(db, date);

      const todayStr = today();
      if (date === todayStr) {
        set({ todayLog: null });
      }

      set({ selectedDateLog: null });

      // Refresh recent logs
      const weekAgo = subDays(todayStr, 6);
      const recentLogs = await DailyLogRepository.getDailyLogsByDateRange(db, weekAgo, todayStr);

      set({ recentLogs, isLoading: false });
    } catch (err) {
      console.error('Failed to delete log:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to delete log',
        isLoading: false,
      });
    }
  },

  loadRecentLogs: async (db, days = 7) => {
    try {
      const todayStr = today();
      const startDate = subDays(todayStr, days - 1);
      const recentLogs = await DailyLogRepository.getDailyLogsByDateRange(db, startDate, todayStr);
      set({ recentLogs });
    } catch (err) {
      console.error('Failed to load recent logs:', err);
    }
  },
}));