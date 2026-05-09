// ============================================================
// Velora — SymptomTrendChart Component
// Line chart of symptom severity trends over cycles.
// Uses victory-native CartesianChart + Line.
// ============================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import type { Cycle, DailyLog } from '@src/types';
import { Severity } from '@src/types';
import { diffDays } from '@src/utils/dateUtils';
import { roundTo } from '@src/utils/mathUtils';
import { SYMPTOM_CATEGORIES } from '@src/constants/symptoms';
import { colors, typography } from '@src/constants/theme';

interface SymptomTrendChartProps {
  cycles: Cycle[];
  dailyLogs: DailyLog[];
  maxCycles?: number;
}

const CHART_COLORS = [
  colors.phase.menstruation,
  colors.phase.follicular,
  colors.phase.ovulation,
  colors.phase.luteal,
  colors.phase.fertile,
  colors.accent[500],
];

export function SymptomTrendChart({ cycles, dailyLogs, maxCycles = 8 }: SymptomTrendChartProps) {
  const [selectedSymptom, setSelectedSymptom] = useState(0);

  const completedCycles = cycles
    .filter((c) => c.cycleLength !== null)
    .slice(0, maxCycles)
    .reverse();

  if (completedCycles.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Complete more cycles to see symptom trends</Text>
      </View>
    );
  }

  const symptom = SYMPTOM_CATEGORIES[selectedSymptom];
  const severityField = symptom.severityField as keyof DailyLog;

  // Calculate average severity per cycle for the selected symptom
  const data = completedCycles.map((cycle, index) => {
    const cycleLogs = dailyLogs.filter((log) => {
      const d = diffDays(cycle.startDate, log.date);
      return d >= 0 && (cycle.endDate ? diffDays(log.date, cycle.endDate) >= 0 : true);
    });

    let total = 0;
    let count = 0;
    for (const log of cycleLogs) {
      const severity = log[severityField] as unknown as Severity;
      if (typeof severity === 'number' && severity > Severity.NONE) {
        total += severity;
        count++;
      }
    }

    return {
      x: index + 1,
      y: count > 0 ? roundTo(total / count, 1) : 0,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Symptom Trends</Text>

      {/* Symptom selector */}
      <View style={styles.selectorRow}>
        {SYMPTOM_CATEGORIES.map((s, i) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSelectedSymptom(i)}
            activeOpacity={0.7}
            style={[
              styles.selectorChip,
              selectedSymptom === i && {
                backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`,
                borderColor: CHART_COLORS[i % CHART_COLORS.length],
              },
            ]}
          >
            <Text
              style={[
                styles.selectorText,
                selectedSymptom === i && { color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: '600' },
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.chartWrap}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={['y']}
          domainPadding={{ left: 20, right: 20, top: 10 }}
          axisOptions={{
            formatXLabel: (val) => `C${Math.round(val)}`,
            formatYLabel: (val) => `${roundTo(val, 1)}`,
          }}
        >
          {({ points }) => (
            <Line
              points={points.y}
              color={CHART_COLORS[selectedSymptom % CHART_COLORS.length]}
              strokeWidth={2.5}
              curveType="natural"
            />
          )}
        </CartesianChart>
      </View>

      <Text style={styles.axisLabel}>Average severity per cycle (0–4)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.secondary[50],
  },
  selectorText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chartWrap: {
    height: 200,
    width: '100%',
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  axisLabel: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: 'center',
  },
});