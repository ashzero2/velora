// ============================================================
// Luna — Cycle Repository
// CRUD operations for the cycles table.
// All functions accept a SQLiteDatabase instance.
// ============================================================

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Cycle } from '@src/types';
import { generateId } from '@src/utils/idUtils';
import { nowISO } from '@src/utils/dateUtils';
import { calculateCycleLength, calculatePeriodLength } from '@src/engines/CycleEngine';

/** Row shape returned from SQLite (snake_case columns) */
interface CycleRow {
  id: string;
  start_date: string;
  end_date: string | null;
  period_end_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** Convert a database row to a Cycle interface */
function rowToCycle(row: CycleRow): Cycle {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    periodEndDate: row.period_end_date,
    cycleLength: row.cycle_length,
    periodLength: row.period_length,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Insert a new cycle record.
 * Auto-calculates cycle_length of the *previous* cycle if it exists.
 */
export async function createCycle(
  db: SQLiteDatabase,
  startDate: string,
  notes: string = '',
): Promise<Cycle> {
  const id = generateId();
  const now = nowISO();

  // Check if there's a previous cycle to close out
  const previousCycle = await getCurrentCycle(db);
  if (previousCycle && !previousCycle.endDate) {
    // Close the previous cycle
    const cycleLen = calculateCycleLength(previousCycle.startDate, startDate);
    await db.runAsync(
      `UPDATE cycles SET end_date = ?, cycle_length = ?, updated_at = ? WHERE id = ?`,
      [startDate, cycleLen, now, previousCycle.id],
    );
  }

  await db.runAsync(
    `INSERT INTO cycles (id, start_date, end_date, period_end_date, cycle_length, period_length, notes, created_at, updated_at)
     VALUES (?, ?, NULL, NULL, NULL, NULL, ?, ?, ?)`,
    [id, startDate, notes, now, now],
  );

  return {
    id,
    startDate,
    endDate: null,
    periodEndDate: null,
    cycleLength: null,
    periodLength: null,
    notes,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get cycle by ID.
 */
export async function getCycleById(
  db: SQLiteDatabase,
  id: string,
): Promise<Cycle | null> {
  const row = await db.getFirstAsync<CycleRow>(
    'SELECT * FROM cycles WHERE id = ?',
    [id],
  );
  return row ? rowToCycle(row) : null;
}

/**
 * Get all cycles ordered by start_date descending (most recent first).
 */
export async function getAllCycles(db: SQLiteDatabase): Promise<Cycle[]> {
  const rows = await db.getAllAsync<CycleRow>(
    'SELECT * FROM cycles ORDER BY start_date DESC',
  );
  return rows.map(rowToCycle);
}

/**
 * Get the most recent (current or latest) cycle.
 */
export async function getCurrentCycle(
  db: SQLiteDatabase,
): Promise<Cycle | null> {
  const row = await db.getFirstAsync<CycleRow>(
    'SELECT * FROM cycles ORDER BY start_date DESC LIMIT 1',
  );
  return row ? rowToCycle(row) : null;
}

/**
 * Update a cycle record (e.g., set periodEndDate, endDate, notes).
 */
export async function updateCycle(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<Pick<Cycle, 'endDate' | 'periodEndDate' | 'cycleLength' | 'periodLength' | 'notes'>>,
): Promise<void> {
  const now = nowISO();
  const setClauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.endDate !== undefined) {
    setClauses.push('end_date = ?');
    params.push(updates.endDate);
  }
  if (updates.periodEndDate !== undefined) {
    setClauses.push('period_end_date = ?');
    params.push(updates.periodEndDate);
  }
  if (updates.cycleLength !== undefined) {
    setClauses.push('cycle_length = ?');
    params.push(updates.cycleLength);
  }
  if (updates.periodLength !== undefined) {
    setClauses.push('period_length = ?');
    params.push(updates.periodLength);
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    params.push(updates.notes);
  }

  if (setClauses.length === 0) return;

  setClauses.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await db.runAsync(
    `UPDATE cycles SET ${setClauses.join(', ')} WHERE id = ?`,
    params,
  );
}

/**
 * Delete a cycle by ID.
 */
export async function deleteCycle(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync('DELETE FROM cycles WHERE id = ?', [id]);
}

/**
 * End the current period: set periodEndDate and calculate periodLength.
 */
export async function endPeriod(
  db: SQLiteDatabase,
  cycleId: string,
  periodEndDate: string,
): Promise<void> {
  const cycle = await getCycleById(db, cycleId);
  if (!cycle) throw new Error(`Cycle not found: ${cycleId}`);

  const periodLength = calculatePeriodLength(cycle.startDate, periodEndDate);
  await updateCycle(db, cycleId, {
    periodEndDate,
    periodLength,
  });
}

/**
 * Start a new cycle: closes previous cycle and creates a new one.
 */
export async function startNewCycle(
  db: SQLiteDatabase,
  newStartDate: string,
): Promise<Cycle> {
  return createCycle(db, newStartDate);
}