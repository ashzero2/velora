import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlowIntensity } from '@src/types';
import { formatFlowIntensity } from '@src/utils/formatUtils';

interface FlowSelectorProps {
  value: FlowIntensity | null;
  onChange: (flow: FlowIntensity) => void;
}

const FLOW_OPTIONS: {
  value: FlowIntensity;
  iconSize: number;
  opacity: number;
}[] = [
  { value: FlowIntensity.SPOTTING, iconSize: 16, opacity: 0.4 },
  { value: FlowIntensity.LIGHT, iconSize: 20, opacity: 0.55 },
  { value: FlowIntensity.MEDIUM, iconSize: 24, opacity: 0.7 },
  { value: FlowIntensity.HEAVY, iconSize: 28, opacity: 0.85 },
  { value: FlowIntensity.VERY_HEAVY, iconSize: 32, opacity: 1.0 },
];

/**
 * Flow intensity selector with droplet icons of increasing size/opacity.
 * 5 selectable options from spotting to very heavy.
 */
export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-secondary-600">
        Flow Intensity
      </Text>
      <View className="flex-row justify-between">
        {FLOW_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              className={`
                items-center justify-center py-3 px-2 rounded-xl flex-1 mx-0.5
                ${isSelected ? 'bg-menstruation/15 border-2 border-menstruation' : 'bg-secondary-50 border-2 border-transparent'}
              `}
            >
              <Ionicons
                name="water"
                size={option.iconSize}
                color={isSelected ? '#c97b7b' : '#a8a29e'}
                style={{ opacity: isSelected ? 1 : option.opacity }}
              />
              <Text
                className={`text-xs mt-1 ${isSelected ? 'text-menstruation font-semibold' : 'text-secondary-400'}`}
              >
                {formatFlowIntensity(option.value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}