// ============================================================
// Velora — Daily Log Screen
// History feed with log cards + Modal for creating/editing logs.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Modal,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
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
import { CERVICAL_MUCUS_OPTIONS, MOOD_OPTIONS } from '@src/constants/symptoms';
import { today, subDays, formatDisplayDate, nowISO } from '@src/utils/dateUtils';
import type { DailyLog, FlowIntensity, MoodType } from '@src/types';
import { Severity } from '@src/types';
import { colors, typography, spacing } from '@src/constants/theme';
import { formatFlowIntensity } from '@src/utils/formatUtils';
import { SEVERITY_LABELS } from '@src/constants/symptoms';

export default function LogScreen() {
  const db = useDatabase();
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const settings = useSettingsStore((s) => s.settings);
  const todayLog = useLogStore((s) => s.todayLog);
  const recentLogs = useLogStore((s) => s.recentLogs);
  const loadLogForDate = useLogStore((s) => s.loadLogForDate);
  const upsertLog = useLogStore((s) => s.upsertLog);
  const initLog = useLogStore((s) => s.initialize);
  const isLoading = useLogStore((s) => s.isLoading);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  useEffect(() => { initLog(db); }, [db, initLog]);

  // Open modal to add/edit a log
  const openLogModal = useCallback(async (date: string) => {
    const existing = await loadLogForDate(db, date);
    setEditingLog(existing ?? createBlankLog(date, currentCycle?.id ?? null));
    setModalVisible(true);
  }, [db, loadLogForDate, currentCycle]);

  const closeModal = () => { setModalVisible(false); setEditingLog(null); };

  const handleSave = async () => {
    if (!editingLog) return;
    try {
      await upsertLog(db, { ...editingLog, updatedAt: nowISO() });
      closeModal();
    } catch {
      Alert.alert('Error', 'Failed to save log.');
    }
  };

  const updateField = <K extends keyof DailyLog>(field: K, value: DailyLog[K]) => {
    setEditingLog((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // Sort recent logs newest first
  const sortedLogs = [...recentLogs].sort((a, b) => b.date.localeCompare(a.date));
  const hasLoggedToday = todayLog !== null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Main: History Feed ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Daily Log</Text>
        </View>

        {/* Today CTA */}
        <TouchableOpacity
          onPress={() => openLogModal(today())}
          activeOpacity={0.7}
          style={[styles.todayCard, hasLoggedToday && styles.todayCardLogged]}
        >
          <View style={styles.todayLeft}>
            <Ionicons
              name={hasLoggedToday ? 'checkmark-circle' : 'add-circle'}
              size={28}
              color={hasLoggedToday ? colors.primary[500] : colors.primary[600]}
            />
            <View>
              <Text style={styles.todayTitle}>
                {hasLoggedToday ? 'Today — Logged' : 'Log Today'}
              </Text>
              {hasLoggedToday && todayLog && (
                <Text style={styles.todaySubtext}>
                  {todayLog.mood.map((m) => MOOD_OPTIONS.find((o) => o.value === m)?.emoji).filter(Boolean).join(' ')}
                  {todayLog.flow ? ` · ${formatFlowIntensity(todayLog.flow)}` : ''}
                </Text>
              )}
              {!hasLoggedToday && (
                <Text style={styles.todaySubtext}>Tap to record your day</Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary[400]} />
        </TouchableOpacity>

        {/* Recent Logs */}
        {sortedLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            {sortedLogs.map((logItem) => (
              <LogHistoryCard
                key={logItem.date}
                log={logItem}
                onPress={() => openLogModal(logItem.date)}
              />
            ))}
          </>
        )}

        {sortedLogs.length === 0 && !hasLoggedToday && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={colors.secondary[300]} />
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyDesc}>Start logging your daily symptoms, mood, and more</Text>
          </View>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => openLogModal(today())}
        activeOpacity={0.8}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Log Entry Modal ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingLog?.date === today() ? 'Today' : editingLog?.date ? formatDisplayDate(editingLog.date, true) : ''}
            </Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {editingLog && (
                <>
                  {/* Flow */}
                  <Card style={styles.section}>
                    <FlowSelector
                      value={editingLog.flow}
                      onChange={(flow: FlowIntensity) => updateField('flow', flow)}
                    />
                  </Card>

                  {/* Mood */}
                  <Card style={styles.section}>
                    <MoodSelector
                      value={editingLog.mood}
                      onChange={(moods: MoodType[]) => updateField('mood', moods)}
                    />
                  </Card>

                  {/* Symptoms */}
                  <Card style={styles.section}>
                    <SymptomGrid
                      values={{
                        crampsSeverity: editingLog.crampsSeverity,
                        headacheSeverity: editingLog.headacheSeverity,
                        acneSeverity: editingLog.acneSeverity,
                        bloatingSeverity: editingLog.bloatingSeverity,
                        backPainSeverity: editingLog.backPainSeverity,
                        breastTendernessSeverity: editingLog.breastTendernessSeverity,
                      }}
                      onChange={(field, severity) => updateField(field as keyof DailyLog, severity as any)}
                    />
                  </Card>

                  {/* Cervical Mucus */}
                  {settings.fertilityTrackingEnabled && (
                    <Card style={styles.section}>
                      <Text style={styles.sectionLabel}>Cervical Mucus</Text>
                      <View style={styles.mucusRow}>
                        {CERVICAL_MUCUS_OPTIONS.map((option) => {
                          const isSelected = editingLog.discharge === option.value;
                          return (
                            <TouchableOpacity
                              key={option.value}
                              onPress={() => updateField('discharge', isSelected ? null : option.value)}
                              activeOpacity={0.7}
                              style={[styles.mucusChip, isSelected && styles.mucusChipSelected]}
                            >
                              <Text style={[styles.mucusLabel, isSelected && styles.mucusLabelSelected]}>{option.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </Card>
                  )}

                  {/* Libido */}
                  <Card style={styles.section}>
                    <SeveritySlider label="Libido" value={editingLog.libido} onChange={(s) => updateField('libido', s)} />
                  </Card>

                  {/* Biometrics */}
                  <Card style={styles.section}>
                    <Text style={styles.sectionLabel}>Biometrics</Text>
                    <View style={styles.bioGrid}>
                      <BioInput label="Sleep" unit="hrs" value={editingLog.sleepHours} onChange={(v) => updateField('sleepHours', v)} />
                      <BioInput label="Exercise" unit="min" value={editingLog.exerciseMinutes} onChange={(v) => updateField('exerciseMinutes', v ? Math.round(v) : null)} />
                      <BioInput label="Water" unit={settings.waterUnit} value={editingLog.waterIntakeMl} onChange={(v) => updateField('waterIntakeMl', v ? Math.round(v) : null)} />
                      <BioInput label="Temp" unit={settings.temperatureUnit === 'celsius' ? '°C' : '°F'} value={editingLog.bodyTemperature} onChange={(v) => updateField('bodyTemperature', v)} />
                      <BioInput label="BBT" unit={settings.temperatureUnit === 'celsius' ? '°C' : '°F'} value={editingLog.basalBodyTemperature} onChange={(v) => updateField('basalBodyTemperature', v)} />
                      <BioInput label="Weight" unit={settings.weightUnit} value={editingLog.weight} onChange={(v) => updateField('weight', v)} />
                    </View>
                  </Card>

                  {/* Medication */}
                  <Card style={styles.section}>
                    <Text style={styles.sectionLabel}>Medication</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ibuprofen, Birth control"
                      placeholderTextColor={colors.secondary[400]}
                      value={editingLog.medication.join(', ')}
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
                      style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                      placeholder="Any additional notes..."
                      placeholderTextColor={colors.secondary[400]}
                      value={editingLog.notes}
                      onChangeText={(text) => updateField('notes', text)}
                      multiline
                      numberOfLines={3}
                    />
                  </Card>

                  {/* Save button inside modal */}
                  <Button
                    title="Save Log"
                    onPress={handleSave}
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                  />
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Log History Card ────────────────────────────────────────

function LogHistoryCard({ log, onPress }: { log: DailyLog; onPress: () => void }) {
  const moodEmojis = log.mood
    .map((m) => MOOD_OPTIONS.find((o) => o.value === m)?.emoji)
    .filter(Boolean)
    .join(' ');

  const symptomCount = [
    log.crampsSeverity, log.headacheSeverity, log.acneSeverity,
    log.bloatingSeverity, log.backPainSeverity, log.breastTendernessSeverity,
  ].filter((s) => s > 0).length;

  const isToday = log.date === today();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.historyCard}>
      <View style={styles.historyDateCol}>
        <Text style={styles.historyDate}>{isToday ? 'Today' : formatDisplayDate(log.date)}</Text>
      </View>
      <View style={styles.historyBody}>
        {moodEmojis ? <Text style={styles.historyMoods}>{moodEmojis}</Text> : null}
        {log.flow && (
          <View style={styles.historyBadge}>
            <Ionicons name="water" size={10} color={colors.phase.menstruation} />
            <Text style={styles.historyBadgeText}>{formatFlowIntensity(log.flow)}</Text>
          </View>
        )}
        {symptomCount > 0 && (
          <View style={styles.historyBadge}>
            <Ionicons name="pulse-outline" size={10} color={colors.accent[500]} />
            <Text style={styles.historyBadgeText}>{symptomCount} symptom{symptomCount > 1 ? 's' : ''}</Text>
          </View>
        )}
        {log.sleepHours !== null && (
          <View style={styles.historyBadge}>
            <Ionicons name="moon-outline" size={10} color={colors.phase.luteal} />
            <Text style={styles.historyBadgeText}>{log.sleepHours}h</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.secondary[300]} />
    </TouchableOpacity>
  );
}

// ── Biometric Input Helper ──────────────────────────────────

function BioInput({ label, unit, value, onChange }: {
  label: string; unit: string; value: number | null; onChange: (v: number | null) => void;
}) {
  return (
    <View style={styles.bioItem}>
      <Text style={styles.bioLabel}>{label}</Text>
      <View style={styles.bioInputRow}>
        <TextInput
          style={styles.bioInputText}
          keyboardType="decimal-pad"
          value={value !== null ? String(value) : ''}
          onChangeText={(t) => { if (t === '') onChange(null); else { const n = parseFloat(t); if (!isNaN(n)) onChange(n); } }}
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
  feedContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  headerRow: { paddingTop: 16, paddingBottom: 8 },
  screenTitle: { ...typography.h2, color: colors.text.primary },
  todayCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface.light, borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: colors.primary[500],
  },
  todayCardLogged: { borderColor: colors.primary[200] },
  todayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  todayTitle: { ...typography.bodyBold, color: colors.text.primary },
  todaySubtext: { ...typography.small, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { ...typography.bodyBold, color: colors.text.primary, marginTop: 12, marginBottom: 4 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface.light, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.secondary[200],
  },
  historyDateCol: { width: 64 },
  historyDate: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  historyBody: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  historyMoods: { fontSize: 16 },
  historyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.secondary[50], borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3,
  },
  historyBadgeText: { fontSize: 11, color: colors.text.secondary },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { ...typography.bodyBold, color: colors.text.secondary },
  emptyDesc: { ...typography.small, color: colors.text.muted, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.background.light },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.secondary[200],
  },
  modalCancel: { fontSize: 16, color: colors.text.secondary },
  modalTitle: { ...typography.bodyBold, color: colors.text.primary },
  modalSave: { fontSize: 16, fontWeight: '600', color: colors.primary[600] },
  modalContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 40, gap: 12 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  mucusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mucusChip: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: colors.secondary[50], borderWidth: 1.5, borderColor: 'transparent',
  },
  mucusChipSelected: { backgroundColor: `${colors.phase.fertile}15`, borderColor: colors.phase.fertile },
  mucusLabel: { fontSize: 13, fontWeight: '500', color: colors.secondary[600] },
  mucusLabelSelected: { color: colors.phase.fertile },
  bioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bioItem: { width: '47%', flexGrow: 1 },
  bioLabel: { fontSize: 12, color: colors.secondary[500], marginBottom: 4 },
  bioInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.secondary[50], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  bioInputText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text.primary, padding: 0 },
  bioUnit: { fontSize: 12, color: colors.secondary[400], marginLeft: 4 },
  textInput: {
    backgroundColor: colors.secondary[50], borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text.primary,
  },
});
