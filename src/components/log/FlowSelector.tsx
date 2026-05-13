import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlowIntensity } from '@src/types';
import { formatFlowIntensity } from '@src/utils/formatUtils';
import { colors } from '@src/constants/theme';

interface FlowSelectorProps {
  value: FlowIntensity | null;
  onChange: (flow: FlowIntensity) => void;
  compact?: boolean;
}

const FLOW_OPTIONS: { value: FlowIntensity; iconSize: number; opacity: number }[] = [
  { value: FlowIntensity.SPOTTING, iconSize: 16, opacity: 0.4 },
  { value: FlowIntensity.LIGHT, iconSize: 20, opacity: 0.55 },
  { value: FlowIntensity.MEDIUM, iconSize: 24, opacity: 0.7 },
  { value: FlowIntensity.HEAVY, iconSize: 28, opacity: 0.85 },
  { value: FlowIntensity.VERY_HEAVY, iconSize: 32, opacity: 1.0 },
];

export function FlowSelector({ value, onChange, compact = false }: FlowSelectorProps) {
  if (compact) {
    return (
      <View style={styles.compactRow}>
        {FLOW_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              style={[styles.compactOption, isSelected && styles.compactOptionSelected]}
            >
              <Ionicons
                name="water"
                size={option.iconSize * 0.75}
                color={isSelected ? '#c97b7b' : '#a8a29e'}
                style={{ opacity: isSelected ? 1 : option.opacity }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>Flow Intensity</Text>
      <View style={styles.row}>
        {FLOW_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              style={[styles.option, isSelected ? styles.optionSelected : styles.optionDefault]}
            >
              <Ionicons
                name="water"
                size={option.iconSize}
                color={isSelected ? '#c97b7b' : '#a8a29e'}
                style={{ opacity: isSelected ? 1 : option.opacity }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 2,
  },
  optionDefault: { backgroundColor: colors.secondary[50], borderColor: 'transparent' },
  optionSelected: { backgroundColor: 'rgba(201,123,123,0.15)', borderColor: '#c97b7b' },
  optionText: { fontSize: 11, marginTop: 4, color: colors.secondary[400] },
  optionTextSelected: { color: '#c97b7b', fontWeight: '600' },
  compactRow: { flexDirection: 'row', gap: 6 },
  compactOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary[50],
  },
  compactOptionSelected: {
    backgroundColor: 'rgba(201,123,123,0.15)',
    borderWidth: 2,
    borderColor: '#c97b7b',
  },
});
