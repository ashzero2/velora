// ============================================================
// Velora — PredictionCard Component
// Displays predicted next period date with confidence badge,
// date range, countdown, and basis explanation.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@src/components/ui/Card';
import { Badge } from '@src/components/ui/Badge';
import type { Prediction } from '@src/types';
import { PredictionConfidence } from '@src/types';
import { formatDisplayDate, formatDateRange, diffDays, today } from '@src/utils/dateUtils';
import { colors, typography, spacing } from '@src/constants/theme';

interface PredictionCardProps {
  prediction: Prediction;
}

/** Map confidence level to badge color */
function getConfidenceColor(confidence: PredictionConfidence): string {
  switch (confidence) {
    case PredictionConfidence.HIGH:
      return colors.semantic.success;   // green
    case PredictionConfidence.MEDIUM:
      return colors.accent[500];        // amber
    case PredictionConfidence.LOW:
      return colors.phase.menstruation; // rose
    default:
      return colors.text.muted;
  }
}

/** Map confidence level to display label */
function getConfidenceLabel(confidence: PredictionConfidence): string {
  switch (confidence) {
    case PredictionConfidence.HIGH:
      return 'High';
    case PredictionConfidence.MEDIUM:
      return 'Medium';
    case PredictionConfidence.LOW:
      return 'Low';
    default:
      return 'N/A';
  }
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const daysUntil = diffDays(today(), prediction.predictedPeriodStart);
  const isOverdue = daysUntil < 0;
  const absDays = Math.abs(daysUntil);

  const confidenceColor = getConfidenceColor(prediction.confidence);
  const confidenceLabel = getConfidenceLabel(prediction.confidence);

  // Show date range for MEDIUM/LOW confidence
  const showRange =
    prediction.confidence !== PredictionConfidence.HIGH &&
    prediction.predictedPeriodStartRange[0] !== prediction.predictedPeriodStartRange[1];

  const countdownText = isOverdue
    ? absDays === 0
      ? 'Today'
      : `${absDays} day${absDays !== 1 ? 's' : ''} overdue`
    : daysUntil === 0
      ? 'Today'
      : daysUntil === 1
        ? 'Tomorrow'
        : `in ${daysUntil} days`;

  return (
    <Card variant="elevated" style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.title}>Next Period</Text>
        <Badge label={confidenceLabel} color={confidenceColor} size="sm" />
      </View>

      {/* Primary date */}
      <Text style={styles.primaryDate}>
        {formatDisplayDate(prediction.predictedPeriodStart)}
      </Text>

      {/* Date range (MEDIUM/LOW only) */}
      {showRange && (
        <Text style={styles.dateRange}>
          {formatDateRange(
            prediction.predictedPeriodStartRange[0],
            prediction.predictedPeriodStartRange[1],
          )}
        </Text>
      )}

      {/* Countdown */}
      <Text style={[styles.countdown, isOverdue && styles.overdue]}>
        {countdownText}
      </Text>

      {/* Basis description */}
      <Text style={styles.basis}>{prediction.basisDescription}</Text>
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
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  primaryDate: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateRange: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  countdown: {
    ...typography.body,
    color: colors.primary[600],
    marginBottom: spacing.sm,
  },
  overdue: {
    color: colors.phase.menstruation,
  },
  basis: {
    ...typography.small,
    color: colors.text.muted,
  },
});