import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { formatDisplayDate } from '@src/utils/dateUtils';
import { colors } from '@src/constants/theme';

interface DatePickerProps {
  value: string; // ISO YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  maxDate?: string;
  minDate?: string;
}

/** Format a Date object to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString) */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePicker({ value, onChange, label, maxDate, minDate }: DatePickerProps) {
  const handleDayChange = (delta: number) => {
    const current = new Date(value + 'T12:00:00'); // noon to avoid DST edge cases
    current.setDate(current.getDate() + delta);
    const newDate = toLocalDateStr(current);
    if (maxDate && newDate > maxDate) return;
    if (minDate && newDate < minDate) return;
    onChange(newDate);
  };

  const canGoBack = !minDate || value > minDate;
  const canGoForward = !maxDate || value < maxDate;

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
            fontSize: 16, padding: 12, borderRadius: 12,
            border: '1px solid #d6d3d1', backgroundColor: '#ffffff',
            color: '#1c1917', width: '100%',
          }}
        />
      </View>
    );
  }

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      {/* Main date row with ±1 day */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => handleDayChange(-1)}
          disabled={!canGoBack}
          style={[styles.btn, !canGoBack && styles.btnDisabled]}
          activeOpacity={0.6}
        >
          <Text style={styles.btnText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          <Text style={styles.dateText}>{formatDisplayDate(value, true)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDayChange(1)}
          disabled={!canGoForward}
          style={[styles.btn, !canGoForward && styles.btnDisabled]}
          activeOpacity={0.6}
        >
          <Text style={styles.btnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Quick jump row: ±7 days, ±30 days */}
      <View style={styles.jumpRow}>
        <TouchableOpacity onPress={() => handleDayChange(-30)} style={styles.jumpBtn} activeOpacity={0.6}>
          <Text style={styles.jumpText}>−30d</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDayChange(-7)} style={styles.jumpBtn} activeOpacity={0.6}>
          <Text style={styles.jumpText}>−7d</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDayChange(7)} style={styles.jumpBtn} activeOpacity={0.6}>
          <Text style={styles.jumpText}>+7d</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDayChange(30)} style={styles.jumpBtn} activeOpacity={0.6}>
          <Text style={styles.jumpText}>+30d</Text>
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
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  btnDisabled: { opacity: 0.3 },
  btnText: { fontSize: 24, color: colors.primary[600], fontWeight: '700' },
  center: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  dateText: { fontSize: 16, color: colors.secondary[900], fontWeight: '600' },
  jumpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  jumpBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.secondary[100],
  },
  jumpText: { fontSize: 13, color: colors.secondary[600], fontWeight: '500' },
});