import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@src/constants/theme';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = 'days',
}: SliderProps) {
  const handleDecrement = () => onChange(Math.max(min, value - step));
  const handleIncrement = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={[styles.btn, value <= min && styles.btnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={[styles.btn, value >= max && styles.btnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.range}>
        <Text style={styles.rangeText}>{min}</Text>
        <Text style={styles.rangeText}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
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
  btn: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  btnText: { fontSize: 20, color: colors.primary[600], fontWeight: '700' },
  center: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '700', color: colors.secondary[900] },
  unit: { fontSize: 12, color: colors.secondary[400], marginTop: 2 },
  range: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 4 },
  rangeText: { fontSize: 12, color: colors.secondary[400] },
});