import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCurrentPhase } from '@src/hooks/useCurrentPhase';
import { getCurrentCycleDay } from '@src/engines/CycleEngine';
import { CycleRing } from '@src/components/cycle/CycleRing';
import { PhaseCard } from '@src/components/cycle/PhaseCard';
import { PredictionCard } from '@src/components/cycle/PredictionCard';
import { FertileWindowBar } from '@src/components/cycle/FertileWindowBar';
import { QuickLogCard } from '@src/components/log/QuickLogCard';
import { EmptyState } from '@src/components/ui/EmptyState';
import { Button } from '@src/components/ui/Button';
import { Card } from '@src/components/ui/Card';
import { usePredictions } from '@src/hooks/usePredictions';
import { useLogStore, createBlankLog } from '@src/stores/useLogStore';
import { today, formatDisplayDate, nowISO } from '@src/utils/dateUtils';
import { CyclePhase, MoodType } from '@src/types';
import { colors } from '@src/constants/theme';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, MEDICAL_DISCLAIMER } from '@src/constants/medical';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const db = useDatabase();
  const initialize = useCycleStore((s) => s.initialize);
  const initSettings = useSettingsStore((s) => s.initialize);
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const isLoading = useCycleStore((s) => s.isLoading);
  const startPeriod = useCycleStore((s) => s.startPeriod);
  const endPeriod = useCycleStore((s) => s.endPeriod);
  const startNewCycle = useCycleStore((s) => s.startNewCycle);
  const onboardingData = useSettingsStore((s) => s.onboardingData);
  const phaseInfo = useCurrentPhase();
  const settings = useSettingsStore((s) => s.settings);
  const { prediction } = usePredictions();
  const todayLog = useLogStore((s) => s.todayLog);
  const initLog = useLogStore((s) => s.initialize);
  const upsertLog = useLogStore((s) => s.upsertLog);

  // Re-initialize stores when dashboard mounts (e.g. after onboarding)
  useEffect(() => {
    initSettings(db);
    initialize(db);
    initLog(db);
  }, [db]);

  const cycleLength = onboardingData?.averageCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const periodLength = onboardingData?.averagePeriodLength ?? DEFAULT_PERIOD_LENGTH;
  const cycleDay = currentCycle ? getCurrentCycleDay(currentCycle.startDate) : 0;
  const currentPhase = phaseInfo?.phase ?? CyclePhase.UNKNOWN;

  const hasCycle = !!currentCycle;
  const periodEnded = hasCycle && !!currentCycle.periodEndDate;
  const periodOngoing = hasCycle && !currentCycle.periodEndDate;

  const handleStartPeriod = () => startPeriod(db, today());
  const handleEndPeriod = () => endPeriod(db, today());
  const handleStartNewCycle = () => startNewCycle(db, today());

  if (!hasCycle && !isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
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
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>Velora</Text>
          <Text style={styles.date}>{formatDisplayDate(today(), true)}</Text>
        </View>

        <View style={styles.ringWrap}>
          <CycleRing cycleDay={Math.min(cycleDay, cycleLength)} cycleLength={cycleLength} periodLength={periodLength} currentPhase={currentPhase} />
        </View>

        <View style={styles.content}>
          {phaseInfo && <PhaseCard phaseInfo={phaseInfo} />}

          {/* Prediction section */}
          {prediction ? (
            <>
              <PredictionCard prediction={prediction} />
              {settings.fertilityTrackingEnabled && currentCycle && (
                <FertileWindowBar
                  prediction={prediction}
                  cycleStartDate={currentCycle.startDate}
                  cycleLength={cycleLength}
                />
              )}
            </>
          ) : hasCycle ? (
            <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="analytics-outline" size={28} color={colors.secondary[400]} />
              <Text style={{ fontSize: 14, color: colors.secondary[500], marginTop: 8, textAlign: 'center' }}>
                Track more cycles for predictions
              </Text>
            </Card>
          ) : null}

          {/* Quick Log */}
          {hasCycle && (
            <QuickLogCard
              selectedMoods={todayLog?.mood ?? []}
              onMoodToggle={(mood: MoodType) => {
                const currentMoods = todayLog?.mood ?? [];
                const newMoods = currentMoods.includes(mood)
                  ? currentMoods.filter((m) => m !== mood)
                  : [...currentMoods, mood];
                const logToUpdate = todayLog ?? createBlankLog(today(), currentCycle?.id ?? null);
                upsertLog(db, { ...logToUpdate, mood: newMoods, updatedAt: nowISO() });
              }}
              onLogMore={() => {
                const { router } = require('expo-router');
                router.navigate('/(tabs)/log');
              }}
              hasLoggedToday={todayLog !== null}
            />
          )}

          <Card variant="elevated" style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>PERIOD STATUS</Text>
            {periodOngoing && (
              <View style={{ gap: 12 }}>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Period started {formatDisplayDate(currentCycle.startDate)}</Text>
                </View>
                <Button title="End Period" onPress={handleEndPeriod} variant="secondary" fullWidth loading={isLoading} />
              </View>
            )}
            {periodEnded && (
              <View style={{ gap: 12 }}>
                <View style={styles.statusRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary[500]} />
                  <Text style={styles.statusText}>Period ended {formatDisplayDate(currentCycle.periodEndDate!)}</Text>
                </View>
                <Button title="Start New Period" onPress={handleStartNewCycle} variant="outline" fullWidth loading={isLoading} />
              </View>
            )}
          </Card>

          <Card style={{ gap: 8 }}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Cycle Length</Text><Text style={styles.infoValue}>{cycleLength} days</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Period Length</Text><Text style={styles.infoValue}>{periodLength} days</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Current Day</Text><Text style={styles.infoValue}>Day {cycleDay} of {cycleLength}</Text></View>
          </Card>

          <Text style={styles.disclaimer}>{MEDICAL_DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  appName: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  date: { fontSize: 14, color: colors.secondary[500] },
  ringWrap: { alignItems: 'center', paddingVertical: 24 },
  content: { paddingHorizontal: 24, gap: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.secondary[500], letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c97b7b' },
  statusText: { fontSize: 14, color: colors.secondary[700] },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 12, color: colors.secondary[400] },
  infoValue: { fontSize: 12, fontWeight: '500', color: colors.secondary[700] },
  disclaimer: { fontSize: 12, color: colors.secondary[400], textAlign: 'center', lineHeight: 16, paddingHorizontal: 16 },
});