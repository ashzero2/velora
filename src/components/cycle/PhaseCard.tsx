import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { Badge } from '@src/components/ui/Badge';
import { PHASE_COLORS, ENERGY_LEVELS } from '@src/constants/phases';
import { formatPhaseName } from '@src/utils/formatUtils';
import { colors } from '@src/constants/theme';
import type { CyclePhaseInfo } from '@src/types';

interface PhaseCardProps {
  phaseInfo: CyclePhaseInfo;
}

export function PhaseCard({ phaseInfo }: PhaseCardProps) {
  const { phase, description, hormonalTrends, commonSymptoms, energyLevel } = phaseInfo;
  const phaseColor = PHASE_COLORS[phase];
  const energy = ENERGY_LEVELS[energyLevel];

  return (
    <Card variant="elevated" style={{ gap: 12 }}>
      <View style={styles.header}>
        <Badge label={formatPhaseName(phase)} color={phaseColor} />
        <View style={styles.energyRow}>
          <Ionicons name="flash" size={14} color={energy.color} />
          <Text style={[styles.energyText, { color: energy.color }]}>{energy.label}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={{ gap: 4 }}>
        <Text style={styles.sectionTitle}>HORMONES</Text>
        <Text style={styles.sectionBody}>{hormonalTrends}</Text>
      </View>
      {commonSymptoms.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={styles.sectionTitle}>COMMON SYMPTOMS</Text>
          <View style={styles.symptomWrap}>
            {commonSymptoms.slice(0, 6).map((s) => (
              <View key={s} style={styles.symptomChip}>
                <Text style={styles.symptomText}>{s}</Text>
              </View>
            ))}
            {commonSymptoms.length > 6 && (
              <View style={styles.symptomChip}>
                <Text style={[styles.symptomText, { color: colors.secondary[500] }]}>+{commonSymptoms.length - 6} more</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  energyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  energyText: { fontSize: 12, fontWeight: '500' },
  description: { fontSize: 14, color: colors.secondary[700], lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: colors.secondary[500], letterSpacing: 0.5 },
  sectionBody: { fontSize: 12, color: colors.secondary[600], lineHeight: 16 },
  symptomWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptomChip: { backgroundColor: colors.secondary[100], borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 },
  symptomText: { fontSize: 12, color: colors.secondary[600] },
});