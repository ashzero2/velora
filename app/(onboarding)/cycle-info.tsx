import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { DatePicker } from '@src/components/ui/DatePicker';
import { Slider } from '@src/components/ui/Slider';
import { today, subDays } from '@src/utils/dateUtils';
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  ONBOARDING_CYCLE_MIN,
  ONBOARDING_CYCLE_MAX,
  ONBOARDING_PERIOD_MIN,
  ONBOARDING_PERIOD_MAX,
} from '@src/constants/medical';
import { useSettingsStore } from '@src/stores/useSettingsStore';

export default function CycleInfoScreen() {
  const [lastPeriodStart, setLastPeriodStart] = useState(subDays(today(), 14));
  const [avgCycleLength, setAvgCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
  const [avgPeriodLength, setAvgPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);

  const canContinue = !!lastPeriodStart;

  const handleContinue = () => {
    // Store values temporarily — they'll be saved in the complete screen
    // Pass data via search params
    router.push({
      pathname: '/(onboarding)/preferences',
      params: {
        lastPeriodStart,
        avgCycleLength: String(avgCycleLength),
        avgPeriodLength: String(avgPeriodLength),
      },
    });
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
              <View className="w-8 h-1 rounded-full bg-secondary-200" />
              <View className="w-8 h-1 rounded-full bg-secondary-200" />
            </View>
            <View className="w-8" />
          </View>

          {/* Title */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-secondary-900">
              Your Cycle
            </Text>
            <Text className="text-sm text-secondary-500 leading-5">
              This helps us calculate your current cycle phase. Don't worry if
              you're not exact — estimates work great.
            </Text>
          </View>

          {/* Last Period Start Date */}
          <View className="gap-1">
            <DatePicker
              value={lastPeriodStart}
              onChange={setLastPeriodStart}
              label="When did your last period start?"
              maxDate={today()}
            />
            <Text className="text-xs text-secondary-400 mt-1">
              Your best estimate is fine
            </Text>
          </View>

          {/* Average Cycle Length */}
          <View className="gap-1">
            <Slider
              value={avgCycleLength}
              onChange={setAvgCycleLength}
              min={ONBOARDING_CYCLE_MIN}
              max={ONBOARDING_CYCLE_MAX}
              label="Average cycle length"
              unit="days"
            />
            <Text className="text-xs text-secondary-400 mt-1">
              The time from the first day of one period to the first day of the
              next. Most people's cycles are 24–38 days.
            </Text>
          </View>

          {/* Average Period Length */}
          <View className="gap-1">
            <Slider
              value={avgPeriodLength}
              onChange={setAvgPeriodLength}
              min={ONBOARDING_PERIOD_MIN}
              max={ONBOARDING_PERIOD_MAX}
              label="Average period length"
              unit="days"
            />
            <Text className="text-xs text-secondary-400 mt-1">
              How many days you typically bleed. Most periods last 3–7 days.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-6">
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}