// ============================================================
// Velora — SymptomAnalyticsEngine
// Pure functions for symptom pattern detection, phase correlations,
// trend analysis, and mood pattern analytics.
// No side effects, no DB, no UI dependencies.
//
// Scientific refs: Cleveland Clinic (SR1), DRSP (SR2), ACOG (SR4),
//                  Harvard Apple Study (SR5)
// ============================================================

import type { Cycle, DailyLog, InsightItem } from '@src/types';
import { CyclePhase, Severity, MoodType } from '@src/types';
import { getCurrentPhase, getPhaseBoundaries } from '@src/engines/CycleEngine';
import { diffDays, nowISO } from '@src/utils/dateUtils';
import { generateId } from '@src/utils/idUtils';
import { roundTo } from '@src/utils/mathUtils';
import { SYMPTOM_CATEGORIES } from '@src/constants/symptoms';

/** Symptom severity field names on DailyLog */
type SymptomKey = 'crampsSeverity' | 'headacheSeverity' | 'acneSeverity' | 'bloatingSeverity' | 'backPainSeverity' | 'breastTendernessSeverity';

const SYMPTOM_KEYS: { key: SymptomKey; label: string }[] = [
  { key: 'crampsSeverity', label: 'Cramps' },
  { key: 'headacheSeverity', label: 'Headaches' },
  { key: 'acneSeverity', label: 'Acne' },
  { key: 'bloatingSeverity', label: 'Bloating' },
  { key: 'backPainSeverity', label: 'Back pain' },
  { key: 'breastTendernessSeverity', label: 'Breast tenderness' },
];

const PHASE_LABELS: Record<CyclePhase, string> = {
  [CyclePhase.MENSTRUATION]: 'menstruation',
  [CyclePhase.FOLLICULAR]: 'follicular',
  [CyclePhase.OVULATION]: 'ovulation',
  [CyclePhase.LUTEAL]: 'luteal',
  [CyclePhase.UNKNOWN]: 'unknown',
};

// ────────────────────────────────────────────────────────────
// Helper: Map a log date to its cycle phase
// ────────────────────────────────────────────────────────────

function getPhaseForDate(
  logDate: string,
  cycle: Cycle,
  cycleLength: number,
  periodLength: number,
): CyclePhase {
  const daysDiff = diffDays(cycle.startDate, logDate);
  if (daysDiff < 0) return CyclePhase.UNKNOWN;
  const cycleDay = daysDiff + 1;
  if (cycleDay > cycleLength) return CyclePhase.UNKNOWN;
  const phaseInfo = getCurrentPhase(cycleDay, cycleLength, periodLength);
  return phaseInfo.phase;
}

/**
 * Find which cycle a log date belongs to.
 * Cycles are ordered newest → oldest.
 */
function findCycleForDate(date: string, cycles: Cycle[]): Cycle | null {
  for (const cycle of cycles) {
    const daysDiff = diffDays(cycle.startDate, date);
    if (daysDiff >= 0) {
      // Check if the date is within this cycle's range
      if (cycle.endDate) {
        if (diffDays(date, cycle.endDate) >= 0) return cycle;
      } else {
        // Ongoing cycle — date is after start
        return cycle;
      }
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// 1. Detect Symptom Patterns
// ────────────────────────────────────────────────────────────

/**
 * Detect symptom patterns across cycles.
 * Identifies symptoms that consistently appear in the same cycle phase.
 *
 * Algorithm:
 *   1. For each completed cycle, map daily logs to cycle days → phases
 *   2. For each symptom, count how many cycles have it in each phase
 *   3. If ≥60% of cycles show it in the same phase → pattern detected
 *
 * Ref SR5: Harvard study confirms cramps peak in menstruation, mood changes in luteal.
 */
export function detectSymptomPatterns(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  cycleLength: number,
  periodLength: number,
): InsightItem[] {
  const completedCycles = cycles.filter((c) => c.cycleLength !== null);
  if (completedCycles.length < 2) return [];

  const insights: InsightItem[] = [];

  for (const { key, label } of SYMPTOM_KEYS) {
    // For each phase, count how many cycles have this symptom present (severity > 0)
    const phaseCounts: Record<CyclePhase, number> = {
      [CyclePhase.MENSTRUATION]: 0,
      [CyclePhase.FOLLICULAR]: 0,
      [CyclePhase.OVULATION]: 0,
      [CyclePhase.LUTEAL]: 0,
      [CyclePhase.UNKNOWN]: 0,
    };

    for (const cycle of completedCycles) {
      const cycleLogs = dailyLogs.filter((log) => {
        const d = diffDays(cycle.startDate, log.date);
        return d >= 0 && (cycle.endDate ? diffDays(log.date, cycle.endDate) >= 0 : true);
      });

      // Check which phases have this symptom
      const phasesWithSymptom = new Set<CyclePhase>();
      for (const log of cycleLogs) {
        const severity = log[key] as Severity;
        if (severity > Severity.NONE) {
          const phase = getPhaseForDate(log.date, cycle, cycle.cycleLength ?? cycleLength, periodLength);
          if (phase !== CyclePhase.UNKNOWN) {
            phasesWithSymptom.add(phase);
          }
        }
      }

      for (const phase of phasesWithSymptom) {
        phaseCounts[phase]++;
      }
    }

    // Check for patterns (≥60% of cycles)
    const threshold = completedCycles.length * 0.6;
    for (const [phase, count] of Object.entries(phaseCounts)) {
      if (count >= threshold && phase !== CyclePhase.UNKNOWN) {
        const frequency = roundTo(count / completedCycles.length, 2);
        insights.push({
          id: generateId(),
          type: 'pattern',
          title: `${label} during ${PHASE_LABELS[phase as CyclePhase]}`,
          description: `${label} tends to appear during your ${PHASE_LABELS[phase as CyclePhase]} phase (${Math.round(frequency * 100)}% of cycles).`,
          dataSource: `Based on ${completedCycles.length} cycles`,
          confidence: Math.round(frequency * 100),
          generatedAt: nowISO(),
        });
      }
    }
  }

  return insights;
}

// ────────────────────────────────────────────────────────────
// 2. Find Phase Correlations
// ────────────────────────────────────────────────────────────

/**
 * Find correlations between symptoms and cycle phases.
 * Returns array of { symptom, phase, frequency (0–1), averageSeverity }.
 *
 * Ref SR1: PMS symptoms start 5–11 days before menstruation (luteal phase).
 * Ref SR4: ACOG confirms mood symptoms begin in luteal phase.
 */
export function findPhaseCorrelations(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  cycleLength: number,
  periodLength: number,
): { symptom: string; phase: CyclePhase; frequency: number; averageSeverity: number }[] {
  if (dailyLogs.length === 0 || cycles.length === 0) return [];

  const results: { symptom: string; phase: CyclePhase; frequency: number; averageSeverity: number }[] = [];

  for (const { key, label } of SYMPTOM_KEYS) {
    // Group severities by phase
    const phaseData: Record<CyclePhase, { total: number; count: number }> = {
      [CyclePhase.MENSTRUATION]: { total: 0, count: 0 },
      [CyclePhase.FOLLICULAR]: { total: 0, count: 0 },
      [CyclePhase.OVULATION]: { total: 0, count: 0 },
      [CyclePhase.LUTEAL]: { total: 0, count: 0 },
      [CyclePhase.UNKNOWN]: { total: 0, count: 0 },
    };

    for (const log of dailyLogs) {
      const cycle = findCycleForDate(log.date, cycles);
      if (!cycle) continue;

      const phase = getPhaseForDate(log.date, cycle, cycle.cycleLength ?? cycleLength, periodLength);
      const severity = log[key] as Severity;

      if (severity > Severity.NONE && phase !== CyclePhase.UNKNOWN) {
        phaseData[phase].total += severity;
        phaseData[phase].count++;
      }
    }

    // Find the phase with the highest frequency for this symptom
    for (const [phase, data] of Object.entries(phaseData)) {
      if (data.count > 0 && phase !== CyclePhase.UNKNOWN) {
        const totalLogsInPhase = dailyLogs.filter((log) => {
          const cycle = findCycleForDate(log.date, cycles);
          if (!cycle) return false;
          return getPhaseForDate(log.date, cycle, cycle.cycleLength ?? cycleLength, periodLength) === phase;
        }).length;

        const frequency = totalLogsInPhase > 0 ? roundTo(data.count / totalLogsInPhase, 2) : 0;
        const avgSeverity = roundTo(data.total / data.count, 1);

        if (frequency >= 0.3) { // Only report correlations with ≥30% frequency
          results.push({
            symptom: label,
            phase: phase as CyclePhase,
            frequency,
            averageSeverity: avgSeverity,
          });
        }
      }
    }
  }

  return results.sort((a, b) => b.frequency - a.frequency);
}

// ────────────────────────────────────────────────────────────
// 3. Calculate Symptom Frequency
// ────────────────────────────────────────────────────────────

/**
 * Calculate symptom frequency statistics.
 * Returns total occurrences, per-cycle average, and most common phase.
 */
export function calculateSymptomFrequency(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  symptomKey: SymptomKey,
  cycleLength: number,
  periodLength: number,
): { total: number; perCycle: number; mostCommonPhase: CyclePhase } {
  const completedCycles = cycles.filter((c) => c.cycleLength !== null);
  let total = 0;
  const phaseCounts: Record<CyclePhase, number> = {
    [CyclePhase.MENSTRUATION]: 0,
    [CyclePhase.FOLLICULAR]: 0,
    [CyclePhase.OVULATION]: 0,
    [CyclePhase.LUTEAL]: 0,
    [CyclePhase.UNKNOWN]: 0,
  };

  for (const log of dailyLogs) {
    const severity = log[symptomKey] as Severity;
    if (severity > Severity.NONE) {
      total++;
      const cycle = findCycleForDate(log.date, cycles);
      if (cycle) {
        const phase = getPhaseForDate(log.date, cycle, cycle.cycleLength ?? cycleLength, periodLength);
        phaseCounts[phase]++;
      }
    }
  }

  const perCycle = completedCycles.length > 0 ? roundTo(total / completedCycles.length, 1) : 0;

  // Find most common phase
  let mostCommonPhase = CyclePhase.UNKNOWN;
  let maxCount = 0;
  for (const [phase, count] of Object.entries(phaseCounts)) {
    if (count > maxCount && phase !== CyclePhase.UNKNOWN) {
      maxCount = count;
      mostCommonPhase = phase as CyclePhase;
    }
  }

  return { total, perCycle, mostCommonPhase };
}

// ────────────────────────────────────────────────────────────
// 4. Identify Symptom Trends
// ────────────────────────────────────────────────────────────

/**
 * Identify trending symptoms (increasing/decreasing over recent cycles).
 * Compares average severity in recent N cycles vs older cycles.
 * >20% change = trending.
 */
export function identifySymptomTrends(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  windowCycles: number = 3,
): { symptom: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[] {
  const completedCycles = cycles.filter((c) => c.cycleLength !== null);
  if (completedCycles.length < windowCycles + 1) return [];

  const recentCycles = completedCycles.slice(0, windowCycles);
  const olderCycles = completedCycles.slice(windowCycles);

  const results: { symptom: string; trend: 'increasing' | 'decreasing' | 'stable'; changePercent: number }[] = [];

  for (const { key, label } of SYMPTOM_KEYS) {
    const recentAvg = averageSeverityForCycles(dailyLogs, recentCycles, key);
    const olderAvg = averageSeverityForCycles(dailyLogs, olderCycles, key);

    if (olderAvg === 0 && recentAvg === 0) continue;

    const changePercent = olderAvg > 0
      ? roundTo(((recentAvg - olderAvg) / olderAvg) * 100, 0)
      : recentAvg > 0 ? 100 : 0;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (changePercent > 20) {
      trend = 'increasing';
    } else if (changePercent < -20) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    if (trend !== 'stable') {
      results.push({ symptom: label, trend, changePercent: Math.abs(changePercent) });
    }
  }

  return results;
}

/** Helper: calculate average severity of a symptom across a set of cycles */
function averageSeverityForCycles(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  symptomKey: SymptomKey,
): number {
  let total = 0;
  let count = 0;

  for (const cycle of cycles) {
    const cycleLogs = dailyLogs.filter((log) => {
      const d = diffDays(cycle.startDate, log.date);
      return d >= 0 && (cycle.endDate ? diffDays(log.date, cycle.endDate) >= 0 : true);
    });

    for (const log of cycleLogs) {
      const severity = log[symptomKey] as Severity;
      if (severity > Severity.NONE) {
        total += severity;
        count++;
      }
    }
  }

  return count > 0 ? total / count : 0;
}

// ────────────────────────────────────────────────────────────
// 5. Analyze Mood Patterns
// ────────────────────────────────────────────────────────────

/**
 * Generate mood frequency breakdown.
 * Returns how often each mood type was logged, and in which phase.
 */
export function analyzeMoodPatterns(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  cycleLength: number,
  periodLength: number,
): { mood: MoodType; count: number; mostCommonPhase: CyclePhase }[] {
  const moodData: Record<string, Record<CyclePhase, number>> = {};
  const moodTotals: Record<string, number> = {};

  for (const log of dailyLogs) {
    for (const mood of log.mood) {
      if (!moodData[mood]) {
        moodData[mood] = {
          [CyclePhase.MENSTRUATION]: 0,
          [CyclePhase.FOLLICULAR]: 0,
          [CyclePhase.OVULATION]: 0,
          [CyclePhase.LUTEAL]: 0,
          [CyclePhase.UNKNOWN]: 0,
        };
        moodTotals[mood] = 0;
      }

      moodTotals[mood]++;

      const cycle = findCycleForDate(log.date, cycles);
      if (cycle) {
        const phase = getPhaseForDate(log.date, cycle, cycle.cycleLength ?? cycleLength, periodLength);
        moodData[mood][phase]++;
      }
    }
  }

  return Object.entries(moodData)
    .map(([mood, phaseCounts]) => {
      let mostCommonPhase = CyclePhase.UNKNOWN;
      let maxCount = 0;
      for (const [phase, count] of Object.entries(phaseCounts)) {
        if (count > maxCount && phase !== CyclePhase.UNKNOWN) {
          maxCount = count;
          mostCommonPhase = phase as CyclePhase;
        }
      }
      return {
        mood: mood as MoodType,
        count: moodTotals[mood],
        mostCommonPhase,
      };
    })
    .sort((a, b) => b.count - a.count);
}

// ────────────────────────────────────────────────────────────
// 6. Generate All Insights (Orchestrator)
// ────────────────────────────────────────────────────────────

/**
 * Generate all insights from logs and cycles.
 * Orchestrator function that calls pattern, correlation, trend functions
 * and returns a unified InsightItem[] sorted by confidence descending.
 */
export function generateAllInsights(
  dailyLogs: DailyLog[],
  cycles: Cycle[],
  cycleLength: number,
  periodLength: number,
): InsightItem[] {
  if (dailyLogs.length === 0) return [];

  const insights: InsightItem[] = [];

  // 1. Symptom patterns
  const patterns = detectSymptomPatterns(dailyLogs, cycles, cycleLength, periodLength);
  insights.push(...patterns);

  // 2. Symptom trends
  const trends = identifySymptomTrends(dailyLogs, cycles);
  for (const trend of trends) {
    insights.push({
      id: generateId(),
      type: 'trend',
      title: `${trend.symptom} ${trend.trend}`,
      description: `Your ${trend.symptom.toLowerCase()} severity has been ${trend.trend} by ${trend.changePercent}% in recent cycles.`,
      dataSource: 'Comparing recent vs. older cycles',
      confidence: Math.min(80, 50 + trend.changePercent),
      generatedAt: nowISO(),
    });
  }

  // 3. Mood patterns
  const moods = analyzeMoodPatterns(dailyLogs, cycles, cycleLength, periodLength);
  for (const mood of moods) {
    if (mood.count >= 3 && mood.mostCommonPhase !== CyclePhase.UNKNOWN) {
      insights.push({
        id: generateId(),
        type: 'correlation',
        title: `${mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)} mood in ${PHASE_LABELS[mood.mostCommonPhase]}`,
        description: `You tend to feel ${mood.mood} most often during your ${PHASE_LABELS[mood.mostCommonPhase]} phase (logged ${mood.count} times).`,
        dataSource: `Based on ${dailyLogs.length} daily logs`,
        confidence: Math.min(85, Math.round((mood.count / dailyLogs.length) * 100) + 30),
        generatedAt: nowISO(),
      });
    }
  }

  // Sort by confidence descending
  return insights.sort((a, b) => b.confidence - a.confidence);
}
