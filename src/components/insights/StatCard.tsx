// ============================================================
// Velora — StatCard Component
// Single statistic display card with value, label, and trend.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { colors, typography } from '@src/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
}

export function StatCard({ label, value, unit, trend, trendLabel }: StatCardProps) {
  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  const trendColor = trend === 'up' ? colors.semantic.warning : trend === 'down' ? colors.semantic.info : colors.text.muted;

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {trend && (
        <View style={styles.trendRow}>
          <Ionicons name={trendIcon as any} size={12} color={trendColor} />
          {trendLabel && <Text style={[styles.trendText, { color: trendColor }]}>{trendLabel}</Text>}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  unit: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trendText: {
    fontSize: 11,
  },
});