import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
}

/**
 * Numeric value selector with increment/decrement buttons.
 * Displays current value prominently.
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = 'days',
}: SliderProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-secondary-600 mb-1">
          {label}
        </Text>
      )}
      <View className="flex-row items-center bg-white rounded-button border border-secondary-200 overflow-hidden">
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          className={`px-5 py-3 items-center justify-center ${value <= min ? 'opacity-30' : ''}`}
          activeOpacity={0.7}
        >
          <Text className="text-xl text-primary-600 font-bold">−</Text>
        </TouchableOpacity>

        <View className="flex-1 py-3 items-center">
          <Text className="text-xl font-bold text-secondary-900">{value}</Text>
          <Text className="text-xs text-secondary-400 mt-0.5">{unit}</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          className={`px-5 py-3 items-center justify-center ${value >= max ? 'opacity-30' : ''}`}
          activeOpacity={0.7}
        >
          <Text className="text-xl text-primary-600 font-bold">+</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between px-1 mt-1">
        <Text className="text-xs text-secondary-400">{min}</Text>
        <Text className="text-xs text-secondary-400">{max}</Text>
      </View>
    </View>
  );
}