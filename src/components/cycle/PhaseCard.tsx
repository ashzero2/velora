import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { Badge } from '@src/components/ui/Badge';
import { PHASE_COLORS, ENERGY_LEVELS } from '@src/constants/phases';
import { formatPhaseName } from '@src/utils/formatUtils';
import type { CyclePhaseInfo } from '@src/types';

interface PhaseCardProps {
  phaseInfo: CyclePhaseInfo;
}

/**
 * Card displaying current phase name, description, hormones, energy level,
 * and common symptoms list.
 */
export function PhaseCard({ phaseInfo }: PhaseCardProps) {
  const {
    phase,
    description,
    hormonalTrends,
    commonSymptoms,
    energyLevel,
  } = phaseInfo;

  const phaseColor = PHASE_COLORS[phase];
  const energy = ENERGY_LEVELS[energyLevel];

  return (
    <Card variant="elevated" className="gap-3">
      {/* Phase name + energy badge */}
      <View className="flex-row items-center justify-between">
        <Badge label={formatPhaseName(phase)} color={phaseColor} />
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flash" size={14} color={energy.color} />
          <Text className="text-xs font-medium" style={{ color: energy.color }}>
            {energy.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-sm text-secondary-700 leading-5">
        {description}
      </Text>

      {/* Hormonal trends */}
      <View className="gap-1">
        <Text className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
          Hormones
        </Text>
        <Text className="text-xs text-secondary-600 leading-4">
          {hormonalTrends}
        </Text>
      </View>

      {/* Common symptoms */}
      {commonSymptoms.length > 0 && (
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
            Common Symptoms
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {commonSymptoms.slice(0, 6).map((symptom) => (
              <View
                key={symptom}
                className="bg-secondary-100 rounded-full px-2.5 py-1"
              >
                <Text className="text-xs text-secondary-600">{symptom}</Text>
              </View>
            ))}
            {commonSymptoms.length > 6 && (
              <View className="bg-secondary-100 rounded-full px-2.5 py-1">
                <Text className="text-xs text-secondary-500">
                  +{commonSymptoms.length - 6} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </Card>
  );
}