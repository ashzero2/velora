// ============================================================
// Luna — Settings Repository
// Key-value settings storage operations.
// All functions accept a SQLiteDatabase instance.
// ============================================================

import type { SQLiteDatabase } from 'expo-sqlite';
import type { OnboardingData, UserSettings } from '@src/types';
import { nowISO } from '@src/utils/dateUtils';
import { DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';

/** Row shape returned from SQLite */
interface SettingRow {
  key: string;
  value: string;
  updated_at: string;
}

/**
 * Get a setting value by key, with optional default.
 */
export async function getSetting(
  db: SQLiteDatabase,
  key: string,
  defaultValue?: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<SettingRow>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  return row?.value ?? defaultValue ?? null;
}

/**
 * Set a setting value (upsert — insert or update).
 */
export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, now],
  );
}

/**
 * Get all settings as a key-value object.
 */
export async function getAllSettings(
  db: SQLiteDatabase,
): Promise<Record<string, string>> {
  const rows = await db.getAllAsync<SettingRow>('SELECT * FROM settings');
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

/**
 * Delete a setting by key.
 */
export async function deleteSetting(
  db: SQLiteDatabase,
  key: string,
): Promise<void> {
  await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);
}

/**
 * Save complete onboarding data (multiple settings in one go).
 */
export async function saveOnboardingData(
  db: SQLiteDatabase,
  data: OnboardingData,
): Promise<void> {
  await setSetting(db, 'onboarding_last_period_start', data.lastPeriodStart);
  await setSetting(db, 'onboarding_avg_cycle_length', String(data.averageCycleLength));
  await setSetting(db, 'onboarding_avg_period_length', String(data.averagePeriodLength));
  await setSetting(db, 'onboarding_completed_at', data.completedAt);
  await setSetting(db, 'onboarding_complete', 'true');

  if (data.typicalSymptoms && data.typicalSymptoms.length > 0) {
    await setSetting(db, 'onboarding_typical_symptoms', JSON.stringify(data.typicalSymptoms));
  }
  if (data.isIrregular !== undefined) {
    await setSetting(db, 'onboarding_is_irregular', String(data.isIrregular));
  }
  if (data.fertilityTracking !== undefined) {
    await setSetting(db, 'onboarding_fertility_tracking', String(data.fertilityTracking));
    await setSetting(db, 'fertility_tracking_enabled', String(data.fertilityTracking));
  }
}

/**
 * Load onboarding data from settings.
 * Returns null if onboarding hasn't been completed.
 */
export async function getOnboardingData(
  db: SQLiteDatabase,
): Promise<OnboardingData | null> {
  const completedAt = await getSetting(db, 'onboarding_completed_at');
  if (!completedAt) return null;

  const lastPeriodStart = await getSetting(db, 'onboarding_last_period_start');
  const avgCycleLength = await getSetting(db, 'onboarding_avg_cycle_length');
  const avgPeriodLength = await getSetting(db, 'onboarding_avg_period_length');
  const typicalSymptomsRaw = await getSetting(db, 'onboarding_typical_symptoms');
  const isIrregularRaw = await getSetting(db, 'onboarding_is_irregular');
  const fertilityTrackingRaw = await getSetting(db, 'onboarding_fertility_tracking');

  return {
    lastPeriodStart: lastPeriodStart ?? '',
    averageCycleLength: avgCycleLength ? parseInt(avgCycleLength, 10) : 28,
    averagePeriodLength: avgPeriodLength ? parseInt(avgPeriodLength, 10) : 5,
    typicalSymptoms: typicalSymptomsRaw ? JSON.parse(typicalSymptomsRaw) : undefined,
    isIrregular: isIrregularRaw ? isIrregularRaw === 'true' : undefined,
    fertilityTracking: fertilityTrackingRaw ? fertilityTrackingRaw === 'true' : undefined,
    completedAt,
  };
}

/** Default user settings */
const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  darkMode: 'system',
  fertilityTrackingEnabled: false,
  temperatureUnit: 'fahrenheit',
  weightUnit: 'kg',
  waterUnit: 'ml',
  defaultLutealPhase: DEFAULT_LUTEAL_PHASE,
};

/**
 * Save user settings object.
 */
export async function saveUserSettings(
  db: SQLiteDatabase,
  settings: Partial<UserSettings>,
): Promise<void> {
  if (settings.onboardingComplete !== undefined) {
    await setSetting(db, 'onboarding_complete', String(settings.onboardingComplete));
  }
  if (settings.darkMode !== undefined) {
    await setSetting(db, 'dark_mode', String(settings.darkMode));
  }
  if (settings.fertilityTrackingEnabled !== undefined) {
    await setSetting(db, 'fertility_tracking_enabled', String(settings.fertilityTrackingEnabled));
  }
  if (settings.temperatureUnit !== undefined) {
    await setSetting(db, 'temperature_unit', settings.temperatureUnit);
  }
  if (settings.weightUnit !== undefined) {
    await setSetting(db, 'weight_unit', settings.weightUnit);
  }
  if (settings.waterUnit !== undefined) {
    await setSetting(db, 'water_unit', settings.waterUnit);
  }
  if (settings.defaultLutealPhase !== undefined) {
    await setSetting(db, 'default_luteal_phase', String(settings.defaultLutealPhase));
  }
}

/**
 * Load user settings with defaults for any missing values.
 */
export async function getUserSettings(
  db: SQLiteDatabase,
): Promise<UserSettings> {
  const all = await getAllSettings(db);

  return {
    onboardingComplete: all['onboarding_complete'] === 'true',
    darkMode: all['dark_mode'] === 'true'
      ? true
      : all['dark_mode'] === 'false'
        ? false
        : 'system',
    fertilityTrackingEnabled: all['fertility_tracking_enabled'] === 'true',
    temperatureUnit: (all['temperature_unit'] as 'fahrenheit' | 'celsius') ?? DEFAULT_SETTINGS.temperatureUnit,
    weightUnit: (all['weight_unit'] as 'kg' | 'lbs') ?? DEFAULT_SETTINGS.weightUnit,
    waterUnit: (all['water_unit'] as 'ml' | 'oz') ?? DEFAULT_SETTINGS.waterUnit,
    defaultLutealPhase: all['default_luteal_phase']
      ? parseInt(all['default_luteal_phase'], 10)
      : DEFAULT_SETTINGS.defaultLutealPhase,
  };
}

/**
 * Reset all onboarding-related settings.
 */
export async function resetOnboarding(db: SQLiteDatabase): Promise<void> {
  const onboardingKeys = [
    'onboarding_complete',
    'onboarding_completed_at',
    'onboarding_last_period_start',
    'onboarding_avg_cycle_length',
    'onboarding_avg_period_length',
    'onboarding_typical_symptoms',
    'onboarding_is_irregular',
    'onboarding_fertility_tracking',
  ];

  for (const key of onboardingKeys) {
    await deleteSetting(db, key);
  }
}