// ============================================================
// Luna — Medical Constants
// Based on ACOG Committee Opinion 651, Cleveland Clinic, FIGO
// ============================================================

/** Normal menstrual cycle range per ACOG: 24–38 days */
export const NORMAL_CYCLE_MIN = 24;
export const NORMAL_CYCLE_MAX = 38;

/** Normal period (bleeding) duration: 3–7 days */
export const NORMAL_PERIOD_MIN = 3;
export const NORMAL_PERIOD_MAX = 7;

/** Default average cycle length when no data available */
export const DEFAULT_CYCLE_LENGTH = 28;

/** Default average period length when no data available */
export const DEFAULT_PERIOD_LENGTH = 5;

/** Default luteal phase length (relatively constant ~14 days per UCSF) */
export const DEFAULT_LUTEAL_PHASE = 14;

/** Luteal phase normal range: 10–16 days */
export const LUTEAL_PHASE_MIN = 10;
export const LUTEAL_PHASE_MAX = 16;

/** Validation limits — wider than "normal" for data entry */
export const VALID_CYCLE_MIN = 15;
export const VALID_CYCLE_MAX = 60;
export const VALID_PERIOD_MIN = 1;
export const VALID_PERIOD_MAX = 15;

/** Onboarding slider ranges */
export const ONBOARDING_CYCLE_MIN = 21;
export const ONBOARDING_CYCLE_MAX = 45;
export const ONBOARDING_PERIOD_MIN = 1;
export const ONBOARDING_PERIOD_MAX = 10;

/** FIGO irregularity thresholds */
export const IRREGULARITY_VARIATION_THRESHOLD = 8; // days
export const AMENORRHEA_THRESHOLD = 90; // days without period

/** Typical symptoms list for onboarding multi-select */
export const TYPICAL_SYMPTOMS = [
  'Cramps',
  'Headaches',
  'Bloating',
  'Mood swings',
  'Fatigue',
  'Acne',
  'Back pain',
  'Breast tenderness',
  'Nausea',
  'Food cravings',
] as const;

/** Medical disclaimer text */
export const MEDICAL_DISCLAIMER =
  'This app does not provide medical advice. Wellness suggestions are general information based on common patterns and should not replace professional medical guidance.';

/** Privacy notice text */
export const PRIVACY_NOTICE =
  'Your data stays on your device. Luna does not send any health data to external servers.';