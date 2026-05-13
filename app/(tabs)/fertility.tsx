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
import { AccordionCard } from '@src/components/ui/AccordionCard';
import { EmptyState } from '@src/components/ui/EmptyState';
import { CyclePhase } from '@src/types';
import { diffDays, today } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';

export default function FertilityScreen() {
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
      <SafeAreaView style={styles.safe}>
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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Fertility & Wellness</Text>
          <Text style={styles.screenSubtitle}>Personalized for your cycle</Text>
        </View>

        {/* Section A: Fertile Window Status */}
        {prediction && currentCycle && (
          <FertileStatus
            prediction={prediction}
            cycleStartDate={currentCycle.startDate}
            cycleLength={cycleLength}
          />
        )}

        {/* Section B: Phase-Based Nutrition — collapsed by default */}
        <AccordionCard
          title="Phase Nutrition"
          icon="nutrition-outline"
          iconColor={colors.phase.fertile}
          preview="Foods recommended for your current phase"
        >
          <PhaseNutrition currentPhase={currentPhase} />
        </AccordionCard>

        {/* Section D: Conception Tips — collapsed */}
        <AccordionCard
          title="Conception Tips"
          icon="sparkles-outline"
          iconColor={colors.phase.ovulation}
          preview="Timing, ovulation signs, and when to test"
        >
          <ConceptionTips
            ovulationDay={ovulationDay}
            currentCycleDay={cycleDay}
          />
        </AccordionCard>

        {/* Section E: Wellness Tips — collapsed */}
        <AccordionCard
          title="Wellness & Lifestyle"
          icon="fitness-outline"
          iconColor={colors.primary[500]}
          preview="Exercise, sleep, and hydration for your phase"
        >
          <WellnessTips currentPhase={currentPhase} />
        </AccordionCard>

        {/* Section C: Fertility Superfoods — collapsed */}
        <AccordionCard
          title="Superfoods & Supplements"
          icon="heart-outline"
          iconColor={colors.semantic.error}
          preview="Top fertility foods and key supplements"
        >
          <FertilityFoods />
        </AccordionCard>
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