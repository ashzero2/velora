import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCurrentPhase } from '@src/hooks/useCurrentPhase';
import { getCurrentCycleDay } from '@src/engines/CycleEngine';
import { CycleRing } from '@src/components/cycle/CycleRing';
import { PhaseCard } from '@src/components/cycle/PhaseCard';
import { EmptyState } from '@src/components/ui/EmptyState';
import { Button } from '@src/components/ui/Button';
import { Card } from '@src/components/ui/Card';
import { today, formatDisplayDate } from '@src/utils/dateUtils';
import { CyclePhase } from '@src/types';
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  MEDICAL_DISCLAIMER,
} from '@src/constants/medical';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const db = useDatabase();
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const isLoading = useCycleStore((s) => s.isLoading);
  const startPeriod = useCycleStore((s) => s.startPeriod);
  const endPeriod = useCycleStore((s) => s.endPeriod);
  const startNewCycle = useCycleStore((s) => s.startNewCycle);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const phaseInfo = useCurrentPhase();

  const cycleLength = onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const periodLength = onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;
  const cycleDay = currentCycle ? getCurrentCycleDay(currentCycle.startDate) : 0;
  const currentPhase = phaseInfo?.phase ?? CyclePhase.UNKNOWN;

  // Determine period action state
  const hasCycle = !!currentCycle;
  const periodEnded = hasCycle && !!currentCycle.periodEndDate;
  const periodOngoing = hasCycle && !currentCycle.periodEndDate;

  const handleStartPeriod = () => startPeriod(db, today());
  const handleEndPeriod = () => endPeriod(db, today());
  const handleStartNewCycle = () => startNewCycle(db, today());

  // Empty state
  if (!hasCycle && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50">
        <View className="flex-1 justify-center">
          <EmptyState
            icon="flower-outline"
            title="No cycle data yet"
            description="Log your first period to start tracking your cycle phases and get personalized insights."
            actionTitle="Start Period"
            onAction={handleStartPeriod}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-secondary-900">Luna</Text>
          <Text className="text-sm text-secondary-500">
            {formatDisplayDate(today(), true)}
          </Text>
        </View>

        {/* Cycle Ring */}
        <View className="items-center py-6">
          <CycleRing
            cycleDay={Math.min(cycleDay, cycleLength)}
            cycleLength={cycleLength}
            periodLength={periodLength}
            currentPhase={currentPhase}
          />
        </View>

        <View className="px-6 gap-4">
          {/* Phase Card */}
          {phaseInfo && <PhaseCard phaseInfo={phaseInfo} />}

          {/* Period Action */}
          <Card variant="elevated" className="gap-3">
            <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
              Period Status
            </Text>

            {periodOngoing && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-menstruation" />
                  <Text className="text-sm text-secondary-700">
                    Period started {formatDisplayDate(currentCycle.startDate)}
                  </Text>
                </View>
                <Button
                  title="End Period"
                  onPress={handleEndPeriod}
                  variant="secondary"
                  fullWidth
                  loading={isLoading}
                />
              </View>
            )}

            {periodEnded && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={18} color="#6b9080" />
                  <Text className="text-sm text-secondary-700">
                    Period ended {formatDisplayDate(currentCycle.periodEndDate!)}
                  </Text>
                </View>
                <Button
                  title="Start New Period"
                  onPress={handleStartNewCycle}
                  variant="outline"
                  fullWidth
                  loading={isLoading}
                />
              </View>
            )}
          </Card>

          {/* Cycle info summary */}
          <Card className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-secondary-400">Cycle Length</Text>
              <Text className="text-xs font-medium text-secondary-700">
                {cycleLength} days
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-secondary-400">Period Length</Text>
              <Text className="text-xs font-medium text-secondary-700">
                {periodLength} days
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-secondary-400">Current Day</Text>
              <Text className="text-xs font-medium text-secondary-700">
                Day {cycleDay} of {cycleLength}
              </Text>
            </View>
          </Card>

          {/* Medical disclaimer */}
          <Text className="text-xs text-secondary-400 text-center leading-4 px-4">
            {MEDICAL_DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}