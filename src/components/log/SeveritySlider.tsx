// ============================================================
// Velora — SeveritySlider Component
// Horizontal 5-option severity selector (None → Very Severe)
// Based on DRSP severity scale (SR2)
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Severity } from '@src/types';
import { SEVERITY_OPTIONS } from '@src/constants/symptoms';
import { colors } from '@src/constants/theme';

interface SeveritySliderProps {
  value: Severity;
  onChange: (severity: Severity) => void;
  label?: string;
}

export function SeveritySlider({ value, onChange, label }: SeveritySliderProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {SEVERITY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              style={[
                styles.pill,
                isSelected && { backgroundColor: `${option.color}25`, borderColor: option.color },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: isSelected ? option.color : colors.secondary[200] }]} />
              <Text
                style={[
                  styles.pillText,
                  isSelected && { color: option.color, fontWeight: '600' },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  row: { flexDirection: 'row', gap: 4 },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.secondary[50],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  pillText: {
    fontSize: 10,
    color: colors.secondary[400],
    textAlign: 'center',
  },
});