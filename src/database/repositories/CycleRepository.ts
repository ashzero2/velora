// ============================================================
// Velora — Cycle Repository
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

/**
 * Create cycles from onboarding data.
 * Intelligently back-fills completed historical cycles from the onboarding
 * start date up to today, then creates the current (ongoing) cycle.
 *
 * Example: lastPeriodStart=Mar 31, cycleLength=33, periodLength=4, today=May 13
 *   → Cycle 1: Mar 31–May 2 (completed, period ended Apr 3)
 *   → Cycle 2: May 3–ongoing (current cycle, period ended May 6 if within range)
 *
 * @returns the current (most recent) cycle
 */
export async function createOnboardingCycles(
  db: SQLiteDatabase,
  lastPeriodStart: string,
  avgCycleLength: number,
  avgPeriodLength: number,
): Promise<Cycle> {
  const { addDays, diffDays: diffD, today: todayFn, nowISO: nowFn } = await import('@src/utils/dateUtils');
  const { generateId: genId } = await import('@src/utils/idUtils');

  const todayStr = todayFn();
  const totalDaysSinceStart = diffD(lastPeriodStart, todayStr);

  // If the onboarding date is today or in the future, just create a single ongoing cycle
  if (totalDaysSinceStart <= 0) {
    return createCycle(db, lastPeriodStart);
  }

  // Calculate how many full cycles have passed
  const fullCyclesPassed = Math.floor(totalDaysSinceStart / avgCycleLength);
  const now = nowFn();
  let lastCreatedCycle: Cycle | null = null;

  // Create completed historical cycles
  for (let i = 0; i < fullCyclesPassed; i++) {
    const cycleStart = addDays(lastPeriodStart, i * avgCycleLength);
    const cycleEnd = addDays(lastPeriodStart, (i + 1) * avgCycleLength);
    const periodEnd = addDays(cycleStart, avgPeriodLength - 1);
    const id = genId();

    await db.runAsync(
      `INSERT INTO cycles (id, start_date, end_date, period_end_date, cycle_length, period_length, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, '', ?, ?)`,
      [id, cycleStart, cycleEnd, periodEnd, avgCycleLength, avgPeriodLength, now, now],
    );

    lastCreatedCycle = {
      id, startDate: cycleStart, endDate: cycleEnd, periodEndDate: periodEnd,
      cycleLength: avgCycleLength, periodLength: avgPeriodLength,
      notes: '', createdAt: now, updatedAt: now,
    };
  }

  // Create the current (ongoing) cycle
  const currentCycleStart = addDays(lastPeriodStart, fullCyclesPassed * avgCycleLength);
  const dayInCurrentCycle = diffD(currentCycleStart, todayStr) + 1;
  const currentId = genId();

  // Auto-set periodEndDate if we're past the period length in the current cycle
  let currentPeriodEnd: string | null = null;
  let currentPeriodLength: number | null = null;
  if (dayInCurrentCycle > avgPeriodLength) {
    // Period has already ended in this cycle
    currentPeriodEnd = addDays(currentCycleStart, avgPeriodLength - 1);
    currentPeriodLength = avgPeriodLength;
  }
  // If dayInCurrentCycle <= avgPeriodLength, period is still ongoing (don't set periodEndDate)

  await db.runAsync(
    `INSERT INTO cycles (id, start_date, end_date, period_end_date, cycle_length, period_length, notes, created_at, updated_at)
     VALUES (?, ?, NULL, ?, NULL, ?, '', ?, ?)`,
    [currentId, currentCycleStart, currentPeriodEnd, currentPeriodLength, now, now],
  );

  return {
    id: currentId, startDate: currentCycleStart, endDate: null,
    periodEndDate: currentPeriodEnd, cycleLength: null, periodLength: currentPeriodLength,
    notes: '', createdAt: now, updatedAt: now,
  };
}
