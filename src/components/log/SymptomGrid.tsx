// ============================================================
// Velora — SymptomGrid Component
// Grid of trackable symptoms with inline severity sliders.
// Uses SYMPTOM_CATEGORIES from constants (SR1, SR2).
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Severity } from '@src/types';
import { SYMPTOM_CATEGORIES } from '@src/constants/symptoms';
import { SeveritySlider } from '@src/components/log/SeveritySlider';
import { colors } from '@src/constants/theme';

interface SymptomValues {
  crampsSeverity: Severity;
  headacheSeverity: Severity;
  acneSeverity: Severity;
  bloatingSeverity: Severity;
  backPainSeverity: Severity;
  breastTendernessSeverity: Severity;
}

interface SymptomGridProps {
  values: SymptomValues;
  onChange: (field: string, severity: Severity) => void;
}

export function SymptomGrid({ values, onChange }: SymptomGridProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>Symptoms</Text>
      <View style={styles.list}>
        {SYMPTOM_CATEGORIES.map((symptom) => (
          <View key={symptom.key} style={styles.row}>
            <View style={styles.labelRow}>
              <Ionicons
                name={symptom.icon as any}
                size={16}
                color={colors.secondary[500]}
              />
              <Text style={styles.symptomLabel}>{symptom.label}</Text>
            </View>
            <SeveritySlider
              value={(values as any)[symptom.severityField] ?? Severity.NONE}
              onChange={(severity) => onChange(symptom.severityField, severity)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  list: { gap: 16 },
  row: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  symptomLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.secondary[700],
  },
});