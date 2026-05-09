// ============================================================
// Velora — Database Schema
// SQLite CREATE TABLE statements for Phase 1
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
 * All schema creation statements in order.
 */
export const SCHEMA_STATEMENTS = [
  CREATE_CYCLES_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_CYCLES_INDEX,
];