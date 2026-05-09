// ============================================================
// Velora — Database Migrations
// Version-based migration runner for schema evolution
// ============================================================

import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_STATEMENTS, SCHEMA_V2_STATEMENTS, SCHEMA_V3_STATEMENTS } from './schema';

/** Current database schema version */
const CURRENT_VERSION = 3;

/**
 * Initialize the database: create tables and run any pending migrations.
 * Called once on app startup via SQLiteProvider's onInit callback.
 */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // Enable WAL mode for better concurrent performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Get current schema version
  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion < 1) {
    await migrateToV1(db);
  }

  if (currentVersion < 2) {
    await migrateToV2(db);
  }

  if (currentVersion < 3) {
    await migrateToV3(db);
  }

  // Set the current version
  await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);
}

/**
 * Migration v0 → v1: Create initial schema.
 */
async function migrateToV1(db: SQLiteDatabase): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execAsync(statement);
  }
}

/**
 * Migration v1 → v2: Add predictions table for Phase 2.
 */
async function migrateToV2(db: SQLiteDatabase): Promise<void> {
  for (const statement of SCHEMA_V2_STATEMENTS) {
    await db.execAsync(statement);
  }
}

/**
 * Migration v2 → v3: Add daily_logs table for Phase 3.
 */
async function migrateToV3(db: SQLiteDatabase): Promise<void> {
  for (const statement of SCHEMA_V3_STATEMENTS) {
    await db.execAsync(statement);
  }
}
