// ============================================================
// Velora — usePredictions Hook
// Provides current prediction with auto-refresh on cycle/settings changes.
// Subscribes to useCycleStore and useSettingsStore for reactive updates.
// ============================================================

import { useEffect, useRef } from 'react';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { usePredictionStore } from '@src/stores/usePredictionStore';
import type { Prediction, CycleStatistics } from '@src/types';

/**
 * Hook that provides current prediction and auto-refreshes
 * when cycle store or settings store changes.
 * Triggers recalculation on mount and whenever cycles/settings update.
 */
export function usePredictions(): {
  prediction: Prediction | null;
  upcomingPredictions: Prediction[];
  cycleStats: CycleStatistics | null;
  isLoading: boolean;
} {
  const db = useDatabase();
  const cycles = useCycleStore((s) => s.cycles);
  const settings = useSettingsStore((s) => s.settings);
  const onboardingData = useSettingsStore((s) => s.onboardingData);

  const currentPrediction = usePredictionStore((s) => s.currentPrediction);
  const upcomingPredictions = usePredictionStore((s) => s.upcomingPredictions);
  const cycleStats = usePredictionStore((s) => s.cycleStats);
  const isLoading = usePredictionStore((s) => s.isLoading);
  const initialize = usePredictionStore((s) => s.initialize);
  const recalculate = usePredictionStore((s) => s.recalculate);

  const initialized = useRef(false);

  // Initialize on mount: load latest prediction from DB
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(db);
    }
  }, [db, initialize]);

  // Recalculate whenever cycles or settings change
  useEffect(() => {
    if (cycles.length > 0) {
      recalculate(db, cycles, settings, onboardingData);
    }
  }, [db, cycles, settings, onboardingData, recalculate]);

  return {
    prediction: currentPrediction,
    upcomingPredictions,
    cycleStats,
    isLoading,
  };
}