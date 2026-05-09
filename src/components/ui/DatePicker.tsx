import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { formatDisplayDate } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  maxDate?: string;
  minDate?: string;
}

export function DatePicker({ value, onChange, label, maxDate, minDate }: DatePickerProps) {
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
      <View>
        {label && <Text style={styles.label}>{label}</Text>}
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
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => handleDayChange(-1)} style={styles.btn} activeOpacity={0.7}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.center} activeOpacity={0.7}>
          <Text style={styles.dateText}>{formatDisplayDate(value, true)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDayChange(1)} style={styles.btn} activeOpacity={0.7}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', color: colors.secondary[600], marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary[200],
    overflow: 'hidden',
  },
  btn: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 18, color: colors.primary[600], fontWeight: '700' },
  center: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  dateText: { fontSize: 16, color: colors.secondary[900], fontWeight: '500' },
});