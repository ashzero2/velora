// ============================================================
// Velora — FertileWindowBar Component
// Horizontal timeline bar showing fertile window, ovulation marker,
// and today indicator within the current cycle.
// Only shown when fertilityTrackingEnabled is true.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@src/components/ui/Card';
import type { Prediction } from '@src/types';
import { diffDays, today, formatDisplayDate } from '@src/utils/dateUtils';
import { colors, typography, spacing } from '@src/constants/theme';

interface FertileWindowBarProps {
  prediction: Prediction;
  cycleStartDate: string;
  cycleLength: number;
}

export function FertileWindowBar({
  prediction,
  cycleStartDate,
  cycleLength,
}: FertileWindowBarProps) {
  const todayStr = today();
  const currentCycleDay = diffDays(cycleStartDate, todayStr) + 1;

  // Calculate day positions within the cycle (1-based)
  const fertileStartDay = diffDays(cycleStartDate, prediction.fertileWindowStart) + 1;
  const fertileEndDay = diffDays(cycleStartDate, prediction.fertileWindowEnd) + 1;
  const ovulationDay = diffDays(cycleStartDate, prediction.estimatedOvulationDate) + 1;

  // Convert to percentages for layout
  const toPercent = (day: number) => Math.max(0, Math.min(100, ((day - 1) / (cycleLength - 1)) * 100));

  const fertileStartPct = toPercent(fertileStartDay);
  const fertileWidthPct = toPercent(fertileEndDay) - fertileStartPct;
  const ovulationPct = toPercent(ovulationDay);
  const todayPct = toPercent(currentCycleDay);

  // Determine if today is in the fertile window
  const isInFertileWindow = currentCycleDay >= fertileStartDay && currentCycleDay <= fertileEndDay;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Fertile Window</Text>
        <Text style={styles.subtitle}>
          {formatDisplayDate(prediction.fertileWindowStart)} – {formatDisplayDate(prediction.fertileWindowEnd)}
        </Text>
      </View>

      {/* Timeline bar */}
      <View style={styles.barContainer}>
        {/* Background track */}
        <View style={styles.track} />

        {/* Fertile window segment */}
        <View
          style={[
            styles.fertileSegment,
            {
              left: `${fertileStartPct}%`,
              width: `${Math.max(fertileWidthPct, 2)}%`,
            },
          ]}
        />

        {/* Ovulation marker */}
        <View
          style={[
            styles.ovulationMarker,
            { left: `${ovulationPct}%` },
          ]}
        />

        {/* Today marker */}
        <View
          style={[
            styles.todayMarker,
            { left: `${todayPct}%` },
            isInFertileWindow && styles.todayInFertile,
          ]}
        />
      </View>

      {/* Labels row */}
      <View style={styles.labelsRow}>
        <Text style={styles.dayLabel}>Day 1</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.fertile }]} />
            <Text style={styles.legendText}>Fertile</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.phase.ovulation }]} />
            <Text style={styles.legendText}>Ovulation</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
        <Text style={styles.dayLabel}>Day {cycleLength}</Text>
      </View>

      {/* Status text */}
      {isInFertileWindow && (
        <Text style={styles.statusText}>
          You're currently in your fertile window (Day {currentCycleDay})
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.small,
    color: colors.text.muted,
  },
  barContainer: {
    height: 24,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
  },
  fertileSegment: {
    position: 'absolute',
    height: 8,
    backgroundColor: `${colors.phase.fertile}80`,
    borderRadius: 4,
  },
  ovulationMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.phase.ovulation,
    marginLeft: -6,
    top: 6,
  },
  todayMarker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: '#ffffff',
    marginLeft: -5,
    top: 7,
  },
  todayInFertile: {
    backgroundColor: colors.phase.fertile,
    borderColor: colors.phase.ovulation,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    ...typography.small,
    color: colors.text.muted,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  statusText: {
    ...typography.caption,
    color: colors.phase.fertile,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});