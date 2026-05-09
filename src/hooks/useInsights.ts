// ============================================================
// Velora — useInsights Hook
// Provides insights with auto-refresh on log/cycle changes.
// Subscribes to useLogStore and useCycleStore for reactive updates.
// ============================================================

import { useEffect, useRef } from 'react';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useLogStore } from '@src/stores/useLogStore';
import { useInsightStore } from '@src/stores/useInsightStore';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@src/constants/medical';
import type { InsightItem } from '@src/types';

/**
 * Hook that provides insights and auto-refreshes
 * when log store or cycle store changes.
 */
export function useInsights(): {
  insights: InsightItem[];
  isLoading: boolean;
} {
  const db = useDatabase();
  const cycles = useCycleStore((s) => s.cycles);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const recentLogs = useLogStore((s) => s.recentLogs);
  const todayLog = useLogStore((s) => s.todayLog);

  const insights = useInsightStore((s) => s.insights);
  const isLoading = useInsightStore((s) => s.isLoading);
  const generateInsights = useInsightStore((s) => s.generateInsights);

  const cycleLength = onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const periodLength = onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;

  // Regenerate insights when cycles or logs change
  useEffect(() => {
    if (cycles.length > 0) {
      generateInsights(db, cycles, cycleLength, periodLength);
    }
  }, [db, cycles, cycleLength, periodLength, recentLogs, todayLog, generateInsights]);

  return {
    insights,
    isLoading,
  };
}