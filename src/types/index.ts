// ============================================================
// Velora — Type Definitions (Phase 1 + Phase 2 + Phase 3)
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

// --- Phase 2: Prediction Types ---

export enum PredictionConfidence {
  HIGH = 'high',       // n >= 6 cycles AND std_dev <= 2 days
  MEDIUM = 'medium',   // n >= 3 cycles AND std_dev <= 4 days
  LOW = 'low',         // n < 3 OR std_dev > 4 days
  NONE = 'none',       // no completed cycles with cycle_length
}

export interface Prediction {
  id: string;
  basedOnCycleIds: string[];           // IDs of cycles used for calculation
  predictedPeriodStart: string;         // ISO YYYY-MM-DD
  predictedPeriodEnd: string;           // ISO YYYY-MM-DD (start + avg period length)
  predictedPeriodStartRange: [string, string]; // [earliest, latest] — widens with lower confidence
  estimatedOvulationDate: string;       // ISO YYYY-MM-DD
  fertileWindowStart: string;           // ISO YYYY-MM-DD (ovulation − 5)
  fertileWindowEnd: string;             // ISO YYYY-MM-DD (= ovulation day)
  confidence: PredictionConfidence;
  confidenceScore: number;              // 0–100 numeric score
  averageCycleLength: number;           // weighted average used
  standardDeviation: number;            // cycle variability in days
  lutealPhaseEstimate: number;          // days (default 14)
  basisDescription: string;             // human-readable explanation
  createdAt: string;                    // ISO datetime
}

export interface CycleStatistics {
  totalCycles: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  shortestCycle: number;
  longestCycle: number;
  cycleVariability: number;             // standard deviation in days
  regularityScore: number;              // 0–100
  irregularityFlag: 'normal' | 'mildly_irregular' | 'irregular';
}

// --- Phase 3: Daily Logging & Insights Types ---

export enum MoodType {
  HAPPY = 'happy',
  CALM = 'calm',
  ENERGETIC = 'energetic',
  ANXIOUS = 'anxious',
  SAD = 'sad',
  IRRITABLE = 'irritable',
  SENSITIVE = 'sensitive',
  NEUTRAL = 'neutral',
}

export enum CervicalMucusType {
  DRY = 'dry',
  STICKY = 'sticky',
  CREAMY = 'creamy',
  WATERY = 'watery',
  EGG_WHITE = 'egg_white',
}

export interface DailyLog {
  id: string;
  date: string;                          // ISO YYYY-MM-DD (unique per day)
  cycleId: string | null;                // FK to current cycle
  flow: FlowIntensity | null;
  mood: MoodType[];                      // multiple moods per day
  crampsSeverity: Severity;
  headacheSeverity: Severity;
  acneSeverity: Severity;
  bloatingSeverity: Severity;
  backPainSeverity: Severity;
  breastTendernessSeverity: Severity;
  libido: Severity;
  discharge: CervicalMucusType | null;
  sleepHours: number | null;
  exerciseMinutes: number | null;
  waterIntakeMl: number | null;
  bodyTemperature: number | null;        // in user's preferred unit
  basalBodyTemperature: number | null;   // in user's preferred unit
  weight: number | null;                 // in user's preferred unit
  medication: string[];                  // free-text medication names
  notes: string;
  createdAt: string;                     // ISO datetime
  updatedAt: string;                     // ISO datetime
}

export interface InsightItem {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'statistic';
  title: string;
  description: string;
  dataSource: string;                    // e.g. "Based on your last 6 cycles"
  confidence: number;                    // 0–100
  generatedAt: string;                   // ISO datetime
}
