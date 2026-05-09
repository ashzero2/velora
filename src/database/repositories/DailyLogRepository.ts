// ============================================================
// Velora — Daily Log Repository
// CRUD operations for the daily_logs table.
// All functions accept a SQLiteDatabase instance.
// Uses upsert pattern: one log per day (INSERT OR REPLACE).
// ============================================================

import type { SQLiteDatabase } from 'expo-sqlite';
import type { DailyLog } from '@src/types';
import { FlowIntensity, MoodType, Severity, CervicalMucusType } from '@src/types';

/** Row shape returned from SQLite (snake_case columns) */
interface DailyLogRow {
  id: string;
  date: string;
  cycle_id: string | null;
  flow: string | null;
  mood: string | null;
  cramps_severity: number;
  headache_severity: number;
  acne_severity: number;
  bloating_severity: number;
  back_pain_severity: number;
  breast_tenderness_severity: number;
  libido: number;
  discharge: string | null;
  sleep_hours: number | null;
  exercise_minutes: number | null;
  water_intake_ml: number | null;
  body_temperature: number | null;
  basal_body_temperature: number | null;
  weight: number | null;
  medication: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** Convert a database row to a DailyLog interface */
function rowToDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    date: row.date,
    cycleId: row.cycle_id,
    flow: row.flow as FlowIntensity | null,
    mood: row.mood ? (JSON.parse(row.mood) as MoodType[]) : [],
    crampsSeverity: row.cramps_severity as Severity,
    headacheSeverity: row.headache_severity as Severity,
    acneSeverity: row.acne_severity as Severity,
    bloatingSeverity: row.bloating_severity as Severity,
    backPainSeverity: row.back_pain_severity as Severity,
    breastTendernessSeverity: row.breast_tenderness_severity as Severity,
    libido: row.libido as Severity,
    discharge: row.discharge as CervicalMucusType | null,
    sleepHours: row.sleep_hours,
    exerciseMinutes: row.exercise_minutes,
    waterIntakeMl: row.water_intake_ml,
    bodyTemperature: row.body_temperature,
    basalBodyTemperature: row.basal_body_temperature,
    weight: row.weight,
    medication: row.medication ? (JSON.parse(row.medication) as string[]) : [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Upsert a daily log (insert or replace by date).
 * One log per day — if a log already exists for the date, it is replaced.
 */
export async function upsertDailyLog(
  db: SQLiteDatabase,
  log: DailyLog,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO daily_logs (
      id, date, cycle_id, flow, mood,
      cramps_severity, headache_severity, acne_severity,
      bloating_severity, back_pain_severity, breast_tenderness_severity,
      libido, discharge, sleep_hours, exercise_minutes, water_intake_ml,
      body_temperature, basal_body_temperature, weight,
      medication, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.id,
      log.date,
      log.cycleId,
      log.flow,
      JSON.stringify(log.mood),
      log.crampsSeverity,
      log.headacheSeverity,
      log.acneSeverity,
      log.bloatingSeverity,
      log.backPainSeverity,
      log.breastTendernessSeverity,
      log.libido,
      log.discharge,
      log.sleepHours,
      log.exerciseMinutes,
      log.waterIntakeMl,
      log.bodyTemperature,
      log.basalBodyTemperature,
      log.weight,
      JSON.stringify(log.medication),
      log.notes,
      log.createdAt,
      log.updatedAt,
    ],
  );
}

/**
 * Get daily log for a specific date.
 */
export async function getDailyLogByDate(
  db: SQLiteDatabase,
  date: string,
): Promise<DailyLog | null> {
  const row = await db.getFirstAsync<DailyLogRow>(
    'SELECT * FROM daily_logs WHERE date = ?',
    [date],
  );
  return row ? rowToDailyLog(row) : null;
}

/**
 * Get all daily logs in a date range (inclusive), ordered by date ascending.
 */
export async function getDailyLogsByDateRange(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<DailyLog[]> {
  const rows = await db.getAllAsync<DailyLogRow>(
    'SELECT * FROM daily_logs WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startDate, endDate],
  );
  return rows.map(rowToDailyLog);
}

/**
 * Get all daily logs for a specific cycle.
 */
export async function getDailyLogsByCycleId(
  db: SQLiteDatabase,
  cycleId: string,
): Promise<DailyLog[]> {
  const rows = await db.getAllAsync<DailyLogRow>(
    'SELECT * FROM daily_logs WHERE cycle_id = ? ORDER BY date ASC',
    [cycleId],
  );
  return rows.map(rowToDailyLog);
}

/**
 * Get all daily logs ordered by date descending.
 */
export async function getAllDailyLogs(
  db: SQLiteDatabase,
): Promise<DailyLog[]> {
  const rows = await db.getAllAsync<DailyLogRow>(
    'SELECT * FROM daily_logs ORDER BY date DESC',
  );
  return rows.map(rowToDailyLog);
}

/**
 * Delete a daily log by date.
 */
export async function deleteDailyLog(
  db: SQLiteDatabase,
  date: string,
): Promise<void> {
  await db.runAsync('DELETE FROM daily_logs WHERE date = ?', [date]);
}