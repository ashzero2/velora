import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { FERTILITY_SUPERFOODS, KEY_SUPPLEMENTS } from '@src/constants/nutrition';
import { colors, typography, spacing, borderRadius } from '@src/constants/theme';

export function FertilityFoods() {
  return (
    <View style={styles.wrapper}>
      {/* Superfoods */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="heart-outline" size={18} color={colors.phase.fertile} />
          <Text style={styles.title}>Fertility Superfoods</Text>
        </View>
        <Text style={styles.subtitle}>Top foods to support reproductive health</Text>

        <View style={styles.foodList}>
          {FERTILITY_SUPERFOODS.map((food) => (
            <View key={food.name} style={styles.foodItem}>
              <Text style={styles.foodEmoji}>{food.emoji}</Text>
              <View style={styles.foodContent}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodBenefit} numberOfLines={2}>{food.benefit}</Text>
                <View style={styles.nutrientTags}>
                  {food.nutrients.map((n) => (
                    <View key={n} style={styles.nutrientTag}>
                      <Text style={styles.nutrientTagText}>{n}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Supplements */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="medical-outline" size={18} color={colors.semantic.info} />
          <Text style={styles.title}>Key Supplements</Text>
        </View>
        <Text style={styles.subtitle}>Consider discussing these with your doctor</Text>

        <View style={styles.suppList}>
          {KEY_SUPPLEMENTS.map((supp) => (
            <View key={supp.name} style={styles.suppItem}>
              <View style={styles.suppHeader}>
                <Text style={styles.suppName}>{supp.name}</Text>
                <Text style={styles.suppDosage}>{supp.dosage}</Text>
              </View>
              <Text style={styles.suppBenefit}>{supp.benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={colors.text.muted} />
          <Text style={styles.disclaimerText}>
            Always consult your healthcare provider before starting supplements.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.base },
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.bodyBold, color: colors.text.primary },
  subtitle: { ...typography.small, color: colors.text.muted, marginTop: -4 },
  foodList: { gap: spacing.md },
  foodItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  foodEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  foodContent: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  foodBenefit: { fontSize: 12, color: colors.text.secondary, marginTop: 2, lineHeight: 16 },
  nutrientTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  nutrientTag: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nutrientTagText: { fontSize: 10, color: colors.text.secondary, fontWeight: '500' },
  suppList: { gap: spacing.sm },
  suppItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondary[100],
  },
  suppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suppName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  suppDosage: { fontSize: 11, color: colors.semantic.info, fontWeight: '500' },
  suppBenefit: { fontSize: 12, color: colors.text.secondary, marginTop: 4, lineHeight: 16 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: spacing.sm,
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.sm,
  },
  disclaimerText: { fontSize: 11, color: colors.text.muted, flex: 1, lineHeight: 16 },
});