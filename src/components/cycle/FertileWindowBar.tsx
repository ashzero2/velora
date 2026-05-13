// ============================================================
// Velora — FertileWindowBar Component
// Horizontal timeline bar showing fertile window, ovulation marker,
// and today indicator within the current cycle.
// Redesigned for clarity: day labels, countdown, phase segments.
// Only shown when fertilityTrackingEnabled is true.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@src/components/ui/Card';
import type { Prediction } from '@src/types';
import { diffDays, today, formatDisplayDate } from '@src/utils/dateUtils';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
  const toPercent = (day: number) =>
    Math.max(0, Math.min(100, ((day - 1) / (cycleLength - 1)) * 100));

  const fertileStartPct = toPercent(fertileStartDay);
  const fertileWidthPct = toPercent(fertileEndDay) - fertileStartPct;
  const ovulationPct = toPercent(ovulationDay);
  const todayPct = toPercent(currentCycleDay);

  // Determine relationship to fertile window
  const isBeforeFertile = currentCycleDay < fertileStartDay;
  const isInFertileWindow =
    currentCycleDay >= fertileStartDay && currentCycleDay <= fertileEndDay;
  const isAfterFertile = currentCycleDay > fertileEndDay;
  const isOvulationDay = currentCycleDay === ovulationDay;

  // Days until/since
  const daysUntilFertile = fertileStartDay - currentCycleDay;
  const daysUntilOvulation = ovulationDay - currentCycleDay;
  const fertileWindowLength = fertileEndDay - fertileStartDay + 1;
  const dayInFertileWindow = isInFertileWindow
    ? currentCycleDay - fertileStartDay + 1
    : 0;

  // Status message and icon
  const getStatusInfo = (): {
    message: string;
    detail: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  } => {
    if (isOvulationDay) {
      return {
        message: 'Ovulation Day',
        detail: 'Peak fertility — this is the most fertile day of your cycle',
        icon: 'ellipse',
        color: colors.phase.ovulation,
      };
    }
    if (isInFertileWindow) {
      return {
        message: `Fertile Window · Day ${dayInFertileWindow} of ${fertileWindowLength}`,
        detail: `Ovulation expected ${daysUntilOvulation === 0 ? 'today' : daysUntilOvulation > 0 ? `in ${daysUntilOvulation} day${daysUntilOvulation !== 1 ? 's' : ''}` : `${Math.abs(daysUntilOvulation)} day${Math.abs(daysUntilOvulation) !== 1 ? 's' : ''} ago`}`,
        icon: 'flame',
        color: colors.phase.fertile,
      };
    }
    if (isBeforeFertile) {
      return {
        message: `${daysUntilFertile} day${daysUntilFertile !== 1 ? 's' : ''} until fertile window`,
        detail: `Fertile window: Day ${fertileStartDay}–${fertileEndDay} · Ovulation: Day ${ovulationDay}`,
        icon: 'time-outline',
        color: colors.primary[500],
      };
    }
    // After fertile window
    return {
      message: 'Fertile window has passed',
      detail: `Ovulation was around Day ${ovulationDay} · Low chance of conception`,
      icon: 'checkmark-circle-outline',
      color: colors.secondary[400],
    };
  };

  const status = getStatusInfo();

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="leaf-outline" size={16} color={colors.phase.fertile} />
          <Text style={styles.title}>Fertility Tracker</Text>
        </View>
        <Text style={styles.dateRange}>
          {formatDisplayDate(prediction.fertileWindowStart)} –{' '}
          {formatDisplayDate(prediction.fertileWindowEnd)}
        </Text>
      </View>

      {/* Status banner */}
      <View style={[styles.statusBanner, { backgroundColor: `${status.color}12` }]}>
        <Ionicons name={status.icon} size={16} color={status.color} />
        <View style={styles.statusTextWrap}>
          <Text style={[styles.statusMessage, { color: status.color }]}>
            {status.message}
          </Text>
          <Text style={styles.statusDetail}>{status.detail}</Text>
        </View>
      </View>

      {/* Timeline bar */}
      <View style={styles.timelineSection}>
        {/* Today position label above the bar */}
        <View style={[styles.todayLabelWrap, { left: `${todayPct}%` }]}>
          <Text style={styles.todayLabelText}>Day {currentCycleDay}</Text>
          <View style={styles.todayLabelArrow} />
        </View>

        <View style={styles.barContainer}>
          {/* Background track */}
          <View style={styles.track} />

          {/* Pre-fertile segment */}
          {fertileStartPct > 0 && (
            <View
              style={[
                styles.preSegment,
                { left: 0, width: `${fertileStartPct}%` },
              ]}
            />
          )}

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

          {/* Post-fertile segment */}
          {fertileStartPct + fertileWidthPct < 100 && (
            <View
              style={[
                styles.postSegment,
                {
                  left: `${fertileStartPct + fertileWidthPct}%`,
                  width: `${100 - fertileStartPct - fertileWidthPct}%`,
                },
              ]}
            />
          )}

          {/* Ovulation marker */}
          <View style={[styles.ovulationMarkerOuter, { left: `${ovulationPct}%` }]}>
            <View style={styles.ovulationMarkerInner} />
          </View>

          {/* Today marker */}
          <View
            style={[
              styles.todayMarker,
              { left: `${todayPct}%` },
              isInFertileWindow && styles.todayInFertile,
            ]}
          />
        </View>

        {/* Day labels below the bar */}
        <View style={styles.dayLabelsRow}>
          <Text style={styles.dayEdgeLabel}>Day 1</Text>
          <Text style={[styles.dayEdgeLabel, { color: colors.phase.fertile }]}>
            Day {fertileStartDay}
          </Text>
          <Text style={[styles.dayEdgeLabel, { color: colors.phase.ovulation, fontWeight: '600' }]}>
            Day {ovulationDay}
          </Text>
          <Text style={[styles.dayEdgeLabel, { color: colors.phase.fertile }]}>
            Day {fertileEndDay}
          </Text>
          <Text style={styles.dayEdgeLabel}>Day {cycleLength}</Text>
        </View>

        {/* Phase labels below day numbers */}
        <View style={styles.phaseLabelsRow}>
          <View style={styles.phaseLabelWrap}>
            <View style={[styles.phaseIndicator, { backgroundColor: colors.secondary[300] }]} />
            <Text style={styles.phaseLabel}>Low fertility</Text>
          </View>
          <View style={styles.phaseLabelWrap}>
            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase.fertile }]} />
            <Text style={styles.phaseLabel}>Fertile</Text>
          </View>
          <View style={styles.phaseLabelWrap}>
            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase.ovulation }]} />
            <Text style={styles.phaseLabel}>Ovulation</Text>
          </View>
        </View>
      </View>

      {/* Key insights */}
      <View style={styles.insightsRow}>
        <View style={styles.insightItem}>
          <Text style={styles.insightValue}>Day {fertileStartDay}–{fertileEndDay}</Text>
          <Text style={styles.insightLabel}>Fertile Window</Text>
        </View>
        <View style={styles.insightDivider} />
        <View style={styles.insightItem}>
          <Text style={[styles.insightValue, { color: colors.phase.ovulation }]}>Day {ovulationDay}</Text>
          <Text style={styles.insightLabel}>Ovulation</Text>
        </View>
        <View style={styles.insightDivider} />
        <View style={styles.insightItem}>
          <Text style={styles.insightValue}>{fertileWindowLength} days</Text>
          <Text style={styles.insightLabel}>Window Length</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  dateRange: {
    ...typography.small,
    color: colors.text.muted,
  },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  statusDetail: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Timeline section
  timelineSection: {
    paddingTop: 28,
  },
  todayLabelWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    marginLeft: -24,
    width: 48,
    zIndex: 10,
  },
  todayLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[500],
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  todayLabelArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary[50],
  },
  barContainer: {
    height: 28,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: colors.secondary[200],
    borderRadius: 5,
  },
  preSegment: {
    position: 'absolute',
    height: 10,
    backgroundColor: colors.secondary[200],
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  fertileSegment: {
    position: 'absolute',
    height: 10,
    backgroundColor: `${colors.phase.fertile}50`,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: `${colors.phase.fertile}80`,
  },
  postSegment: {
    position: 'absolute',
    height: 10,
    backgroundColor: colors.secondary[200],
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  ovulationMarkerOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginLeft: -8,
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ovulationMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.phase.ovulation,
  },
  todayMarker: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: '#ffffff',
    marginLeft: -6,
    top: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  todayInFertile: {
    backgroundColor: colors.phase.fertile,
    borderColor: '#ffffff',
  },

  // Day labels
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dayEdgeLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },

  // Phase labels
  phaseLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.base,
    marginTop: spacing.sm,
  },
  phaseLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },

  // Insights row
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  insightLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  insightDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.secondary[200],
  },
});
