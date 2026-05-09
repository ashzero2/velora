// ============================================================
// Velora — QuickLogCard Component
// Compact card for quick daily log from home dashboard.
// Shows mood emoji row and "Log more" link.
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { MoodType } from '@src/types';
import { MOOD_OPTIONS } from '@src/constants/symptoms';
import { colors, typography, spacing } from '@src/constants/theme';

interface QuickLogCardProps {
  selectedMoods: MoodType[];
  onMoodToggle: (mood: MoodType) => void;
  onLogMore: () => void;
  hasLoggedToday: boolean;
}

export function QuickLogCard({
  selectedMoods,
  onMoodToggle,
  onLogMore,
  hasLoggedToday,
}: QuickLogCardProps) {
  if (hasLoggedToday) {
    return (
      <Card style={styles.card}>
        <View style={styles.loggedRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
          <Text style={styles.loggedText}>Logged today</Text>
          <TouchableOpacity onPress={onLogMore} activeOpacity={0.7}>
            <Text style={styles.editLink}>Edit →</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>How are you today?</Text>
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selectedMoods.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onMoodToggle(option.value)}
              activeOpacity={0.7}
              style={[
                styles.moodItem,
                isSelected && { backgroundColor: `${option.color}25` },
              ]}
            >
              <Text style={styles.moodEmoji}>{option.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={onLogMore} activeOpacity={0.7} style={styles.logMoreRow}>
        <Text style={styles.logMoreText}>Log more details</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  moodEmoji: {
    fontSize: 22,
  },
  logMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logMoreText: {
    ...typography.caption,
    color: colors.primary[600],
    fontWeight: '500',
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loggedText: {
    ...typography.body,
    color: colors.primary[600],
    flex: 1,
  },
  editLink: {
    ...typography.caption,
    color: colors.primary[600],
    fontWeight: '500',
  },
});