// ============================================================
// Velora — MoodSelector Component
// Multi-select mood grid with emoji icons.
// Based on ACOG mood symptoms (SR4) and DRSP categories (SR2).
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MoodType } from '@src/types';
import { MOOD_OPTIONS } from '@src/constants/symptoms';
import { colors } from '@src/constants/theme';

interface MoodSelectorProps {
  value: MoodType[];
  onChange: (moods: MoodType[]) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const toggleMood = (mood: MoodType) => {
    if (value.includes(mood)) {
      onChange(value.filter((m) => m !== mood));
    } else {
      onChange([...value, mood]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Mood</Text>
      <View style={styles.grid}>
        {MOOD_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => toggleMood(option.value)}
              activeOpacity={0.7}
              style={[
                styles.item,
                isSelected && {
                  backgroundColor: `${option.color}20`,
                  borderColor: option.color,
                },
              ]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  isSelected && { color: option.color, fontWeight: '600' },
                ]}
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
  wrapper: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    width: '22%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.secondary[50],
    minWidth: 72,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 11,
    color: colors.secondary[400],
    textAlign: 'center',
  },
});