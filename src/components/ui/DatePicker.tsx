import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { formatDisplayDate } from '@src/utils/dateUtils';

interface DatePickerProps {
  value: string; // ISO YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  maxDate?: string;
  minDate?: string;
}

/**
 * Simple date picker component.
 * On native, uses a text-based date input with increment/decrement.
 * For a production app, this would wrap @react-native-community/datetimepicker.
 */
export function DatePicker({
  value,
  onChange,
  label,
  maxDate,
  minDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDayChange = (delta: number) => {
    const current = new Date(value + 'T00:00:00');
    current.setDate(current.getDate() + delta);
    const newDate = current.toISOString().split('T')[0];

    if (maxDate && newDate > maxDate) return;
    if (minDate && newDate < minDate) return;

    onChange(newDate);
  };

  if (Platform.OS === 'web') {
    return (
      <View className="gap-1">
        {label && (
          <Text className="text-sm font-medium text-secondary-600 mb-1">
            {label}
          </Text>
        )}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={maxDate}
          min={minDate}
          style={{
            fontSize: 16,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #d6d3d1',
            backgroundColor: '#ffffff',
            color: '#1c1917',
            width: '100%',
          }}
        />
      </View>
    );
  }

  return (
    <View className="gap-1">
      {label && (
        <Text className="text-sm font-medium text-secondary-600 mb-1">
          {label}
        </Text>
      )}
      <View className="flex-row items-center bg-white rounded-button border border-secondary-200 overflow-hidden">
        <TouchableOpacity
          onPress={() => handleDayChange(-1)}
          className="px-4 py-3 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-lg text-primary-600 font-bold">−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPicker(!showPicker)}
          className="flex-1 py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-base text-secondary-900 font-medium">
            {formatDisplayDate(value, true)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDayChange(1)}
          className="px-4 py-3 items-center justify-center"
          activeOpacity={0.7}
        >
          <Text className="text-lg text-primary-600 font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}