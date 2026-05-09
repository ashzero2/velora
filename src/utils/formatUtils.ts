// ============================================================
// Velora — Display Formatting Utilities
// ============================================================

import { CyclePhase, FlowIntensity } from '@src/types';
import { PHASE_DISPLAY_NAMES } from '@src/constants/phases';

/**
 * Get human-readable phase name.
 * e.g. CyclePhase.MENSTRUATION → "Period"
 */
export function formatPhaseName(phase: CyclePhase): string {
  return PHASE_DISPLAY_NAMES[phase] ?? 'Unknown';
}

/**
 * Format cycle day for display: "Day 14".
 */
export function formatCycleDay(day: number): string {
  return `Day ${day}`;
}

/**
 * Format ordinal: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", etc.
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format flow intensity for display.
 * e.g. FlowIntensity.VERY_HEAVY → "Very Heavy"
 */
export function formatFlowIntensity(flow: FlowIntensity): string {
  const labels: Record<FlowIntensity, string> = {
    [FlowIntensity.SPOTTING]: 'Spotting',
    [FlowIntensity.LIGHT]: 'Light',
    [FlowIntensity.MEDIUM]: 'Medium',
    [FlowIntensity.HEAVY]: 'Heavy',
    [FlowIntensity.VERY_HEAVY]: 'Very Heavy',
  };
  return labels[flow] ?? flow;
}

/**
 * Format a number of days as a duration string.
 * e.g. 5 → "5 days", 1 → "1 day"
 */
export function formatDaysDuration(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}