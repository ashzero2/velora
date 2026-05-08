// ============================================================
// Luna — CycleEngine
// Pure functions for cycle phase calculation and validation.
// No side effects, no UI dependencies, no database access.
// ============================================================

import {
  CyclePhase,
  type CyclePhaseInfo,
  type PhaseBoundaries,
  type CycleValidation,
  type PhaseDescription,
} from '@src/types';
import { PHASE_DESCRIPTIONS } from '@src/constants/phases';
import {
  DEFAULT_LUTEAL_PHASE,
  VALID_CYCLE_MIN,
  VALID_CYCLE_MAX,
  VALID_PERIOD_MIN,
  VALID_PERIOD_MAX,
} from '@src/constants/medical';
import { diffDays, today, isValidDate, isFuture } from '@src/utils/dateUtils';

/**
 * Calculate current cycle day (1-based) from cycle start date.
 * Returns number of days since cycle started, inclusive of start day.
 *
 * @param cycleStartDate - ISO date string YYYY-MM-DD
 * @param currentDate - optional override for testing, defaults to today
 * @returns cycle day number (1 = first day of period)
 */
export function getCurrentCycleDay(
  cycleStartDate: string,
  currentDate?: string,
): number {
  const todayStr = currentDate ?? today();
  const daysDiff = diffDays(cycleStartDate, todayStr);
  // Day 1 = start date, so add 1
  return daysDiff + 1;
}

/**
 * Determine current cycle phase based on cycle day, cycle length, and period length.
 * Uses adaptive phase boundaries (NOT hardcoded day 14 for ovulation).
 * Ovulation estimated at: cycleLength - lutealPhase (default 14).
 *
 * @returns full CyclePhaseInfo with description, hormones, symptoms, energy
 */
export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number,
  lutealPhase: number = DEFAULT_LUTEAL_PHASE,
): CyclePhaseInfo {
  const boundaries = getPhaseBoundaries(cycleLength, periodLength, lutealPhase);

  let phase: CyclePhase;
  let dayInPhase: number;
  let totalPhaseDays: number;

  if (cycleDay < 1 || cycleDay > cycleLength) {
    phase = CyclePhase.UNKNOWN;
    dayInPhase = 0;
    totalPhaseDays = 0;
  } else if (cycleDay >= boundaries.menstruation[0] && cycleDay <= boundaries.menstruation[1]) {
    phase = CyclePhase.MENSTRUATION;
    dayInPhase = cycleDay - boundaries.menstruation[0] + 1;
    totalPhaseDays = boundaries.menstruation[1] - boundaries.menstruation[0] + 1;
  } else if (cycleDay >= boundaries.follicular[0] && cycleDay <= boundaries.follicular[1]) {
    phase = CyclePhase.FOLLICULAR;
    dayInPhase = cycleDay - boundaries.follicular[0] + 1;
    totalPhaseDays = boundaries.follicular[1] - boundaries.follicular[0] + 1;
  } else if (cycleDay >= boundaries.ovulation[0] && cycleDay <= boundaries.ovulation[1]) {
    phase = CyclePhase.OVULATION;
    dayInPhase = cycleDay - boundaries.ovulation[0] + 1;
    totalPhaseDays = boundaries.ovulation[1] - boundaries.ovulation[0] + 1;
  } else if (cycleDay >= boundaries.luteal[0] && cycleDay <= boundaries.luteal[1]) {
    phase = CyclePhase.LUTEAL;
    dayInPhase = cycleDay - boundaries.luteal[0] + 1;
    totalPhaseDays = boundaries.luteal[1] - boundaries.luteal[0] + 1;
  } else {
    phase = CyclePhase.UNKNOWN;
    dayInPhase = 0;
    totalPhaseDays = 0;
  }

  const desc = getPhaseDescription(phase);

  return {
    phase,
    dayInPhase,
    totalPhaseDays,
    cycleDay,
    description: desc.description,
    hormonalTrends: desc.hormonalTrends,
    commonSymptoms: desc.commonSymptoms,
    energyLevel: desc.energyLevel,
  };
}

/**
 * Calculate phase day boundaries for a given cycle configuration.
 *
 * menstruation: [1, periodLength]
 * follicular:   [periodLength + 1, ovulationDay - 2]
 * ovulation:    [ovulationDay - 1, ovulationDay + 1]  (3-day window)
 * luteal:       [ovulationDay + 2, cycleLength]
 *
 * where ovulationDay = cycleLength - lutealPhase
 *
 * Edge cases handled:
 * - If follicular phase would be 0 or negative days, it gets minimum 1 day
 * - If ovulation window overlaps menstruation, boundaries are adjusted
 */
export function getPhaseBoundaries(
  cycleLength: number,
  periodLength: number,
  lutealPhase: number = DEFAULT_LUTEAL_PHASE,
): PhaseBoundaries {
  const ovulationDay = cycleLength - lutealPhase;

  // Ensure ovulation day is after period ends
  const safeOvulationDay = Math.max(ovulationDay, periodLength + 2);

  const menstruationStart = 1;
  const menstruationEnd = periodLength;

  const follicularStart = menstruationEnd + 1;
  const follicularEnd = Math.max(safeOvulationDay - 2, follicularStart);

  const ovulationStart = follicularEnd + 1;
  const ovulationEnd = Math.min(ovulationStart + 2, cycleLength);

  const lutealStart = ovulationEnd + 1;
  const lutealEnd = cycleLength;

  return {
    menstruation: [menstruationStart, menstruationEnd],
    follicular: [follicularStart, follicularEnd],
    ovulation: [ovulationStart, ovulationEnd],
    luteal: [lutealStart, lutealEnd],
  };
}

/**
 * Calculate cycle length between two consecutive cycle start dates.
 *
 * @param currentStart - start date of current cycle (YYYY-MM-DD)
 * @param nextStart - start date of next cycle (YYYY-MM-DD)
 * @returns number of days between currentStart and nextStart
 */
export function calculateCycleLength(
  currentStart: string,
  nextStart: string,
): number {
  return diffDays(currentStart, nextStart);
}

/**
 * Calculate period length from start and end dates.
 *
 * @returns number of days inclusive (end - start + 1)
 */
export function calculatePeriodLength(
  periodStart: string,
  periodEnd: string,
): number {
  return diffDays(periodStart, periodEnd) + 1;
}

/**
 * Validate cycle data for medical reasonableness.
 *
 * Checks:
 * - Date is valid ISO format
 * - Start date not in the future
 * - Cycle length within valid range (15–60 days)
 * - Period length within valid range (1–15 days)
 * - End date after start date
 * - Period end date after start date and before/equal end date
 */
export function validateCycleData(
  startDate: string,
  endDate?: string | null,
  periodEndDate?: string | null,
): CycleValidation {
  const errors: string[] = [];

  // Validate start date format
  if (!isValidDate(startDate)) {
    errors.push('Start date is not a valid date.');
    return { valid: false, errors };
  }

  // Start date should not be in the future
  if (isFuture(startDate)) {
    errors.push('Start date cannot be in the future.');
  }

  // Validate end date if provided
  if (endDate) {
    if (!isValidDate(endDate)) {
      errors.push('End date is not a valid date.');
    } else {
      const cycleDays = diffDays(startDate, endDate);
      if (cycleDays < 0) {
        errors.push('End date must be after start date.');
      } else if (cycleDays < VALID_CYCLE_MIN) {
        errors.push(`Cycle length (${cycleDays} days) is shorter than the minimum (${VALID_CYCLE_MIN} days).`);
      } else if (cycleDays > VALID_CYCLE_MAX) {
        errors.push(`Cycle length (${cycleDays} days) exceeds the maximum (${VALID_CYCLE_MAX} days).`);
      }
    }
  }

  // Validate period end date if provided
  if (periodEndDate) {
    if (!isValidDate(periodEndDate)) {
      errors.push('Period end date is not a valid date.');
    } else {
      const periodDays = diffDays(startDate, periodEndDate) + 1;
      if (periodDays < VALID_PERIOD_MIN) {
        errors.push('Period end date must be on or after start date.');
      } else if (periodDays > VALID_PERIOD_MAX) {
        errors.push(`Period length (${periodDays} days) exceeds the maximum (${VALID_PERIOD_MAX} days).`);
      }

      // Period end should be before cycle end
      if (endDate && isValidDate(endDate)) {
        if (diffDays(periodEndDate, endDate) < 0) {
          errors.push('Period end date must be before cycle end date.');
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get phase description with hormonal trends, symptoms, and energy level.
 * Sources from constants/phases.ts data.
 */
export function getPhaseDescription(phase: CyclePhase): PhaseDescription {
  return PHASE_DESCRIPTIONS[phase] ?? PHASE_DESCRIPTIONS[CyclePhase.UNKNOWN];
}