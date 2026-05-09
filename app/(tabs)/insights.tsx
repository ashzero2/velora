// ============================================================
// Velora — Insights Screen
// Analytics dashboard with stat cards, charts, and pattern cards.
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useLogStore } from '@src/stores/useLogStore';
import { usePredictions } from '@src/hooks/usePredictions';
import { useInsights } from '@src/hooks/useInsights';
import { StatCard } from '@src/components/insights/StatCard';
import { CycleLengthChart } from '@src/components/insights/CycleLengthChart';
import { SymptomTrendChart } from '@src/components/insights/SymptomTrendChart';
import { PatternInsightCard } from '@src/components/insights/PatternInsightCard';
import { Card } from '@src/components/ui/Card';
import { EmptyState } from '@src/components/ui/EmptyState';
import * as DailyLogRepository from '@src/database/repositories/DailyLogRepository';
import { roundTo } from '@src/utils/mathUtils';
import { colors, typography, spacing } from '@src/constants/theme';
import type { DailyLog } from '@src/types';

export default function InsightsScreen() {
  const db = useDatabase();
  const cycles = useCycleStore((s) => s.cycles);
  const { cycleStats } = usePredictions();
  const { insights, isLoading } = useInsights();
  const initLog = useLogStore((s) => s.initialize);

  const [allLogs, setAllLogs] = React.useState<DailyLog[]>([]);

  // Initialize log store + load all logs for charts
  useEffect(() => {
    initLog(db);
    DailyLogRepository.getAllDailyLogs(db).then(setAllLogs).catch(console.error);
  }, [db, initLog]);

  const hasCycles = cycles.length > 0;
  const hasStats = cycleStats !== null;

  if (!hasCycles) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="bar-chart-outline"
            title="No insights yet"
            description="Start tracking your cycles and logging daily symptoms to discover patterns and trends."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Insights</Text>

        {/* Stats Grid */}
        {hasStats && (
          <View style={styles.statsGrid}>
            <StatCard
              label="Avg Cycle"
              value={cycleStats.averageCycleLength}
              unit="days"
            />
            <StatCard
              label="Avg Period"
              value={cycleStats.averagePeriodLength}
              unit="days"
            />
            <StatCard
              label="Variability"
              value={`±${roundTo(cycleStats.cycleVariability, 1)}`}
              unit="days"
            />
            <StatCard
              label="Regularity"
              value={cycleStats.regularityScore}
              unit="%"
              trend={
                cycleStats.irregularityFlag === 'normal'
                  ? 'stable'
                  : cycleStats.irregularityFlag === 'mildly_irregular'
                    ? 'down'
                    : 'down'
              }
              trendLabel={cycleStats.irregularityFlag === 'normal' ? 'Regular' : 'Irregular'}
            />
          </View>
        )}

        {/* Cycle Length Chart */}
        <Card style={styles.section}>
          <CycleLengthChart cycles={cycles} />
        </Card>

        {/* Symptom Trend Chart */}
        <Card style={styles.section}>
          <SymptomTrendChart cycles={cycles} dailyLogs={allLogs} />
        </Card>

        {/* Pattern Insights */}
        <Text style={styles.sectionTitle}>Patterns & Correlations</Text>
        {insights.length > 0 ? (
          <View style={styles.insightsList}>
            {insights.map((insight) => (
              <PatternInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyInsights}>
            <Ionicons name="bulb-outline" size={28} color={colors.secondary[400]} />
            <Text style={styles.emptyInsightsText}>
              Log daily symptoms to discover patterns
            </Text>
            <Text style={styles.emptyInsightsSubtext}>
              Patterns appear after tracking across multiple cycles
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text.primary,
    paddingTop: spacing.base,
    marginBottom: spacing.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.base,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  insightsList: {
    gap: 10,
  },
  emptyInsights: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyInsightsText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyInsightsSubtext: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
});