import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
import { colors } from '@src/constants/theme';
import { useThemeColors } from '@src/hooks/useThemeColors';
import {
  DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH,
  ONBOARDING_CYCLE_MIN, ONBOARDING_CYCLE_MAX,
  ONBOARDING_PERIOD_MIN, ONBOARDING_PERIOD_MAX,
  MEDICAL_DISCLAIMER, PRIVACY_NOTICE,
} from '@src/constants/medical';

export default function SettingsScreen() {
  const theme = useThemeColors();
  const db = useDatabase();
  const settings = useSettingsStore((s) => s.settings);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetOnboarding = useSettingsStore((s) => s.resetOnboarding);
  const currentCycle = useCycleStore((s) => s.currentCycle);

  const [cycleLength, setCycleLength] = useState(onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH);
  const [periodLength, setPeriodLength] = useState(onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH);
  const [hasChanges, setHasChanges] = useState(false);

  const cycleDay = currentCycle ? getCurrentCycleDay(currentCycle.startDate) : 0;

  const handleSave = async () => {
    const { saveOnboardingData } = await import('@src/database/repositories/SettingsRepository');
    await saveOnboardingData(db, {
      lastPeriodStart: onboardingData?.lastPeriodStart ?? '',
      averageCycleLength: cycleLength, averagePeriodLength: periodLength,
      typicalSymptoms: onboardingData?.typicalSymptoms,
      isIrregular: onboardingData?.isIrregular,
      fertilityTracking: onboardingData?.fertilityTracking,
      completedAt: onboardingData?.completedAt ?? new Date().toISOString(),
    });
    await useSettingsStore.getState().initialize(db);
    useCycleStore.getState().refreshPhaseInfo(cycleLength, periodLength);
    setHasChanges(false);
  };

  const handleToggleFertility = async () => {
    await updateSettings(db, { fertilityTrackingEnabled: !settings.fertilityTrackingEnabled });
  };

  const handleResetOnboarding = () => {
    Alert.alert('Reset Onboarding', 'This will clear your onboarding data and take you back to the welcome screen. Your cycle data will be preserved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await resetOnboarding(db); router.replace('/'); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
        </View>

        <View style={styles.content}>
          {currentCycle && (
            <Card variant="elevated" style={{ gap: 12 }}>
              <Text style={styles.sectionTitle}>CURRENT CYCLE</Text>
              <SettingRow label="Last period started" value={formatDisplayDate(currentCycle.startDate, true)} />
              <SettingRow label="Current cycle day" value={`Day ${cycleDay}`} />
              {currentCycle.periodEndDate && <SettingRow label="Period ended" value={formatDisplayDate(currentCycle.periodEndDate, true)} />}
            </Card>
          )}

          <Card variant="elevated" style={{ gap: 16 }}>
            <Text style={styles.sectionTitle}>CYCLE SETTINGS</Text>
            <Slider value={cycleLength} onChange={(v) => { setCycleLength(v); setHasChanges(true); }} min={ONBOARDING_CYCLE_MIN} max={ONBOARDING_CYCLE_MAX} label="Average cycle length" unit="days" />
            <Slider value={periodLength} onChange={(v) => { setPeriodLength(v); setHasChanges(true); }} min={ONBOARDING_PERIOD_MIN} max={ONBOARDING_PERIOD_MAX} label="Average period length" unit="days" />
            {hasChanges && <Button title="Save Changes" onPress={handleSave} size="md" fullWidth />}
          </Card>

          <Card variant="elevated" style={{ gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PREFERENCES</Text>
            <TouchableOpacity onPress={handleToggleFertility} activeOpacity={0.7} style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>Fertility tracking</Text>
                <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>Show ovulation and fertile window estimates</Text>
              </View>
              <View style={[styles.switch, settings.fertilityTrackingEnabled && styles.switchOn]}>
                <View style={[styles.switchThumb, settings.fertilityTrackingEnabled && styles.switchThumbOn]} />
              </View>
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>Dark mode</Text>
                <Text style={[styles.toggleDesc, { color: theme.textMuted }]}>
                  {settings.darkMode === 'system' ? 'Following system setting' : settings.darkMode ? 'Always on' : 'Always off'}
                </Text>
              </View>
              <View style={styles.darkModeOptions}>
                {(['system', false, true] as const).map((mode) => {
                  const isActive = settings.darkMode === mode;
                  const label = mode === 'system' ? 'Auto' : mode ? 'On' : 'Off';
                  return (
                    <TouchableOpacity
                      key={String(mode)}
                      onPress={() => updateSettings(db, { darkMode: mode })}
                      activeOpacity={0.7}
                      style={[styles.darkModeChip, isActive && styles.darkModeChipActive]}
                    >
                      <Text style={[styles.darkModeChipText, isActive && styles.darkModeChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>

          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="lock-closed" size={16} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>PRIVACY</Text>
            </View>
            <Text style={styles.privacyText}>{PRIVACY_NOTICE}</Text>
          </Card>

          <Card style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>ADVANCED</Text>
            <Button title="Reset Onboarding" onPress={handleResetOnboarding} variant="ghost" size="md" fullWidth />
          </Card>

          <Text style={styles.disclaimer}>{MEDICAL_DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  content: { paddingHorizontal: 24, gap: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.secondary[500], letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  toggleTitle: { fontSize: 14, fontWeight: '500', color: colors.secondary[900] },
  toggleDesc: { fontSize: 12, color: colors.secondary[400], marginTop: 2 },
  switch: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.secondary[200], justifyContent: 'center', paddingHorizontal: 2 },
  switchOn: { backgroundColor: colors.primary[500] },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff', alignSelf: 'flex-start' },
  switchThumbOn: { alignSelf: 'flex-end' },
  privacyText: { fontSize: 12, color: colors.secondary[500], lineHeight: 16 },
  disclaimer: { fontSize: 12, color: colors.secondary[400], textAlign: 'center', lineHeight: 16, paddingHorizontal: 16, paddingBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingLabel: { fontSize: 14, color: colors.secondary[500] },
  settingValue: { fontSize: 14, fontWeight: '500', color: colors.secondary[900] },
  darkModeOptions: { flexDirection: 'row', gap: 4 },
  darkModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.secondary[100],
  },
  darkModeChipActive: {
    backgroundColor: colors.primary[500],
  },
  darkModeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondary[600],
  },
  darkModeChipTextActive: {
    color: '#ffffff',
  },
});
