import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@src/hooks/useDatabase';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useLogStore } from '@src/stores/useLogStore';
import { usePredictions } from '@src/hooks/usePredictions';
import { Card } from '@src/components/ui/Card';
import { Badge } from '@src/components/ui/Badge';
import { EmptyState } from '@src/components/ui/EmptyState';
import { formatDisplayDate, today, subDays } from '@src/utils/dateUtils';
import { formatFlowIntensity } from '@src/utils/formatUtils';
import { colors, typography, spacing } from '@src/constants/theme';
import { useThemeColors } from '@src/hooks/useThemeColors';
import type { DailyLog } from '@src/types';
import { FlowIntensity, PredictionConfidence } from '@src/types';

// Flow level to visual height mapping
const FLOW_HEIGHT: Record<string, number> = {
  [FlowIntensity.SPOTTING]: 8,
  [FlowIntensity.LIGHT]: 16,
  [FlowIntensity.MEDIUM]: 28,
  [FlowIntensity.HEAVY]: 40,
  [FlowIntensity.VERY_HEAVY]: 52,
};

const FLOW_COLOR: Record<string, string> = {
  [FlowIntensity.SPOTTING]: '#e8c4c4',
  [FlowIntensity.LIGHT]: '#dba3a3',
  [FlowIntensity.MEDIUM]: '#c97b7b',
  [FlowIntensity.HEAVY]: '#b85a5a',
  [FlowIntensity.VERY_HEAVY]: '#a33d3d',
};

export default function InsightsScreen() {
  const theme = useThemeColors();
  const db = useDatabase();
  const cycles = useCycleStore((s) => s.cycles);
  const { upcomingPredictions } = usePredictions();
  const recentLogs = useLogStore((s) => s.recentLogs);
  const initLog = useLogStore((s) => s.initialize);

  useEffect(() => { initLog(db); }, [db, initLog]);

  const hasCycles = cycles.length > 0;

  // Last 3 completed cycles (most recent first)
  const pastCycles = [...cycles]
    .filter((c) => c.periodEndDate)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 3);

  // Next 3 predictions
  const predictions = upcomingPredictions.slice(0, 3);

  // Last 7 days flow data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today(), 6 - i); // oldest first
    const log = recentLogs.find((l) => l.date === date);
    return { date, flow: log?.flow ?? null };
  });

  if (!hasCycles) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="bar-chart-outline"
            title="No insights yet"
            description="Start tracking your cycles to see period history, predictions, and flow patterns."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Insights</Text>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Your cycle at a glance</Text>
        </View>

        {/* Past Periods */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={16} color={colors.phase.menstruation} />
            <Text style={styles.sectionTitle}>Past Periods</Text>
          </View>
          {pastCycles.length > 0 ? (
            <View style={styles.periodList}>
              {pastCycles.map((cycle, idx) => (
                <View
                  key={cycle.id}
                  style={[styles.periodRow, idx === pastCycles.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.periodDates}>
                    <Text style={styles.periodDateText}>
                      {formatDisplayDate(cycle.startDate)} – {cycle.periodEndDate ? formatDisplayDate(cycle.periodEndDate) : 'Ongoing'}
                    </Text>
                  </View>
                  <View style={styles.periodStats}>
                    {cycle.cycleLength ? (
                      <View style={styles.periodStat}>
                        <Text style={styles.periodStatValue}>{cycle.cycleLength}</Text>
                        <Text style={styles.periodStatLabel}>cycle</Text>
                      </View>
                    ) : null}
                    {cycle.periodLength ? (
                      <View style={styles.periodStat}>
                        <Text style={[styles.periodStatValue, { color: colors.phase.menstruation }]}>{cycle.periodLength}</Text>
                        <Text style={styles.periodStatLabel}>period</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Complete a cycle to see period history</Text>
          )}
        </Card>

        {/* Upcoming Predictions */}
        {predictions.length > 0 && (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Upcoming Periods</Text>
            </View>
            <View style={styles.predictionList}>
              {predictions.map((p, idx) => (
                <View
                  key={p.id}
                  style={[styles.predictionRow, idx === predictions.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.predictionLeft}>
                    <Text style={styles.predictionLabel}>Period {idx + 1}</Text>
                    <Text style={styles.predictionDate}>
                      {formatDisplayDate(p.predictedPeriodStart, true)}
                    </Text>
                  </View>
                  <Badge
                    label={p.confidence}
                    color={
                      p.confidence === PredictionConfidence.HIGH ? colors.semantic.success
                        : p.confidence === PredictionConfidence.MEDIUM ? colors.semantic.warning
                          : colors.secondary[400]
                    }
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 7-Day Flow History */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water" size={16} color={colors.phase.menstruation} />
            <Text style={styles.sectionTitle}>7-Day Flow</Text>
          </View>
          <View style={styles.flowChart}>
            {last7Days.map(({ date, flow }) => {
              const dateObj = new Date(date);
              const dayLabel = date === today() ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const barHeight = flow ? FLOW_HEIGHT[flow] ?? 8 : 0;
              const barColor = flow ? FLOW_COLOR[flow] ?? colors.secondary[300] : colors.secondary[200];

              return (
                <View key={date} style={styles.flowDay}>
                  <View style={styles.flowBarWrap}>
                    {flow ? (
                      <View style={[styles.flowBar, { height: barHeight, backgroundColor: barColor }]} />
                    ) : (
                      <View style={styles.flowBarEmpty}>
                        <Text style={styles.flowBarDash}>—</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.flowDayLabel, date === today() && { fontWeight: '700', color: colors.primary[500] }]}>
                    {dayLabel}
                  </Text>
                  {flow && (
                    <Text style={styles.flowLevelLabel}>
                      {formatFlowIntensity(flow).charAt(0)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          {/* Flow legend */}
          <View style={styles.flowLegend}>
            {[FlowIntensity.SPOTTING, FlowIntensity.LIGHT, FlowIntensity.MEDIUM, FlowIntensity.HEAVY, FlowIntensity.VERY_HEAVY].map((level) => (
              <View key={level} style={styles.flowLegendItem}>
                <View style={[styles.flowLegendDot, { backgroundColor: FLOW_COLOR[level] }]} />
                <Text style={styles.flowLegendText}>{formatFlowIntensity(level)}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  header: { paddingTop: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  screenSubtitle: { fontSize: 14, color: colors.secondary[500] },

  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },

  // Past Periods
  periodList: { gap: 0 },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  periodDates: { flex: 1 },
  periodDateText: { fontSize: 13, color: colors.text.secondary },
  periodStats: { flexDirection: 'row', gap: 16 },
  periodStat: { alignItems: 'center' },
  periodStatValue: { fontSize: 16, fontWeight: '700', color: colors.text.primary },
  periodStatLabel: { fontSize: 10, color: colors.text.muted, textTransform: 'uppercase' },

  emptyText: { fontSize: 13, color: colors.text.muted, textAlign: 'center', paddingVertical: 12 },

  // Predictions
  predictionList: { gap: 0 },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  predictionLeft: { flex: 1 },
  predictionLabel: { fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.3 },
  predictionDate: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginTop: 2 },

  // Flow chart
  flowChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingTop: 8,
  },
  flowDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  flowBarWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  flowBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  flowBarEmpty: {
    justifyContent: 'flex-end',
  },
  flowBarDash: {
    fontSize: 12,
    color: colors.secondary[300],
  },
  flowDayLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  flowLevelLabel: {
    fontSize: 9,
    color: colors.text.muted,
    fontWeight: '600',
  },
  flowLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  flowLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flowLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flowLegendText: {
    fontSize: 10,
    color: colors.text.muted,
  },
});
