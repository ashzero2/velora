import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { CyclePhase } from '@src/types';
import { PHASE_WELLNESS } from '@src/constants/nutrition';
import { PHASE_COLORS, PHASE_DISPLAY_NAMES } from '@src/constants/phases';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';

interface WellnessTipsProps {
  currentPhase: CyclePhase;
}

interface TipRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}

function TipRow({ icon, iconColor, label, value }: TipRowProps) {
  return (
    <View style={styles.tipRow}>
      <View style={[styles.tipIconWrap, { backgroundColor: `${iconColor}12` }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipLabel}>{label}</Text>
        <Text style={styles.tipValue}>{value}</Text>
      </View>
    </View>
  );
}

export function WellnessTips({ currentPhase }: WellnessTipsProps) {
  const data = PHASE_WELLNESS[currentPhase] ?? PHASE_WELLNESS[CyclePhase.UNKNOWN];
  const phaseColor = PHASE_COLORS[currentPhase] ?? PHASE_COLORS[CyclePhase.UNKNOWN];
  const phaseName = PHASE_DISPLAY_NAMES[currentPhase] ?? 'Unknown';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="fitness-outline" size={18} color={phaseColor} />
        <Text style={styles.title}>Wellness — {phaseName} Phase</Text>
      </View>

      <View style={styles.tipsContainer}>
        <TipRow
          icon="barbell-outline"
          iconColor={colors.phase.follicular}
          label="Exercise"
          value={`${data.exercise.type} · ${data.exercise.duration}\n${data.exercise.description}`}
        />
        <TipRow
          icon="moon-outline"
          iconColor={colors.phase.luteal}
          label="Sleep"
          value={data.sleep}
        />
        <TipRow
          icon="water-outline"
          iconColor={colors.semantic.info}
          label="Hydration"
          value={data.hydration}
        />
        <TipRow
          icon="happy-outline"
          iconColor={colors.phase.ovulation}
          label="Stress Management"
          value={data.stressManagement}
        />
      </View>

      {/* Things to Avoid */}
      {data.thingsToAvoid.length > 0 && (
        <View style={styles.avoidSection}>
          <Text style={styles.avoidLabel}>THINGS TO AVOID</Text>
          <View style={styles.avoidList}>
            {data.thingsToAvoid.map((item) => (
              <View key={item} style={styles.avoidItem}>
                <Ionicons name="remove-circle-outline" size={14} color={colors.semantic.warning} />
                <Text style={styles.avoidText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.bodyBold, color: colors.text.primary },
  tipsContainer: { gap: spacing.base },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: { flex: 1 },
  tipLabel: { fontSize: 12, fontWeight: '600', color: colors.text.primary, textTransform: 'uppercase', letterSpacing: 0.3 },
  tipValue: { fontSize: 13, color: colors.text.secondary, marginTop: 2, lineHeight: 18 },
  avoidSection: { gap: spacing.sm },
  avoidLabel: { fontSize: 11, fontWeight: '600', color: colors.text.muted, letterSpacing: 0.5 },
  avoidList: { gap: 6 },
  avoidItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avoidText: { fontSize: 12, color: colors.text.secondary },
});