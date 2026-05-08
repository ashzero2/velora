import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { Card } from '@src/components/ui/Card';
import { useDatabase } from '@src/hooks/useDatabase';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCycleStore } from '@src/stores/useCycleStore';
import { formatDisplayDate } from '@src/utils/dateUtils';
import { nowISO } from '@src/utils/dateUtils';
import type { OnboardingData } from '@src/types';

export default function CompleteScreen() {
  const params = useLocalSearchParams<{
    lastPeriodStart: string;
    avgCycleLength: string;
    avgPeriodLength: string;
    typicalSymptoms: string;
    isIrregular: string;
    fertilityTracking: string;
  }>();

  const db = useDatabase();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const startPeriod = useCycleStore((s) => s.startPeriod);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastPeriodStart = params.lastPeriodStart ?? '';
  const avgCycleLength = parseInt(params.avgCycleLength ?? '28', 10);
  const avgPeriodLength = parseInt(params.avgPeriodLength ?? '5', 10);
  const typicalSymptoms: string[] = params.typicalSymptoms
    ? JSON.parse(params.typicalSymptoms)
    : [];
  const isIrregular = params.isIrregular === 'true';
  const fertilityTracking = params.fertilityTracking === 'true';

  const handleStartTracking = async () => {
    setIsSubmitting(true);
    try {
      const onboardingData: OnboardingData = {
        lastPeriodStart,
        averageCycleLength: avgCycleLength,
        averagePeriodLength: avgPeriodLength,
        typicalSymptoms: typicalSymptoms.length > 0 ? typicalSymptoms : undefined,
        isIrregular,
        fertilityTracking,
        completedAt: nowISO(),
      };

      // Save onboarding data to settings
      await completeOnboarding(db, onboardingData);

      // Create the initial cycle from the last period start date
      await startPeriod(db, lastPeriodStart);

      // Navigate to main app (replace entire stack)
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 py-8 gap-6">
          {/* Back button + Step indicator */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Ionicons name="arrow-back" size={24} color="#57534e" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-primary-500" />
            </View>
            <View className="w-8" />
          </View>

          {/* Title */}
          <View className="items-center gap-3">
            <View className="bg-primary-50 rounded-full p-5">
              <Ionicons name="checkmark-circle" size={48} color="#6b9080" />
            </View>
            <Text className="text-2xl font-bold text-secondary-900">
              All Set!
            </Text>
            <Text className="text-sm text-secondary-500 text-center leading-5">
              Here's a summary of your information. You can always update this
              in Settings.
            </Text>
          </View>

          {/* Summary Card */}
          <Card variant="elevated" className="gap-4">
            <SummaryRow
              icon="calendar"
              label="Last period started"
              value={formatDisplayDate(lastPeriodStart, true)}
            />
            <SummaryRow
              icon="repeat"
              label="Average cycle length"
              value={`${avgCycleLength} days`}
            />
            <SummaryRow
              icon="water"
              label="Average period length"
              value={`${avgPeriodLength} days`}
            />
            {typicalSymptoms.length > 0 && (
              <SummaryRow
                icon="medkit"
                label="Typical symptoms"
                value={typicalSymptoms.join(', ')}
              />
            )}
            <SummaryRow
              icon="shuffle"
              label="Irregular cycles"
              value={isIrregular ? 'Yes' : 'No'}
            />
            <SummaryRow
              icon="heart"
              label="Fertility tracking"
              value={fertilityTracking ? 'Enabled' : 'Disabled'}
            />
          </Card>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-6">
        <Button
          title="Start Tracking"
          onPress={handleStartTracking}
          loading={isSubmitting}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="bg-primary-50 rounded-lg p-2 mt-0.5">
        <Ionicons name={icon} size={16} color="#6b9080" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-secondary-400">{label}</Text>
        <Text className="text-sm font-medium text-secondary-900">{value}</Text>
      </View>
    </View>
  );
}