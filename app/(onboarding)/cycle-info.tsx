import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { DatePicker } from '@src/components/ui/DatePicker';
import { Slider } from '@src/components/ui/Slider';
import { today, subDays } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';
import {
  DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH,
  ONBOARDING_CYCLE_MIN, ONBOARDING_CYCLE_MAX,
  ONBOARDING_PERIOD_MIN, ONBOARDING_PERIOD_MAX,
} from '@src/constants/medical';

export default function CycleInfoScreen() {
  const [lastPeriodStart, setLastPeriodStart] = useState(subDays(today(), 14));
  const [avgCycleLength, setAvgCycleLength] = useState(DEFAULT_CYCLE_LENGTH);
  const [avgPeriodLength, setAvgPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/preferences',
      params: { lastPeriodStart, avgCycleLength: String(avgCycleLength), avgPeriodLength: String(avgPeriodLength) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={colors.secondary[600]} />
            </TouchableOpacity>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
            </View>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.title}>Your Cycle</Text>
            <Text style={styles.subtitle}>
              This helps us calculate your current cycle phase. Don't worry if you're not exact — estimates work great.
            </Text>
          </View>

          <View style={{ gap: 4 }}>
            <DatePicker value={lastPeriodStart} onChange={setLastPeriodStart} label="When did your last period start?" maxDate={today()} />
            <Text style={styles.hint}>Your best estimate is fine</Text>
          </View>

          <View style={{ gap: 4 }}>
            <Slider value={avgCycleLength} onChange={setAvgCycleLength} min={ONBOARDING_CYCLE_MIN} max={ONBOARDING_CYCLE_MAX} label="Average cycle length" unit="days" />
            <Text style={styles.hint}>The time from the first day of one period to the first day of the next. Most people's cycles are 24–38 days.</Text>
          </View>

          <View style={{ gap: 4 }}>
            <Slider value={avgPeriodLength} onChange={setAvgPeriodLength} min={ONBOARDING_PERIOD_MIN} max={ONBOARDING_PERIOD_MAX} label="Average period length" unit="days" />
            <Text style={styles.hint}>How many days you typically bleed. Most periods last 3–7 days.</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} size="lg" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  body: { paddingHorizontal: 24, paddingVertical: 32, gap: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 32, height: 4, borderRadius: 9999, backgroundColor: colors.secondary[200] },
  stepActive: { backgroundColor: colors.primary[500] },
  title: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  subtitle: { fontSize: 14, color: colors.secondary[500], lineHeight: 20 },
  hint: { fontSize: 12, color: colors.secondary[400], marginTop: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
});