import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import type { Prediction } from '@src/types';
import { diffDays, today, formatDisplayDate } from '@src/utils/dateUtils';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';

interface FertileStatusProps {
  prediction: Prediction;
  cycleStartDate: string;
  cycleLength: number;
}

export function FertileStatus({ prediction, cycleStartDate, cycleLength }: FertileStatusProps) {
  const todayStr = today();
  const currentCycleDay = diffDays(cycleStartDate, todayStr) + 1;

  const fertileStartDay = diffDays(cycleStartDate, prediction.fertileWindowStart) + 1;
  const fertileEndDay = diffDays(cycleStartDate, prediction.fertileWindowEnd) + 1;
  const ovulationDay = diffDays(cycleStartDate, prediction.estimatedOvulationDate) + 1;

  const isBeforeFertile = currentCycleDay < fertileStartDay;
  const isInFertileWindow = currentCycleDay >= fertileStartDay && currentCycleDay <= fertileEndDay;
  const isOvulationDay = currentCycleDay === ovulationDay;
  const isAfterFertile = currentCycleDay > fertileEndDay;

  const daysUntilFertile = fertileStartDay - currentCycleDay;
  const daysUntilOvulation = ovulationDay - currentCycleDay;
  const fertileWindowLength = fertileEndDay - fertileStartDay + 1;
  const dayInFertileWindow = isInFertileWindow ? currentCycleDay - fertileStartDay + 1 : 0;

  // Conception probability
  const getConceptionLevel = (): { label: string; color: string; icon: string } => {
    if (isOvulationDay) return { label: 'Very High', color: '#e74c3c', icon: 'flame' };
    if (isInFertileWindow) {
      const daysFromOvulation = Math.abs(currentCycleDay - ovulationDay);
      if (daysFromOvulation <= 1) return { label: 'High', color: '#e67e22', icon: 'flame' };
      return { label: 'Moderate', color: '#f39c12', icon: 'flame-outline' };
    }
    return { label: 'Low', color: colors.secondary[400], icon: 'snow-outline' };
  };

  const conception = getConceptionLevel();

  // Status message
  const getStatus = (): { title: string; subtitle: string; color: string; icon: string } => {
    if (isOvulationDay) {
      return {
        title: 'Ovulation Day',
        subtitle: 'Peak fertility — highest chance of conception today',
        color: colors.phase.ovulation,
        icon: 'sunny',
      };
    }
    if (isInFertileWindow) {
      return {
        title: `Fertile Window — Day ${dayInFertileWindow} of ${fertileWindowLength}`,
        subtitle: `Ovulation ${daysUntilOvulation === 0 ? 'today' : daysUntilOvulation > 0 ? `in ${daysUntilOvulation} day${daysUntilOvulation !== 1 ? 's' : ''}` : `was ${Math.abs(daysUntilOvulation)} day${Math.abs(daysUntilOvulation) !== 1 ? 's' : ''} ago`}`,
        color: colors.phase.fertile,
        icon: 'leaf',
      };
    }
    if (isBeforeFertile) {
      return {
        title: `${daysUntilFertile} day${daysUntilFertile !== 1 ? 's' : ''} until fertile window`,
        subtitle: `Fertile window starts ${formatDisplayDate(prediction.fertileWindowStart)}`,
        color: colors.primary[500],
        icon: 'time-outline',
      };
    }
    return {
      title: 'Fertile window has passed',
      subtitle: `Ovulation was around Day ${ovulationDay}`,
      color: colors.secondary[400],
      icon: 'checkmark-circle-outline',
    };
  };

  const status = getStatus();

  return (
    <Card variant="elevated" style={styles.card}>
      {/* Status header */}
      <View style={[styles.statusBanner, { backgroundColor: `${status.color}10` }]}>
        <Ionicons name={status.icon as any} size={24} color={status.color} />
        <View style={styles.statusTextWrap}>
          <Text style={[styles.statusTitle, { color: status.color }]}>{status.title}</Text>
          <Text style={styles.statusSubtitle}>{status.subtitle}</Text>
        </View>
      </View>

      {/* Key dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Fertile Window</Text>
          <Text style={styles.dateValue}>
            {formatDisplayDate(prediction.fertileWindowStart)} – {formatDisplayDate(prediction.fertileWindowEnd)}
          </Text>
        </View>
        <View style={styles.dateDivider} />
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Ovulation</Text>
          <Text style={[styles.dateValue, { color: colors.phase.ovulation }]}>
            {formatDisplayDate(prediction.estimatedOvulationDate)}
          </Text>
        </View>
      </View>

      {/* Conception probability */}
      <View style={[styles.conceptionRow, { backgroundColor: `${conception.color}10` }]}>
        <Ionicons name={conception.icon as any} size={16} color={conception.color} />
        <Text style={styles.conceptionLabel}>Conception Probability:</Text>
        <Text style={[styles.conceptionValue, { color: conception.color }]}>{conception.label}</Text>
      </View>

      {/* Day info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Day {fertileStartDay}–{fertileEndDay} of cycle</Text>
        <Text style={styles.infoText}>·</Text>
        <Text style={styles.infoText}>{fertileWindowLength} day window</Text>
        <Text style={styles.infoText}>·</Text>
        <Text style={styles.infoText}>Ovulation Day {ovulationDay}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  statusTextWrap: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusSubtitle: { ...typography.small, color: colors.text.secondary, marginTop: 2 },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 13, fontWeight: '600', color: colors.text.primary, marginTop: 2 },
  dateDivider: { width: 1, height: 28, backgroundColor: colors.secondary[200] },
  conceptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  conceptionLabel: { fontSize: 13, color: colors.text.secondary },
  conceptionValue: { fontSize: 13, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  infoText: { fontSize: 11, color: colors.text.muted },
});