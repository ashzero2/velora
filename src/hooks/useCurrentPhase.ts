// ============================================================
// Velora — useCurrentPhase Hook
// Derives current phase info from cycle and settings stores.
// ============================================================

import { useEffect } from 'react';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '@src/constants/medical';
import type { CyclePhaseInfo } from '@src/types';

/**
 * Hook that computes and returns the current cycle phase info.
 * Automatically refreshes when cycle or settings change.
 */
export function useCurrentPhase(): CyclePhaseInfo | null {
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const currentPhaseInfo = useCycleStore((s) => s.currentPhaseInfo);
  const refreshPhaseInfo = useCycleStore((s) => s.refreshPhaseInfo);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    if (!currentCycle) return;

    const cycleLength = onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH;
    const periodLength = onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;
    const lutealPhase = settings.defaultLutealPhase;

    refreshPhaseInfo(cycleLength, periodLength, lutealPhase);
  }, [
    currentCycle?.id,
    currentCycle?.startDate,
    onboardingData?.averageCycleLength,
    onboardingData?.averagePeriodLength,
    settings.defaultLutealPhase,
    refreshPhaseInfo,
  ]);

  return currentPhaseInfo;
}