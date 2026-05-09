import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { Card } from '@src/components/ui/Card';
import { useDatabase } from '@src/hooks/useDatabase';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCycleStore } from '@src/stores/useCycleStore';
import { formatDisplayDate, nowISO } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';
import type { OnboardingData } from '@src/types';

export default function CompleteScreen() {
  const params = useLocalSearchParams<{
    lastPeriodStart: string; avgCycleLength: string; avgPeriodLength: string;
    typicalSymptoms: string; isIrregular: string; fertilityTracking: string;
  }>();

  const db = useDatabase();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const startPeriod = useCycleStore((s) => s.startPeriod);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastPeriodStart = params.lastPeriodStart ?? '';
  const avgCycleLength = parseInt(params.avgCycleLength ?? '28', 10);
  const avgPeriodLength = parseInt(params.avgPeriodLength ?? '5', 10);
  const typicalSymptoms: string[] = params.typicalSymptoms ? JSON.parse(params.typicalSymptoms) : [];
  const isIrregular = params.isIrregular === 'true';
  const fertilityTracking = params.fertilityTracking === 'true';

  const handleStartTracking = async () => {
    setIsSubmitting(true);
    try {
      const data: OnboardingData = {
        lastPeriodStart, averageCycleLength: avgCycleLength, averagePeriodLength: avgPeriodLength,
        typicalSymptoms: typicalSymptoms.length > 0 ? typicalSymptoms : undefined,
        isIrregular, fertilityTracking, completedAt: nowISO(),
      };
      await completeOnboarding(db, data);
      await startPeriod(db, lastPeriodStart);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsSubmitting(false);
    }
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
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.stepDot, styles.stepActive]} />
              ))}
            </View>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.checkArea}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary[500]} />
            </View>
            <Text style={styles.title}>All Set!</Text>
            <Text style={styles.subtitle}>Here's a summary of your information. You can always update this in Settings.</Text>
          </View>

          <Card variant="elevated" style={{ gap: 16 }}>
            <SummaryRow icon="calendar" label="Last period started" value={formatDisplayDate(lastPeriodStart, true)} />
            <SummaryRow icon="repeat" label="Average cycle length" value={`${avgCycleLength} days`} />
            <SummaryRow icon="water" label="Average period length" value={`${avgPeriodLength} days`} />
            {typicalSymptoms.length > 0 && <SummaryRow icon="medkit" label="Typical symptoms" value={typicalSymptoms.join(', ')} />}
            <SummaryRow icon="shuffle" label="Irregular cycles" value={isIrregular ? 'Yes' : 'No'} />
            <SummaryRow icon="heart" label="Fertility tracking" value={fertilityTracking ? 'Enabled' : 'Disabled'} />
          </Card>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Start Tracking" onPress={handleStartTracking} loading={isSubmitting} size="lg" fullWidth />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={16} color={colors.primary[500]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  body: { paddingHorizontal: 24, paddingVertical: 32, gap: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 32, height: 4, borderRadius: 9999, backgroundColor: colors.secondary[200] },
  stepActive: { backgroundColor: colors.primary[500] },
  checkArea: { alignItems: 'center', gap: 12 },
  checkIcon: { backgroundColor: colors.primary[50], borderRadius: 9999, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  subtitle: { fontSize: 14, color: colors.secondary[500], textAlign: 'center', lineHeight: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  summaryIcon: { backgroundColor: colors.primary[50], borderRadius: 8, padding: 8, marginTop: 2 },
  summaryLabel: { fontSize: 12, color: colors.secondary[400] },
  summaryValue: { fontSize: 14, fontWeight: '500', color: colors.secondary[900] },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
});