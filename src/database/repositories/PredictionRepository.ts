// ============================================================
// Velora — Prediction Repository
// CRUD operations for the predictions table.
// All functions accept a SQLiteDatabase instance.
// ============================================================

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Prediction } from '@src/types';
import { PredictionConfidence } from '@src/types';

/** Row shape returned from SQLite (snake_case columns) */
interface PredictionRow {
  id: string;
  based_on_cycle_ids: string;
  predicted_period_start: string;
  predicted_period_end: string;
  predicted_start_range_early: string | null;
  predicted_start_range_late: string | null;
  estimated_ovulation_date: string | null;
  fertile_window_start: string | null;
  fertile_window_end: string | null;
  confidence: string;
  confidence_score: number | null;
  average_cycle_length: number | null;
  standard_deviation: number | null;
  luteal_phase_estimate: number | null;
  basis_description: string | null;
  created_at: string;
}

/** Convert a database row to a Prediction interface */
function rowToPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    basedOnCycleIds: JSON.parse(row.based_on_cycle_ids) as string[],
    predictedPeriodStart: row.predicted_period_start,
    predictedPeriodEnd: row.predicted_period_end,
    predictedPeriodStartRange: [
      row.predicted_start_range_early ?? row.predicted_period_start,
      row.predicted_start_range_late ?? row.predicted_period_start,
    ],
    estimatedOvulationDate: row.estimated_ovulation_date ?? '',
    fertileWindowStart: row.fertile_window_start ?? '',
    fertileWindowEnd: row.fertile_window_end ?? '',
    confidence: row.confidence as PredictionConfidence,
    confidenceScore: row.confidence_score ?? 0,
    averageCycleLength: row.average_cycle_length ?? 0,
    standardDeviation: row.standard_deviation ?? 0,
    lutealPhaseEstimate: row.luteal_phase_estimate ?? 14,
    basisDescription: row.basis_description ?? '',
    createdAt: row.created_at,
  };
}

/**
 * Insert a new prediction record.
 */
export async function createPrediction(
  db: SQLiteDatabase,
  prediction: Prediction,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO predictions (
      id, based_on_cycle_ids, predicted_period_start, predicted_period_end,
      predicted_start_range_early, predicted_start_range_late,
      estimated_ovulation_date, fertile_window_start, fertile_window_end,
      confidence, confidence_score, average_cycle_length, standard_deviation,
      luteal_phase_estimate, basis_description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      prediction.id,
      JSON.stringify(prediction.basedOnCycleIds),
      prediction.predictedPeriodStart,
      prediction.predictedPeriodEnd,
      prediction.predictedPeriodStartRange[0],
      prediction.predictedPeriodStartRange[1],
      prediction.estimatedOvulationDate,
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd,
      prediction.confidence,
      prediction.confidenceScore,
      prediction.averageCycleLength,
      prediction.standardDeviation,
      prediction.lutealPhaseEstimate,
      prediction.basisDescription,
      prediction.createdAt,
    ],
  );
}

/**
 * Get the most recent prediction.
 */
export async function getLatestPrediction(
  db: SQLiteDatabase,
): Promise<Prediction | null> {
  const row = await db.getFirstAsync<PredictionRow>(
    'SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1',
  );
  return row ? rowToPrediction(row) : null;
}

/**
 * Get all predictions ordered by created_at descending.
 */
export async function getAllPredictions(
  db: SQLiteDatabase,
): Promise<Prediction[]> {
  const rows = await db.getAllAsync<PredictionRow>(
    'SELECT * FROM predictions ORDER BY created_at DESC',
  );
  return rows.map(rowToPrediction);
}

/**
 * Delete predictions older than a given date.
 */
export async function deleteOldPredictions(
  db: SQLiteDatabase,
  beforeDate: string,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM predictions WHERE created_at < ?',
    [beforeDate],
  );
}

/**
 * Delete all predictions (used when recalculating).
 */
export async function deleteAllPredictions(
  db: SQLiteDatabase,
): Promise<void> {
  await db.runAsync('DELETE FROM predictions');
}