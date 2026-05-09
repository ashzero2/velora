// ============================================================
// Velora — PatternInsightCard Component
// Auto-generated insight card with icon, title, description,
// and confidence badge.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { Badge } from '@src/components/ui/Badge';
import type { InsightItem } from '@src/types';
import { colors, typography, spacing } from '@src/constants/theme';

interface PatternInsightCardProps {
  insight: InsightItem;
}

function getInsightIcon(type: InsightItem['type']): string {
  switch (type) {
    case 'pattern':
      return 'repeat-outline';
    case 'trend':
      return 'trending-up-outline';
    case 'correlation':
      return 'link-outline';
    case 'statistic':
      return 'stats-chart-outline';
    default:
      return 'bulb-outline';
  }
}

function getInsightColor(type: InsightItem['type']): string {
  switch (type) {
    case 'pattern':
      return colors.phase.luteal;
    case 'trend':
      return colors.phase.follicular;
    case 'correlation':
      return colors.phase.ovulation;
    case 'statistic':
      return colors.primary[500];
    default:
      return colors.text.muted;
  }
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 75) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Low';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return colors.semantic.success;
  if (confidence >= 50) return colors.accent[500];
  return colors.text.muted;
}

export function PatternInsightCard({ insight }: PatternInsightCardProps) {
  const iconName = getInsightIcon(insight.type);
  const iconColor = getInsightColor(insight.type);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={iconName as any} size={18} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{insight.title}</Text>
          <Badge
            label={getConfidenceLabel(insight.confidence)}
            color={getConfidenceColor(insight.confidence)}
            size="sm"
          />
        </View>
      </View>
      <Text style={styles.description}>{insight.description}</Text>
      <Text style={styles.dataSource}>{insight.dataSource}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
    flex: 1,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  dataSource: {
    fontSize: 11,
    color: colors.text.muted,
  },
});