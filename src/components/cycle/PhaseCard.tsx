import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { PHASE_COLORS, ENERGY_LEVELS } from '@src/constants/phases';
import { formatPhaseName } from '@src/utils/formatUtils';
import { colors, spacing } from '@src/constants/theme';
import type { CyclePhaseInfo } from '@src/types';

// Symptom → icon mapping for visual display
const SYMPTOM_ICONS: Record<string, { icon: string; emoji: string }> = {
  'Cramps': { icon: 'flash-outline', emoji: '⚡' },
  'Fatigue': { icon: 'bed-outline', emoji: '😴' },
  'Headaches': { icon: 'pulse-outline', emoji: '🤕' },
  'Bloating': { icon: 'water-outline', emoji: '💧' },
  'Mood changes': { icon: 'happy-outline', emoji: '🎭' },
  'Mood swings': { icon: 'happy-outline', emoji: '🎭' },
  'Breast tenderness': { icon: 'heart-outline', emoji: '💗' },
  'Lower back pain': { icon: 'body-outline', emoji: '🔥' },
  'Increased energy': { icon: 'flash', emoji: '⚡' },
  'Improved mood': { icon: 'sunny-outline', emoji: '😊' },
  'Better concentration': { icon: 'bulb-outline', emoji: '💡' },
  'Clearer skin': { icon: 'sparkles-outline', emoji: '✨' },
  'Increased creativity': { icon: 'color-palette-outline', emoji: '🎨' },
  'Peak energy': { icon: 'flash', emoji: '🔥' },
  'Increased libido': { icon: 'heart', emoji: '❤️' },
  'Mild pelvic pain (mittelschmerz)': { icon: 'pulse-outline', emoji: '🫠' },
  'Clear, stretchy cervical mucus': { icon: 'water', emoji: '💧' },
  'Slight temperature rise': { icon: 'thermometer-outline', emoji: '🌡️' },
  'Heightened senses': { icon: 'eye-outline', emoji: '👁️' },
  'Food cravings': { icon: 'fast-food-outline', emoji: '🍫' },
  'Irritability': { icon: 'thunderstorm-outline', emoji: '😤' },
  'Acne': { icon: 'ellipse-outline', emoji: '😣' },
};

interface PhaseCardProps {
  phaseInfo: CyclePhaseInfo;
}

export function PhaseCard({ phaseInfo }: PhaseCardProps) {
  const { phase, dayInPhase, totalPhaseDays, commonSymptoms, energyLevel } = phaseInfo;
  const phaseColor = PHASE_COLORS[phase];
  const energy = ENERGY_LEVELS[energyLevel];
  const phaseName = formatPhaseName(phase);

  // Energy bar progress (0-1)
  const energyProgress = energyLevel === 'low' ? 0.2 : energyLevel === 'rising' ? 0.5 : energyLevel === 'peak' ? 1.0 : 0.6;

  // Phase progress
  const phaseProgress = totalPhaseDays > 0 ? dayInPhase / totalPhaseDays : 0;

  // Top 4 symptoms with icons
  const topSymptoms = commonSymptoms.slice(0, 4).map((s) => ({
    name: s,
    ...(SYMPTOM_ICONS[s] ?? { icon: 'ellipse-outline', emoji: '•' }),
  }));

  return (
    <Card variant="elevated" style={styles.card}>
      {/* Phase name + progress */}
      <View style={styles.topRow}>
        <View style={[styles.phaseIndicator, { backgroundColor: phaseColor }]} />
        <Text style={[styles.phaseName, { color: phaseColor }]}>{phaseName}</Text>
        {totalPhaseDays > 0 && (
          <Text style={styles.phaseDay}>Day {dayInPhase}/{totalPhaseDays}</Text>
        )}
      </View>

      {/* Phase progress bar */}
      {totalPhaseDays > 0 && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(phaseProgress * 100, 100)}%`, backgroundColor: phaseColor }]} />
        </View>
      )}

      {/* Energy bar */}
      <View style={styles.energySection}>
        <View style={styles.energyLabelRow}>
          <Ionicons name="flash" size={14} color={energy.color} />
          <Text style={[styles.energyLabel, { color: energy.color }]}>{energy.label}</Text>
        </View>
        <View style={styles.energyBarBg}>
          <View style={[styles.energyBarFill, { width: `${energyProgress * 100}%`, backgroundColor: energy.color }]} />
        </View>
      </View>

      {/* Symptom icons */}
      {topSymptoms.length > 0 && (
        <View style={styles.symptomsRow}>
          {topSymptoms.map((s) => (
            <View key={s.name} style={styles.symptomItem}>
              <Text style={styles.symptomEmoji}>{s.emoji}</Text>
              <Text style={styles.symptomName} numberOfLines={1}>{s.name}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  phaseDay: {
    fontSize: 12,
    color: colors.secondary[400],
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.secondary[100],
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  energySection: {
    gap: 4,
  },
  energyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  energyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  energyBarBg: {
    height: 6,
    backgroundColor: colors.secondary[100],
    borderRadius: 3,
  },
  energyBarFill: {
    height: 6,
    borderRadius: 3,
  },
  symptomsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 2,
  },
  symptomItem: {
    alignItems: 'center',
    width: 56,
    gap: 3,
  },
  symptomEmoji: {
    fontSize: 22,
  },
  symptomName: {
    fontSize: 9,
    color: colors.secondary[500],
    textAlign: 'center',
    lineHeight: 12,
  },
});