// ============================================================
// Velora — Calendar Screen
// Monthly calendar with cycle phase color-coding,
// period days, predicted dates, fertile window, and ovulation.
// ============================================================

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { usePredictions } from '@src/hooks/usePredictions';
import { getCurrentPhase, getCurrentCycleDay, getPhaseBoundaries } from '@src/engines/CycleEngine';
import { addDays, diffDays, today, formatDisplayDate } from '@src/utils/dateUtils';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, DEFAULT_LUTEAL_PHASE } from '@src/constants/medical';
import { colors, typography, spacing } from '@src/constants/theme';
import type { CyclePhase } from '@src/types';

// Color mapping for calendar markers
const MARKER_COLORS = {
  period: colors.phase.menstruation,
  predictedPeriod: `${colors.phase.menstruation}60`,
  fertile: colors.phase.fertile,
  ovulation: colors.phase.ovulation,
  today: colors.primary[500],
} as const;

export default function CalendarScreen() {
  const cycles = useCycleStore((s) => s.cycles);
  const settings = useSettingsStore((s) => s.settings);
  const { prediction } = usePredictions();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = today();

  // Build marked dates for the calendar
  const markedDates = useMemo<MarkedDates>(() => {
    const marks: MarkedDates = {};

    // 1. Mark historical period days from all cycles
    for (const cycle of cycles) {
      const periodEnd = cycle.periodEndDate ?? cycle.startDate;
      const periodDays = diffDays(cycle.startDate, periodEnd) + 1;

      for (let d = 0; d < periodDays; d++) {
        const dateStr = addDays(cycle.startDate, d);
        marks[dateStr] = {
          ...marks[dateStr],
          marked: true,
          dots: [
            ...(marks[dateStr]?.dots ?? []),
            { key: 'period', color: MARKER_COLORS.period },
          ],
        };
      }
    }

    // 2. Mark predicted period days
    if (prediction) {
      const predStart = prediction.predictedPeriodStart;
      const predEnd = prediction.predictedPeriodEnd;
      const predDays = diffDays(predStart, predEnd) + 1;

      for (let d = 0; d < predDays; d++) {
        const dateStr = addDays(predStart, d);
        if (!marks[dateStr]?.dots?.some((dot) => dot.key === 'period')) {
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dots: [
              ...(marks[dateStr]?.dots ?? []),
              { key: 'predicted', color: MARKER_COLORS.predictedPeriod },
            ],
          };
        }
      }

      // 3. Mark fertile window (only if fertility tracking enabled)
      if (settings.fertilityTrackingEnabled) {
        const fertileStart = prediction.fertileWindowStart;
        const fertileEnd = prediction.fertileWindowEnd;
        const fertileDays = diffDays(fertileStart, fertileEnd) + 1;

        for (let d = 0; d < fertileDays; d++) {
          const dateStr = addDays(fertileStart, d);
          marks[dateStr] = {
            ...marks[dateStr],
            marked: true,
            dots: [
              ...(marks[dateStr]?.dots ?? []),
              { key: 'fertile', color: MARKER_COLORS.fertile },
            ],
          };
        }

        // 4. Mark ovulation day
        const ovDate = prediction.estimatedOvulationDate;
        marks[ovDate] = {
          ...marks[ovDate],
          marked: true,
          dots: [
            ...(marks[ovDate]?.dots ?? []),
            { key: 'ovulation', color: MARKER_COLORS.ovulation },
          ],
        };
      }
    }

    // 5. Mark today
    marks[todayStr] = {
      ...marks[todayStr],
      today: true,
    };

    // 6. Mark selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: `${colors.primary[500]}30`,
        selectedTextColor: colors.primary[700],
      };
    }

    return marks;
  }, [cycles, prediction, settings.fertilityTrackingEnabled, todayStr, selectedDate]);

  // Get info for selected date
  const selectedInfo = useMemo(() => {
    if (!selectedDate) return null;

    const currentCycle = cycles[0];
    if (!currentCycle) return null;

    const daysDiff = diffDays(currentCycle.startDate, selectedDate);
    if (daysDiff < 0) return null;

    const cycleDay = daysDiff + 1;
    const cycleLength = currentCycle.cycleLength ?? DEFAULT_CYCLE_LENGTH;
    const periodLength = currentCycle.periodLength ?? DEFAULT_PERIOD_LENGTH;
    const lutealPhase = settings.defaultLutealPhase ?? DEFAULT_LUTEAL_PHASE;

    if (cycleDay > cycleLength * 2) return null; // Don't show for very distant dates

    const phaseInfo = getCurrentPhase(cycleDay, cycleLength, periodLength, lutealPhase);

    return {
      cycleDay,
      phase: phaseInfo.phase,
      phaseName: phaseInfo.phase.charAt(0).toUpperCase() + phaseInfo.phase.slice(1),
      description: phaseInfo.description,
    };
  }, [selectedDate, cycles, settings.defaultLutealPhase]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Calendar</Text>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: colors.background.light,
          calendarBackground: colors.surface.light,
          textSectionTitleColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.primary[500],
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.primary[600],
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.muted,
          dotColor: colors.primary[500],
          arrowColor: colors.primary[600],
          monthTextColor: colors.text.primary,
          textMonthFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      {/* Selected date info */}
      {selectedDate && selectedInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoDate}>{formatDisplayDate(selectedDate, true)}</Text>
          <Text style={styles.infoCycleDay}>Cycle Day {selectedInfo.cycleDay}</Text>
          <Text style={styles.infoPhase}>{selectedInfo.phaseName} Phase</Text>
          <Text style={styles.infoDesc}>{selectedInfo.description}</Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendGrid}>
          <LegendItem color={MARKER_COLORS.period} label="Period" />
          <LegendItem color={MARKER_COLORS.predictedPeriod} label="Predicted Period" />
          {settings.fertilityTrackingEnabled && (
            <>
              <LegendItem color={MARKER_COLORS.fertile} label="Fertile Window" />
              <LegendItem color={MARKER_COLORS.ovulation} label="Ovulation" />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  infoCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  infoDate: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoCycleDay: {
    ...typography.caption,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  infoPhase: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoDesc: {
    ...typography.small,
    color: colors.text.secondary,
  },
  legend: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  legendTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '40%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.small,
    color: colors.text.secondary,
  },
});