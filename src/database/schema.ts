// ============================================================
// Velora — Database Schema
// SQLite CREATE TABLE statements for Phase 1 + Phase 2
// ============================================================

/**
 * SQL to create the cycles table.
 */
export const CREATE_CYCLES_TABLE = `
  CREATE TABLE IF NOT EXISTS cycles (
    id TEXT PRIMARY KEY,
    start_date TEXT NOT NULL,
    end_date TEXT,
    period_end_date TEXT,
    cycle_length INTEGER,
    period_length INTEGER,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

/**
 * SQL to create the settings table (key-value store).
 */
export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

/**
 * Index on cycles.start_date for fast lookups.
 */
export const CREATE_CYCLES_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_cycles_start_date ON cycles(start_date);
`;

/**
 * SQL to create the predictions table (Phase 2).
 */
export const CREATE_PREDICTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    based_on_cycle_ids TEXT NOT NULL,
    predicted_period_start TEXT NOT NULL,
    predicted_period_end TEXT NOT NULL,
    predicted_start_range_early TEXT,
    predicted_start_range_late TEXT,
    estimated_ovulation_date TEXT,
    fertile_window_start TEXT,
    fertile_window_end TEXT,
    confidence TEXT NOT NULL,
    confidence_score INTEGER,
    average_cycle_length REAL,
    standard_deviation REAL,
    luteal_phase_estimate INTEGER,
    basis_description TEXT,
    created_at TEXT NOT NULL
  );
`;

/**
 * Index on predictions.created_at for fast ordering.
 */
export const CREATE_PREDICTIONS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at);
`;

/**
 * All Phase 1 schema creation statements in order.
 */
export const SCHEMA_STATEMENTS = [
  CREATE_CYCLES_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_CYCLES_INDEX,
];

/**
 * Phase 2 schema statements (predictions table).
 */
export const SCHEMA_V2_STATEMENTS = [
  CREATE_PREDICTIONS_TABLE,
  CREATE_PREDICTIONS_INDEX,
];
