// ============================================================
// Velora — PredictionEngine
// Pure functions for cycle prediction, confidence scoring,
// fertile window estimation, and prediction transparency.
// No side effects, no DB, no UI dependencies.
//
// Scientific refs: Cleveland Clinic (SR1), ACOG (SR1), UCSF (SR2)
// ============================================================

import type { Cycle, Prediction, CycleStatistics } from '@src/types';
import { PredictionConfidence } from '@src/types';
import { weightedAverage, standardDeviation, clamp, roundTo } from '@src/utils/mathUtils';
import { addDays, subDays, diffDays, nowISO } from '@src/utils/dateUtils';
import { generateId } from '@src/utils/idUtils';

/** Maximum number of recent cycles to use for prediction */
const MAX_CYCLES_FOR_PREDICTION = 12;

// ────────────────────────────────────────────────────────────
// 1. Weighted Average Cycle Length
// ────────────────────────────────────────────────────────────

/**
 * Calculate weighted average cycle length from completed cycles.
 * Uses recency-weighted formula: most recent cycle gets weight 6,
 * 2nd most recent weight 5, etc. down to weight 1.
 * Only uses cycles with non-null cycleLength (max 12 most recent).
 *
 * @param cycles - all cycles, ordered newest → oldest (as from DB)
 * @returns weighted average cycle length, or 0 if no completed cycles
 */
export function calculateWeightedAverageCycleLength(cycles: Cycle[]): number {
  const completedLengths = getCompletedCycleLengths(cycles);
  if (completedLengths.length === 0) return 0;

  return roundTo(weightedAverage(completedLengths), 1);
}

// ────────────────────────────────────────────────────────────
// 2. Cycle Variability (Standard Deviation)
// ────────────────────────────────────────────────────────────

/**
 * Calculate standard deviation of cycle lengths.
 * Measures cycle-to-cycle variability in days.
 *
 * @param cycles - all cycles, ordered newest → oldest
 * @returns standard deviation in days, or 0 if fewer than 2 completed cycles
 */
export function calculateCycleVariability(cycles: Cycle[]): number {
  const completedLengths = getCompletedCycleLengths(cycles);
  if (completedLengths.length < 2) return 0;

  return roundTo(standardDeviation(completedLengths), 2);
}

// ────────────────────────────────────────────────────────────
// 3. Confidence Scoring
// ────────────────────────────────────────────────────────────

/**
 * Determine prediction confidence level and numeric score.
 *
 * HIGH:   n >= 6 AND std_dev <= 2 → score 80–100
 * MEDIUM: n >= 3 AND std_dev <= 4 → score 40–79
 * LOW:    n < 3 OR std_dev > 4    → score 10–39
 * NONE:   no completed cycles     → score 0
 *
 * Score formula: base_score + bonus(n) - penalty(std_dev)
 */
export function calculateConfidence(cycles: Cycle[]): {
  level: PredictionConfidence;
  score: number;
  factors: string[];
} {
  const completedLengths = getCompletedCycleLengths(cycles);
  const n = completedLengths.length;

  if (n === 0) {
    return {
      level: PredictionConfidence.NONE,
      score: 0,
      factors: ['No completed cycles available'],
    };
  }

  const stdDev = standardDeviation(completedLengths);
  const factors: string[] = [];

  // Determine level
  let level: PredictionConfidence;
  let baseScore: number;

  if (n >= 6 && stdDev <= 2) {
    level = PredictionConfidence.HIGH;
    baseScore = 80;
    factors.push(`${n} cycles tracked (≥6)`);
    factors.push(`Low variability: ±${roundTo(stdDev, 1)} days`);
  } else if (n >= 3 && stdDev <= 4) {
    level = PredictionConfidence.MEDIUM;
    baseScore = 50;
    factors.push(`${n} cycles tracked`);
    if (stdDev <= 2) {
      factors.push(`Low variability: ±${roundTo(stdDev, 1)} days`);
    } else {
      factors.push(`Moderate variability: ±${roundTo(stdDev, 1)} days`);
    }
    if (n < 6) {
      factors.push('Track more cycles for higher confidence');
    }
  } else {
    level = PredictionConfidence.LOW;
    baseScore = 20;
    if (n < 3) {
      factors.push(`Only ${n} cycle${n === 1 ? '' : 's'} tracked`);
      factors.push('Need at least 3 cycles for better predictions');
    }
    if (stdDev > 4) {
      factors.push(`High variability: ±${roundTo(stdDev, 1)} days`);
    }
  }

  // Calculate bonus from cycle count (max +15 at n=12)
  const cycleBonus = Math.min(n, MAX_CYCLES_FOR_PREDICTION) * 1.25;

  // Calculate penalty from variability (higher std_dev = lower score)
  const variabilityPenalty = stdDev * 2;

  const score = clamp(Math.round(baseScore + cycleBonus - variabilityPenalty), 0, 100);

  return { level, score, factors };
}

// ────────────────────────────────────────────────────────────
// 4. Full Prediction Generation
// ────────────────────────────────────────────────────────────

/**
 * Generate full prediction for next cycle.
 *
 * Algorithm:
 *   1. Filter cycles with non-null cycleLength (or fall back to onboarding data)
 *   2. Calculate weighted average cycle length
 *   3. Calculate std deviation → confidence
 *   4. predicted_period_start = last_cycle_start + weighted_avg
 *   5. predicted_period_end = predicted_start + avg_period_length
 *   6. estimated_ovulation = predicted_start − luteal_phase (SR1, SR2)
 *   7. fertile_window = [ovulation − 5, ovulation] (SR1: 6-day window)
 *   8. range = std_dev × multiplier based on confidence
 *   9. Generate human-readable basisDescription
 *
 * Falls back to onboarding averageCycleLength when no completed cycles exist.
 *
 * @returns Prediction object, or null if no cycles and no onboarding data
 */
export function generatePrediction(
  cycles: Cycle[],
  settings: { lutealPhase: number; fertilityTracking: boolean; avgPeriodLength: number },
  onboardingCycleLength?: number,
): Prediction | null {
  const completedLengths = getCompletedCycleLengths(cycles);

  // Find the most recent cycle (first in the array, which is newest→oldest)
  const mostRecentCycle = cycles[0];
  if (!mostRecentCycle) return null;

  // Determine cycle length to use: completed cycle data or onboarding fallback
  let avgCycleLength: number;
  let stdDev: number;
  let confidence: PredictionConfidence;
  let confidenceScore: number;
  let cycleCountUsed: number;
  let basedOnCycleIds: string[];
  let usingOnboardingFallback = false;

  if (completedLengths.length > 0) {
    // Use actual completed cycle data
    avgCycleLength = weightedAverage(completedLengths);
    stdDev = completedLengths.length >= 2 ? standardDeviation(completedLengths) : 0;
    const conf = calculateConfidence(cycles);
    confidence = conf.level;
    confidenceScore = conf.score;
    cycleCountUsed = completedLengths.length;
    basedOnCycleIds = cycles
      .filter((c) => c.cycleLength !== null)
      .slice(0, MAX_CYCLES_FOR_PREDICTION)
      .map((c) => c.id);
  } else if (onboardingCycleLength && onboardingCycleLength > 0) {
    // Fall back to onboarding data — no completed cycles yet
    avgCycleLength = onboardingCycleLength;
    stdDev = 0;
    confidence = PredictionConfidence.LOW;
    confidenceScore = 15;
    cycleCountUsed = 0;
    basedOnCycleIds = [mostRecentCycle.id];
    usingOnboardingFallback = true;
  } else {
    return null;
  }

  const roundedAvg = roundTo(avgCycleLength, 1);

  // Predicted next period start: most recent cycle start + avg cycle length
  const predictedStart = addDays(mostRecentCycle.startDate, Math.round(avgCycleLength));

  // Predicted period end: start + average period length
  const avgPeriodLen = settings.avgPeriodLength;
  const predictedEnd = addDays(predictedStart, avgPeriodLen - 1);

  // Date range based on confidence
  const predictedRange = calculatePredictionRange(predictedStart, stdDev, confidence);

  // Ovulation: predicted_start − luteal_phase (SR1: Cleveland Clinic, SR2: UCSF)
  // This gives the ovulation day within the CURRENT cycle leading to the predicted period
  const ovulationDayOffset = Math.round(avgCycleLength) - settings.lutealPhase;
  const estimatedOvulation = addDays(mostRecentCycle.startDate, ovulationDayOffset);

  // Fertile window: 6 days [ovulation−5, ovulation] (SR1: sperm 5 days, egg 12-24 hrs)
  const fertileStart = subDays(estimatedOvulation, 5);
  const fertileEnd = estimatedOvulation;

  // Basis description
  const basisDescription = usingOnboardingFallback
    ? `Based on your reported average cycle length of ${Math.round(avgCycleLength)} days. Low confidence — track more cycles for better predictions.`
    : generatePredictionBasis(
        cycleCountUsed,
        roundedAvg,
        roundTo(stdDev, 1),
        confidence,
      );

  return {
    id: generateId(),
    basedOnCycleIds,
    predictedPeriodStart: predictedStart,
    predictedPeriodEnd: predictedEnd,
    predictedPeriodStartRange: predictedRange,
    estimatedOvulationDate: estimatedOvulation,
    fertileWindowStart: fertileStart,
    fertileWindowEnd: fertileEnd,
    confidence,
    confidenceScore,
    averageCycleLength: roundedAvg,
    standardDeviation: roundTo(stdDev, 2),
    lutealPhaseEstimate: settings.lutealPhase,
    basisDescription,
    createdAt: nowISO(),
  };
}

/**
 * Generate predictions for multiple upcoming cycles (3 by default).
 * Each prediction projects forward by N × cycleLength from the last period start.
 *
 * @param cycles - all cycles, ordered newest → oldest
 * @param settings - lutealPhase, fertilityTracking, avgPeriodLength
 * @param onboardingCycleLength - fallback cycle length from onboarding
 * @param count - number of upcoming cycles to predict (default 3)
 * @returns array of Prediction objects for upcoming cycles
 */
export function generateMultiCyclePredictions(
  cycles: Cycle[],
  settings: { lutealPhase: number; fertilityTracking: boolean; avgPeriodLength: number },
  onboardingCycleLength?: number,
  count: number = 3,
): Prediction[] {
  const completedLengths = getCompletedCycleLengths(cycles);
  const mostRecentCycle = cycles[0];
  if (!mostRecentCycle) return [];

  // Determine cycle length to use
  let avgCycleLength: number;
  let stdDev: number;
  let confidence: PredictionConfidence;
  let confidenceScore: number;
  let cycleCountUsed: number;
  let usingOnboardingFallback = false;

  if (completedLengths.length > 0) {
    avgCycleLength = weightedAverage(completedLengths);
    stdDev = completedLengths.length >= 2 ? standardDeviation(completedLengths) : 0;
    const conf = calculateConfidence(cycles);
    confidence = conf.level;
    confidenceScore = conf.score;
    cycleCountUsed = completedLengths.length;
  } else if (onboardingCycleLength && onboardingCycleLength > 0) {
    avgCycleLength = onboardingCycleLength;
    stdDev = 0;
    confidence = PredictionConfidence.LOW;
    confidenceScore = 15;
    cycleCountUsed = 0;
    usingOnboardingFallback = true;
  } else {
    return [];
  }

  const roundedAvg = roundTo(avgCycleLength, 1);
  const roundedCycleLen = Math.round(avgCycleLength);
  const predictions: Prediction[] = [];

  for (let i = 1; i <= count; i++) {
    // Each upcoming cycle starts i × cycleLength days after the most recent cycle start
    const predictedStart = addDays(mostRecentCycle.startDate, roundedCycleLen * i);
    const predictedEnd = addDays(predictedStart, settings.avgPeriodLength - 1);
    const predictedRange = calculatePredictionRange(predictedStart, stdDev, confidence);

    // Ovulation for this predicted cycle: predictedStart + (cycleLength - lutealPhase)
    // This is the ovulation WITHIN the predicted cycle
    const ovulationDayInCycle = roundedCycleLen - settings.lutealPhase;
    const estimatedOvulation = addDays(predictedStart, ovulationDayInCycle);
    const fertileStart = subDays(estimatedOvulation, 5);
    const fertileEnd = estimatedOvulation;

    const basisDescription = usingOnboardingFallback
      ? `Cycle ${i}: Based on your reported average cycle length of ${roundedCycleLen} days.`
      : `Cycle ${i}: Based on your last ${cycleCountUsed} cycles averaging ${roundedAvg} days.`;

    predictions.push({
      id: generateId(),
      basedOnCycleIds: [mostRecentCycle.id],
      predictedPeriodStart: predictedStart,
      predictedPeriodEnd: predictedEnd,
      predictedPeriodStartRange: predictedRange,
      estimatedOvulationDate: estimatedOvulation,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
      confidence,
      confidenceScore,
      averageCycleLength: roundedAvg,
      standardDeviation: roundTo(stdDev, 2),
      lutealPhaseEstimate: settings.lutealPhase,
      basisDescription,
      createdAt: nowISO(),
    });
  }

  return predictions;
}

// ────────────────────────────────────────────────────────────
// 5. Prediction Date Range
// ────────────────────────────────────────────────────────────

/**
 * Calculate prediction date range based on confidence.
 * HIGH: exact date (range = 0)
 * MEDIUM: ± std_dev × 1.0
 * LOW: ± std_dev × 1.5
 *
 * @returns [earliestDate, latestDate] as ISO date strings
 */
export function calculatePredictionRange(
  predictedDate: string,
  stdDev: number,
  confidence: PredictionConfidence,
): [string, string] {
  let marginDays: number;

  switch (confidence) {
    case PredictionConfidence.HIGH:
      marginDays = 0;
      break;
    case PredictionConfidence.MEDIUM:
      marginDays = Math.round(stdDev * 1.0);
      break;
    case PredictionConfidence.LOW:
      marginDays = Math.round(stdDev * 1.5);
      break;
    default:
      marginDays = Math.round(stdDev * 2.0);
      break;
  }

  // Ensure at least 0 margin
  marginDays = Math.max(0, marginDays);

  const earliest = marginDays > 0 ? subDays(predictedDate, marginDays) : predictedDate;
  const latest = marginDays > 0 ? addDays(predictedDate, marginDays) : predictedDate;

  return [earliest, latest];
}

// ────────────────────────────────────────────────────────────
// 6. Human-Readable Prediction Basis
// ────────────────────────────────────────────────────────────

/**
 * Generate human-readable explanation of how prediction was made.
 *
 * Examples:
 *   "Based on your last 6 cycles averaging 29 days (±1.2 days). High confidence."
 *   "Based on your last 2 cycles averaging 30 days. Low confidence — more data needed."
 */
export function generatePredictionBasis(
  cycleCount: number,
  weightedAvg: number,
  stdDev: number,
  confidence: PredictionConfidence,
): string {
  const cycleText = cycleCount === 1 ? '1 cycle' : `${cycleCount} cycles`;
  const avgText = `averaging ${weightedAvg} days`;
  const variabilityText = stdDev > 0 ? ` (±${stdDev} days)` : '';

  let confidenceText: string;
  switch (confidence) {
    case PredictionConfidence.HIGH:
      confidenceText = 'High confidence.';
      break;
    case PredictionConfidence.MEDIUM:
      confidenceText = 'Medium confidence — tracking more cycles will improve accuracy.';
      break;
    case PredictionConfidence.LOW:
      confidenceText = 'Low confidence — more data needed for reliable predictions.';
      break;
    default:
      confidenceText = 'Not enough data for predictions.';
      break;
  }

  return `Based on your last ${cycleText} ${avgText}${variabilityText}. ${confidenceText}`;
}

// ────────────────────────────────────────────────────────────
// 7. Cycle Statistics
// ────────────────────────────────────────────────────────────

/**
 * Generate cycle statistics summary from historical data.
 *
 * @param cycles - all cycles, ordered newest → oldest
 * @returns CycleStatistics object, or null if no completed cycles
 */
export function generateCycleStatistics(cycles: Cycle[]): CycleStatistics | null {
  const completedCycles = cycles.filter((c) => c.cycleLength !== null);
  if (completedCycles.length === 0) return null;

  const lengths = completedCycles.map((c) => c.cycleLength as number);
  const periodLengths = completedCycles
    .filter((c) => c.periodLength !== null)
    .map((c) => c.periodLength as number);

  const avgCycleLength = roundTo(
    lengths.reduce((sum, v) => sum + v, 0) / lengths.length,
    1,
  );
  const avgPeriodLength =
    periodLengths.length > 0
      ? roundTo(periodLengths.reduce((sum, v) => sum + v, 0) / periodLengths.length, 1)
      : 0;

  const shortestCycle = Math.min(...lengths);
  const longestCycle = Math.max(...lengths);
  const cycleVariability = roundTo(standardDeviation(lengths), 2);

  // Regularity score: 100 = perfectly regular, decreases with variability
  // Score = 100 - (stdDev * 10), clamped to 0–100
  const regularityScore = clamp(Math.round(100 - cycleVariability * 10), 0, 100);

  // Irregularity flag based on FIGO-inspired thresholds
  let irregularityFlag: 'normal' | 'mildly_irregular' | 'irregular';
  if (cycleVariability <= 2) {
    irregularityFlag = 'normal';
  } else if (cycleVariability <= 4) {
    irregularityFlag = 'mildly_irregular';
  } else {
    irregularityFlag = 'irregular';
  }

  return {
    totalCycles: completedCycles.length,
    averageCycleLength: avgCycleLength,
    averagePeriodLength: avgPeriodLength,
    shortestCycle,
    longestCycle,
    cycleVariability,
    regularityScore,
    irregularityFlag,
  };
}

// ────────────────────────────────────────────────────────────
// Internal Helpers
// ────────────────────────────────────────────────────────────

/**
 * Extract completed cycle lengths from cycles array.
 * Filters to cycles with non-null cycleLength, takes up to MAX_CYCLES_FOR_PREDICTION,
 * and returns them ordered oldest → newest (for weighted average).
 */
function getCompletedCycleLengths(cycles: Cycle[]): number[] {
  return cycles
    .filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null)
    .slice(0, MAX_CYCLES_FOR_PREDICTION)
    .map((c) => c.cycleLength)
    .reverse(); // DB returns newest→oldest; weightedAverage expects oldest→newest
}
