// ============================================================
// Velora — Date Utility Functions
// Wraps date-fns for consistent date handling
// ============================================================

import {
  addDays as dfnsAddDays,
  subDays as dfnsSubDays,
  differenceInDays,
  format,
  parseISO,
  isValid,
  isFuture as dfnsIsFuture,
  isToday as dfnsIsToday,
  startOfDay,
} from 'date-fns';

/**
 * Add days to a date string, returns ISO date string YYYY-MM-DD.
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  return format(dfnsAddDays(date, days), 'yyyy-MM-dd');
}

/**
 * Subtract days from a date string, returns ISO date string YYYY-MM-DD.
 */
export function subDays(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  return format(dfnsSubDays(date, days), 'yyyy-MM-dd');
}

/**
 * Calculate difference in days between two date strings.
 * Returns positive if endDate > startDate.
 */
export function diffDays(startDate: string, endDate: string): number {
  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));
  return differenceInDays(end, start);
}

/**
 * Get today's date as ISO date string YYYY-MM-DD.
 */
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current datetime as ISO string.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format date for display: "May 18" or "May 18, 2026".
 */
export function formatDisplayDate(dateStr: string, includeYear = false): string {
  const date = parseISO(dateStr);
  return includeYear ? format(date, 'MMM d, yyyy') : format(date, 'MMM d');
}

/**
 * Format date range: "May 18–21" or "May 18 – Jun 2".
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const sameMonth = format(start, 'MMM') === format(end, 'MMM');
  if (sameMonth) {
    return `${format(start, 'MMM d')}–${format(end, 'd')}`;
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

/**
 * Parse ISO date string to Date object.
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Check if date string is valid ISO format YYYY-MM-DD.
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = parseISO(dateStr);
  return isValid(date);
}

/**
 * Check if date is in the future.
 */
export function isFuture(dateStr: string): boolean {
  const date = parseISO(dateStr);
  return dfnsIsFuture(startOfDay(date));
}

/**
 * Check if date is today.
 */
export function isToday(dateStr: string): boolean {
  const date = parseISO(dateStr);
  return dfnsIsToday(date);
}