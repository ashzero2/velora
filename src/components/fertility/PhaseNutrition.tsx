import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { CyclePhase } from '@src/types';
import { PHASE_NUTRITION } from '@src/constants/nutrition';
import { PHASE_COLORS, PHASE_DISPLAY_NAMES } from '@src/constants/phases';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';

interface PhaseNutritionProps {
  currentPhase: CyclePhase;
}

export function PhaseNutrition({ currentPhase }: PhaseNutritionProps) {
  const data = PHASE_NUTRITION[currentPhase] ?? PHASE_NUTRITION[CyclePhase.UNKNOWN];
  const phaseColor = PHASE_COLORS[currentPhase] ?? PHASE_COLORS[CyclePhase.UNKNOWN];
  const phaseName = PHASE_DISPLAY_NAMES[currentPhase] ?? 'Unknown';

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="nutrition-outline" size={18} color={phaseColor} />
        <Text style={styles.title}>Nutrition for {phaseName} Phase</Text>
      </View>

      {/* Key Nutrients */}
      <View style={styles.nutrientRow}>
        {data.nutrients.map((nutrient) => (
          <View key={nutrient} style={[styles.nutrientPill, { backgroundColor: `${phaseColor}15` }]}>
            <Text style={[styles.nutrientText, { color: phaseColor }]}>{nutrient}</Text>
          </View>
        ))}
      </View>

      {/* Tip */}
      <View style={[styles.tipBox, { backgroundColor: `${phaseColor}08` }]}>
        <Ionicons name="bulb-outline" size={14} color={phaseColor} />
        <Text style={styles.tipText}>{data.tip}</Text>
      </View>

      {/* Recommended Foods */}
      <Text style={styles.sectionLabel}>RECOMMENDED FOODS</Text>
      <View style={styles.foodGrid}>
        {data.recommendedFoods.map((food) => (
          <View key={food.name} style={styles.foodItem}>
            <Text style={styles.foodEmoji}>{food.emoji}</Text>
            <View style={styles.foodTextWrap}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodDesc} numberOfLines={2}>{food.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Foods to Avoid */}
      {data.foodsToAvoid.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>LIMIT OR AVOID</Text>
          <View style={styles.avoidList}>
            {data.foodsToAvoid.map((item) => (
              <View key={item.name} style={styles.avoidItem}>
                <Ionicons name="close-circle" size={14} color={colors.semantic.error} />
                <View style={styles.avoidTextWrap}>
                  <Text style={styles.avoidName}>{item.name}</Text>
                  <Text style={styles.avoidReason}>{item.reason}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.bodyBold, color: colors.text.primary },
  nutrientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  nutrientPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  nutrientText: { fontSize: 12, fontWeight: '600' },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  tipText: { ...typography.small, color: colors.text.secondary, flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  foodGrid: { gap: spacing.sm },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  foodEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  foodTextWrap: { flex: 1 },
  foodName: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  foodDesc: { fontSize: 11, color: colors.text.muted, marginTop: 1 },
  avoidList: { gap: spacing.sm },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  avoidTextWrap: { flex: 1 },
  avoidName: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  avoidReason: { fontSize: 11, color: colors.text.muted, marginTop: 1 },
});