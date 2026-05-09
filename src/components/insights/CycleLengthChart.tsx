// ============================================================
// Velora — CycleLengthChart Component
// Bar chart of cycle lengths over time using victory-native.
// Normal range colored sage, abnormal colored rose (SR7).
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import type { Cycle } from '@src/types';
import { NORMAL_CYCLE_MIN, NORMAL_CYCLE_MAX } from '@src/constants/medical';
import { colors, typography } from '@src/constants/theme';

interface CycleLengthChartProps {
  cycles: Cycle[];
  maxCycles?: number;
}

export function CycleLengthChart({ cycles, maxCycles = 8 }: CycleLengthChartProps) {
  // Filter to completed cycles with cycle length, take last N, reverse to chronological order
  const completedCycles = cycles
    .filter((c) => c.cycleLength !== null)
    .slice(0, maxCycles)
    .reverse();

  if (completedCycles.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Complete more cycles to see length trends</Text>
      </View>
    );
  }

  const data = completedCycles.map((cycle, index) => ({
    x: index + 1,
    y: cycle.cycleLength as number,
    label: `C${index + 1}`,
    isNormal: (cycle.cycleLength as number) >= NORMAL_CYCLE_MIN && (cycle.cycleLength as number) <= NORMAL_CYCLE_MAX,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cycle Length History</Text>
      <View style={styles.chartWrap}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={['y']}
          domainPadding={{ left: 20, right: 20, top: 10 }}
          axisOptions={{
            formatXLabel: (val) => `C${Math.round(val)}`,
            formatYLabel: (val) => `${Math.round(val)}`,
          }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              color={colors.primary[500]}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              barWidth={24}
            />
          )}
        </CartesianChart>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Normal range: {NORMAL_CYCLE_MIN}–{NORMAL_CYCLE_MAX} days
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
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
  legend: {
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    color: colors.text.muted,
  },
});