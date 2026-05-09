// ============================================================
// Velora — Math Utility Functions
// Reusable statistical helpers for PredictionEngine
// ============================================================

/**
 * Calculate weighted average where more recent items have higher weight.
 * Weights: most recent = maxWeight, decreasing by 1 to minimum 1.
 *
 * @param values - array of numbers, ordered oldest → newest
 * @param maxWeight - weight for most recent value (default 6)
 * @returns weighted average, or 0 if empty
 */
export function weightedAverage(values: number[], maxWeight: number = 6): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const n = values.length;
  let weightSum = 0;
  let valueSum = 0;

  for (let i = 0; i < n; i++) {
    // oldest item is at index 0, newest at index n-1
    // weight for index i: max(1, maxWeight - (n - 1 - i))
    const weight = Math.max(1, maxWeight - (n - 1 - i));
    weightSum += weight;
    valueSum += values[i] * weight;
  }

  return valueSum / weightSum;
}

/**
 * Calculate population standard deviation.
 * Uses the formula: √(Σ(x−μ)² / n)
 *
 * @param values - array of numbers
 * @returns standard deviation, or 0 if fewer than 2 values
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const squaredDiffs = values.reduce((sum, v) => sum + (v - mean) ** 2, 0);

  return Math.sqrt(squaredDiffs / n);
}

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}