import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { CONCEPTION_TIPS } from '@src/constants/nutrition';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';

interface ConceptionTipsProps {
  ovulationDay?: number;
  currentCycleDay?: number;
}

export function ConceptionTips({ ovulationDay, currentCycleDay }: ConceptionTipsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={18} color={colors.phase.ovulation} />
        <Text style={styles.title}>Conception Tips</Text>
      </View>

      {ovulationDay && currentCycleDay ? (
        <View style={styles.timingBanner}>
          <Ionicons name="timer-outline" size={16} color={colors.phase.fertile} />
          <Text style={styles.timingText}>
            {currentCycleDay < ovulationDay
              ? `Ovulation expected in ${ovulationDay - currentCycleDay} day${ovulationDay - currentCycleDay !== 1 ? 's' : ''} — best time to try is now through ovulation day`
              : currentCycleDay === ovulationDay
                ? 'Today is ovulation day — peak fertility window'
                : `Ovulation was ${currentCycleDay - ovulationDay} day${currentCycleDay - ovulationDay !== 1 ? 's' : ''} ago`}
          </Text>
        </View>
      ) : null}

      <View style={styles.tipsList}>
        {CONCEPTION_TIPS.map((tip, idx) => (
          <View key={tip.title} style={[styles.tipItem, idx === CONCEPTION_TIPS.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.tipIconWrap}>
              <Ionicons name={tip.icon as any} size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.bodyBold, color: colors.text.primary },
  timingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: spacing.md,
    backgroundColor: `${colors.phase.fertile}10`,
    borderRadius: borderRadius.sm,
  },
  timingText: { ...typography.small, color: colors.phase.fertile, fontWeight: '500', flex: 1 },
  tipsList: { gap: 0 },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  tipDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 4, lineHeight: 18 },
});