import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@src/hooks/useDatabase';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCycleStore } from '@src/stores/useCycleStore';
import { Card } from '@src/components/ui/Card';
import { Button } from '@src/components/ui/Button';
import { Slider } from '@src/components/ui/Slider';
import { getCurrentCycleDay } from '@src/engines/CycleEngine';
import { formatDisplayDate } from '@src/utils/dateUtils';
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  ONBOARDING_CYCLE_MIN,
  ONBOARDING_CYCLE_MAX,
  ONBOARDING_PERIOD_MIN,
  ONBOARDING_PERIOD_MAX,
  MEDICAL_DISCLAIMER,
  PRIVACY_NOTICE,
} from '@src/constants/medical';

export default function SettingsScreen() {
  const db = useDatabase();
  const settings = useSettingsStore((s) => s.settings);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetOnboarding = useSettingsStore((s) => s.resetOnboarding);
  const currentCycle = useCycleStore((s) => s.currentCycle);

  const [cycleLength, setCycleLength] = useState(
    onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH,
  );
  const [periodLength, setPeriodLength] = useState(
    onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH,
  );
  const [hasChanges, setHasChanges] = useState(false);

  const cycleDay = currentCycle ? getCurrentCycleDay(currentCycle.startDate) : 0;

  const handleCycleLengthChange = (value: number) => {
    setCycleLength(value);
    setHasChanges(true);
  };

  const handlePeriodLengthChange = (value: number) => {
    setPeriodLength(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Save updated onboarding-level values through settings
    const { saveOnboardingData } = await import(
      '@src/database/repositories/SettingsRepository'
    );
    await saveOnboardingData(db, {
      lastPeriodStart: onboardingData?.lastPeriodStart ?? '',
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      typicalSymptoms: onboardingData?.typicalSymptoms,
      isIrregular: onboardingData?.isIrregular,
      fertilityTracking: onboardingData?.fertilityTracking,
      completedAt: onboardingData?.completedAt ?? new Date().toISOString(),
    });

    // Re-initialize settings store
    await useSettingsStore.getState().initialize(db);
    // Refresh cycle phase info
    useCycleStore.getState().refreshPhaseInfo(cycleLength, periodLength);
    setHasChanges(false);
  };

  const handleToggleFertility = async () => {
    await updateSettings(db, {
      fertilityTrackingEnabled: !settings.fertilityTrackingEnabled,
    });
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear your onboarding data and take you back to the welcome screen. Your cycle data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding(db);
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <Text className="text-2xl font-bold text-secondary-900">Settings</Text>
        </View>

        <View className="px-6 gap-5">
          {/* Current cycle info */}
          {currentCycle && (
            <Card variant="elevated" className="gap-3">
              <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
                Current Cycle
              </Text>
              <SettingRow
                label="Last period started"
                value={formatDisplayDate(currentCycle.startDate, true)}
              />
              <SettingRow label="Current cycle day" value={`Day ${cycleDay}`} />
              {currentCycle.periodEndDate && (
                <SettingRow
                  label="Period ended"
                  value={formatDisplayDate(currentCycle.periodEndDate, true)}
                />
              )}
            </Card>
          )}

          {/* Cycle settings */}
          <Card variant="elevated" className="gap-4">
            <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
              Cycle Settings
            </Text>

            <Slider
              value={cycleLength}
              onChange={handleCycleLengthChange}
              min={ONBOARDING_CYCLE_MIN}
              max={ONBOARDING_CYCLE_MAX}
              label="Average cycle length"
              unit="days"
            />

            <Slider
              value={periodLength}
              onChange={handlePeriodLengthChange}
              min={ONBOARDING_PERIOD_MIN}
              max={ONBOARDING_PERIOD_MAX}
              label="Average period length"
              unit="days"
            />

            {hasChanges && (
              <Button
                title="Save Changes"
                onPress={handleSave}
                size="md"
                fullWidth
              />
            )}
          </Card>

          {/* Preferences */}
          <Card variant="elevated" className="gap-3">
            <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
              Preferences
            </Text>

            <TouchableOpacity
              onPress={handleToggleFertility}
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-medium text-secondary-900">
                  Fertility tracking
                </Text>
                <Text className="text-xs text-secondary-400 mt-0.5">
                  Show ovulation and fertile window estimates
                </Text>
              </View>
              <View
                className={`w-11 h-6 rounded-full justify-center px-0.5 ${
                  settings.fertilityTrackingEnabled
                    ? 'bg-primary-500'
                    : 'bg-secondary-200'
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-white ${
                    settings.fertilityTrackingEnabled ? 'self-end' : 'self-start'
                  }`}
                />
              </View>
            </TouchableOpacity>
          </Card>

          {/* Privacy */}
          <Card className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="lock-closed" size={16} color="#6b9080" />
              <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
                Privacy
              </Text>
            </View>
            <Text className="text-xs text-secondary-500 leading-4">
              {PRIVACY_NOTICE}
            </Text>
          </Card>

          {/* Danger zone */}
          <Card className="gap-3">
            <Text className="text-sm font-semibold text-secondary-500 uppercase tracking-wide">
              Advanced
            </Text>
            <Button
              title="Reset Onboarding"
              onPress={handleResetOnboarding}
              variant="ghost"
              size="md"
              fullWidth
            />
          </Card>

          {/* Medical disclaimer */}
          <Text className="text-xs text-secondary-400 text-center leading-4 px-4 pb-4">
            {MEDICAL_DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className="text-sm text-secondary-500">{label}</Text>
      <Text className="text-sm font-medium text-secondary-900">{value}</Text>
    </View>
  );
}