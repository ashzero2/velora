// ============================================================
// Velora — Phase 1 Type Definitions
// ============================================================

// --- Enums ---

export enum CyclePhase {
  MENSTRUATION = 'menstruation',
  FOLLICULAR = 'follicular',
  OVULATION = 'ovulation',
  LUTEAL = 'luteal',
  UNKNOWN = 'unknown',
}

export enum FlowIntensity {
  SPOTTING = 'spotting',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  VERY_HEAVY = 'very_heavy',
}

export enum Severity {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  VERY_SEVERE = 4,
}

// --- Core Interfaces ---

export interface Cycle {
  id: string;
  startDate: string;            // ISO YYYY-MM-DD
  endDate: string | null;       // null = current/ongoing cycle
  periodEndDate: string | null; // when bleeding stopped
  cycleLength: number | null;   // calculated when next cycle starts
  periodLength: number | null;  // calculated from start to periodEnd
  notes: string;
  createdAt: string;            // ISO datetime
  updatedAt: string;            // ISO datetime
}

export interface CyclePhaseInfo {
  phase: CyclePhase;
  dayInPhase: number;
  totalPhaseDays: number;
  cycleDay: number;
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
}

export interface PhaseBoundaries {
  menstruation: [number, number];  // [startDay, endDay] inclusive
  follicular: [number, number];
  ovulation: [number, number];
  luteal: [number, number];
}

export interface OnboardingData {
  lastPeriodStart: string;          // ISO YYYY-MM-DD
  averageCycleLength: number;       // days
  averagePeriodLength: number;      // days
  typicalSymptoms?: string[];
  isIrregular?: boolean;
  fertilityTracking?: boolean;
  completedAt: string;              // ISO datetime
}

export interface UserSettings {
  onboardingComplete: boolean;
  darkMode: boolean | 'system';
  fertilityTrackingEnabled: boolean;
  temperatureUnit: 'fahrenheit' | 'celsius';
  weightUnit: 'kg' | 'lbs';
  waterUnit: 'ml' | 'oz';
  defaultLutealPhase: number;       // default 14
}

export interface CycleValidation {
  valid: boolean;
  errors: string[];
}

export interface PhaseDescription {
  description: string;
  hormonalTrends: string;
  commonSymptoms: string[];
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
}