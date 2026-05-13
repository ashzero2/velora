import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCurrentPhase } from '@src/hooks/useCurrentPhase';
import { usePredictions } from '@src/hooks/usePredictions';
import { getCurrentCycleDay } from '@src/engines/CycleEngine';
import { FertileStatus } from '@src/components/fertility/FertileStatus';
import { PhaseNutrition } from '@src/components/fertility/PhaseNutrition';
import { FertilityFoods } from '@src/components/fertility/FertilityFoods';
import { ConceptionTips } from '@src/components/fertility/ConceptionTips';
import { WellnessTips } from '@src/components/fertility/WellnessTips';
import { EmptyState } from '@src/components/ui/EmptyState';
import { CyclePhase } from '@src/types';
import { diffDays, today } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';
import { useThemeColors } from '@src/hooks/useThemeColors';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';

export default function FertilityScreen() {
  const theme = useThemeColors();
  const db = useDatabase();
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const phaseInfo = useCurrentPhase();
  const { prediction } = usePredictions();

  const cycleLength = onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const periodLength = onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;
  const currentPhase = phaseInfo?.phase ?? CyclePhase.UNKNOWN;

  const hasCycle = !!currentCycle;
  const cycleDay = hasCycle ? diffDays(currentCycle.startDate, today()) + 1 : 0;
  const ovulationDay = cycleLength - DEFAULT_LUTEAL_PHASE;

  if (!hasCycle) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="leaf-outline"
            title="No cycle data yet"
            description="Log your first period on the Home tab to unlock fertility insights, nutrition guidance, and conception tips."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Fertility & Wellness</Text>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Personalized for your cycle</Text>
        </View>

        {/* Section A: Fertile Window Status */}
        {prediction && currentCycle && (
          <FertileStatus
            prediction={prediction}
            cycleStartDate={currentCycle.startDate}
            cycleLength={cycleLength}
          />
        )}

        {/* Section B: Phase-Based Nutrition */}
        <PhaseNutrition currentPhase={currentPhase} />

        {/* Section D: Conception Tips */}
        <ConceptionTips
          ovulationDay={ovulationDay}
          currentCycleDay={cycleDay}
        />

        {/* Section E: Wellness Tips */}
        <WellnessTips currentPhase={currentPhase} />

        {/* Section C: Fertility Superfoods & Supplements */}
        <FertilityFoods />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  screenSubtitle: { fontSize: 14, color: colors.secondary[500] },
});