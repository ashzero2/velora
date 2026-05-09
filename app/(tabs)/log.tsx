// ============================================================
// Velora — Daily Log Screen
// Full logging form with date navigation, flow, mood, symptoms,
// cervical mucus, biometrics, medication, and notes.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@src/hooks/useDatabase';
import { useLogStore, createBlankLog } from '@src/stores/useLogStore';
import { useCycleStore } from '@src/stores/useCycleStore';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { FlowSelector } from '@src/components/log/FlowSelector';
import { MoodSelector } from '@src/components/log/MoodSelector';
import { SymptomGrid } from '@src/components/log/SymptomGrid';
import { SeveritySlider } from '@src/components/log/SeveritySlider';
import { Card } from '@src/components/ui/Card';
import { Button } from '@src/components/ui/Button';
import { CERVICAL_MUCUS_OPTIONS } from '@src/constants/symptoms';
import { today, addDays, subDays, formatDisplayDate, nowISO } from '@src/utils/dateUtils';
import { generateId } from '@src/utils/idUtils';
import type { DailyLog, FlowIntensity, MoodType, CervicalMucusType } from '@src/types';
import { Severity } from '@src/types';
import { colors, typography, spacing } from '@src/constants/theme';

export default function LogScreen() {
  const db = useDatabase();
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const settings = useSettingsStore((s) => s.settings);
  const loadLogForDate = useLogStore((s) => s.loadLogForDate);
  const upsertLog = useLogStore((s) => s.upsertLog);
  const recentLogs = useLogStore((s) => s.recentLogs);
  const initLog = useLogStore((s) => s.initialize);
  const isLoading = useLogStore((s) => s.isLoading);

  const [selectedDate, setSelectedDate] = useState(today());
  const [log, setLog] = useState<DailyLog>(
    createBlankLog(today(), currentCycle?.id ?? null),
  );
  const [isSaved, setIsSaved] = useState(false);

  // Load log for selected date
  const loadDate = useCallback(async (date: string) => {
    const existing = await loadLogForDate(db, date);
    if (existing) {
      setLog(existing);
    } else {
      setLog(createBlankLog(date, currentCycle?.id ?? null));
    }
    setIsSaved(false);
  }, [db, loadLogForDate, currentCycle]);

  // Initialize log store to load recent logs
  useEffect(() => {
    initLog(db);
  }, [db, initLog]);

  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  // Date navigation
  const goToPreviousDay = () => {
    setSelectedDate((d) => subDays(d, 1));
  };
  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (next <= today()) {
      setSelectedDate(next);
    }
  };
  const goToToday = () => setSelectedDate(today());

  const isToday = selectedDate === today();
  const canGoForward = !isToday;

  // Update helpers
  const updateField = <K extends keyof DailyLog>(field: K, value: DailyLog[K]) => {
    setLog((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  // Save
  const handleSave = async () => {
    try {
      await upsertLog(db, { ...log, updatedAt: nowISO() });
      setIsSaved(true);
    } catch {
      Alert.alert('Error', 'Failed to save log. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date Navigation Header */}
        <View style={styles.dateHeader}>
          <TouchableOpacity onPress={goToPreviousDay} activeOpacity={0.7} style={styles.dateArrow}>
            <Ionicons name="chevron-back" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
            <Text style={styles.dateText}>
              {isToday ? 'Today' : formatDisplayDate(selectedDate, true)}
            </Text>
            {!isToday && <Text style={styles.dateSubtext}>Tap for today</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNextDay}
            activeOpacity={0.7}
            style={[styles.dateArrow, !canGoForward && { opacity: 0.3 }]}
            disabled={!canGoForward}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Flow */}
        <Card style={styles.section}>
          <FlowSelector
            value={log.flow}
            onChange={(flow: FlowIntensity) => updateField('flow', flow)}
          />
        </Card>

        {/* Mood */}
        <Card style={styles.section}>
          <MoodSelector
            value={log.mood}
            onChange={(moods: MoodType[]) => updateField('mood', moods)}
          />
        </Card>

        {/* Symptoms */}
        <Card style={styles.section}>
          <SymptomGrid
            values={{
              crampsSeverity: log.crampsSeverity,
              headacheSeverity: log.headacheSeverity,
              acneSeverity: log.acneSeverity,
              bloatingSeverity: log.bloatingSeverity,
              backPainSeverity: log.backPainSeverity,
              breastTendernessSeverity: log.breastTendernessSeverity,
            }}
            onChange={(field, severity) => updateField(field as keyof DailyLog, severity as any)}
          />
        </Card>

        {/* Cervical Mucus (fertility tracking only) */}
        {settings.fertilityTrackingEnabled && (
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Cervical Mucus</Text>
            <View style={styles.mucusRow}>
              {CERVICAL_MUCUS_OPTIONS.map((option) => {
                const isSelected = log.discharge === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateField('discharge', isSelected ? null : option.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.mucusChip,
                      isSelected && styles.mucusChipSelected,
                    ]}
                  >
                    <Text style={[styles.mucusLabel, isSelected && styles.mucusLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.mucusDesc, isSelected && styles.mucusDescSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        {/* Libido */}
        <Card style={styles.section}>
          <SeveritySlider
            label="Libido"
            value={log.libido}
            onChange={(severity) => updateField('libido', severity)}
          />
        </Card>

        {/* Biometrics */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Biometrics</Text>
          <View style={styles.biometricsGrid}>
            <BiometricInput
              label="Sleep"
              unit="hrs"
              value={log.sleepHours}
              onChange={(v) => updateField('sleepHours', v)}
              keyboardType="decimal-pad"
            />
            <BiometricInput
              label="Exercise"
              unit="min"
              value={log.exerciseMinutes}
              onChange={(v) => updateField('exerciseMinutes', v ? Math.round(v) : null)}
              keyboardType="number-pad"
            />
            <BiometricInput
              label="Water"
              unit={settings.waterUnit}
              value={log.waterIntakeMl}
              onChange={(v) => updateField('waterIntakeMl', v ? Math.round(v) : null)}
              keyboardType="number-pad"
            />
            <BiometricInput
              label="Body Temp"
              unit={settings.temperatureUnit === 'celsius' ? '°C' : '°F'}
              value={log.bodyTemperature}
              onChange={(v) => updateField('bodyTemperature', v)}
              keyboardType="decimal-pad"
            />
            <BiometricInput
              label="BBT"
              unit={settings.temperatureUnit === 'celsius' ? '°C' : '°F'}
              value={log.basalBodyTemperature}
              onChange={(v) => updateField('basalBodyTemperature', v)}
              keyboardType="decimal-pad"
            />
            <BiometricInput
              label="Weight"
              unit={settings.weightUnit}
              value={log.weight}
              onChange={(v) => updateField('weight', v)}
              keyboardType="decimal-pad"
            />
          </View>
        </Card>

        {/* Medication */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Medication</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Ibuprofen, Birth control"
            placeholderTextColor={colors.secondary[400]}
            value={log.medication.join(', ')}
            onChangeText={(text) => {
              const meds = text.split(',').map((s) => s.trim()).filter(Boolean);
              updateField('medication', meds);
            }}
          />
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            placeholder="Any additional notes..."
            placeholderTextColor={colors.secondary[400]}
            value={log.notes}
            onChangeText={(text) => updateField('notes', text)}
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Save Button */}
        <Button
          title={isSaved ? '✓ Saved' : 'Save Log'}
          onPress={handleSave}
          variant={isSaved ? 'secondary' : 'primary'}
          fullWidth
          loading={isLoading}
        />

        {/* Recent Logs History */}
        <RecentLogsSection
          recentLogs={recentLogs}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Recent Logs Section ─────────────────────────────────────

import { MOOD_OPTIONS } from '@src/constants/symptoms';
import { SEVERITY_LABELS } from '@src/constants/symptoms';

function RecentLogsSection({
  recentLogs,
  selectedDate,
  onSelectDate,
}: {
  recentLogs: DailyLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  if (recentLogs.length === 0) return null;

  // Sort by date descending for display
  const sortedLogs = [...recentLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={recentStyles.container}>
      <Text style={recentStyles.title}>Recent Logs</Text>
      <View style={recentStyles.list}>
        {sortedLogs.map((logItem) => {
          const isActive = logItem.date === selectedDate;
          const moodEmojis = logItem.mood
            .map((m) => MOOD_OPTIONS.find((o) => o.value === m)?.emoji)
            .filter(Boolean)
            .join(' ');

          const hasSymptoms = [
            logItem.crampsSeverity,
            logItem.headacheSeverity,
            logItem.acneSeverity,
            logItem.bloatingSeverity,
            logItem.backPainSeverity,
            logItem.breastTendernessSeverity,
          ].some((s) => s > 0);

          return (
            <TouchableOpacity
              key={logItem.date}
              onPress={() => onSelectDate(logItem.date)}
              activeOpacity={0.7}
              style={[recentStyles.logRow, isActive && recentStyles.logRowActive]}
            >
              <View style={recentStyles.logDateCol}>
                <Text style={[recentStyles.logDate, isActive && recentStyles.logDateActive]}>
                  {logItem.date === today() ? 'Today' : formatDisplayDate(logItem.date)}
                </Text>
              </View>
              <View style={recentStyles.logDetails}>
                {moodEmojis ? (
                  <Text style={recentStyles.logMoods}>{moodEmojis}</Text>
                ) : null}
                {logItem.flow && (
                  <View style={recentStyles.flowBadge}>
                    <Ionicons name="water" size={10} color={colors.phase.menstruation} />
                  </View>
                )}
                {hasSymptoms && (
                  <Ionicons name="pulse-outline" size={14} color={colors.accent[500]} />
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.secondary[300]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const recentStyles = StyleSheet.create({
  container: { marginTop: 8, gap: 8 },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  list: { gap: 4 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  logRowActive: {
    borderColor: colors.primary[500],
    backgroundColor: `${colors.primary[500]}08`,
  },
  logDateCol: { width: 70 },
  logDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  logDateActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  logDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logMoods: { fontSize: 16 },
  flowBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${colors.phase.menstruation}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Biometric Input Helper ──────────────────────────────────

function BiometricInput({
  label,
  unit,
  value,
  onChange,
  keyboardType = 'decimal-pad',
}: {
  label: string;
  unit: string;
  value: number | null;
  onChange: (value: number | null) => void;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.bioItem}>
      <Text style={styles.bioLabel}>{label}</Text>
      <View style={styles.bioInputRow}>
        <TextInput
          style={styles.bioInput}
          keyboardType={keyboardType}
          value={value !== null ? String(value) : ''}
          onChangeText={(text) => {
            if (text === '') {
              onChange(null);
            } else {
              const num = parseFloat(text);
              if (!isNaN(num)) onChange(num);
            }
          }}
          placeholder="—"
          placeholderTextColor={colors.secondary[300]}
        />
        <Text style={styles.bioUnit}>{unit}</Text>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  dateArrow: { padding: 8 },
  dateText: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  dateSubtext: {
    fontSize: 12,
    color: colors.primary[600],
    textAlign: 'center',
  },
  section: { gap: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  mucusRow: { gap: 6 },
  mucusChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.secondary[50],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  mucusChipSelected: {
    backgroundColor: `${colors.phase.fertile}15`,
    borderColor: colors.phase.fertile,
  },
  mucusLabel: { fontSize: 13, fontWeight: '500', color: colors.secondary[600] },
  mucusLabelSelected: { color: colors.phase.fertile },
  mucusDesc: { fontSize: 11, color: colors.secondary[400], marginTop: 2 },
  mucusDescSelected: { color: colors.phase.fertile },
  biometricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bioItem: {
    width: '47%',
    flexGrow: 1,
  },
  bioLabel: { fontSize: 12, color: colors.secondary[500], marginBottom: 4 },
  bioInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 0,
  },
  bioUnit: { fontSize: 12, color: colors.secondary[400], marginLeft: 4 },
  textInput: {
    backgroundColor: colors.secondary[50],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
