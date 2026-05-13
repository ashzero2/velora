import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@src/hooks/useDatabase';
import { useLogStore, createBlankLog } from '@src/stores/useLogStore';
import { useCycleStore } from '@src/stores/useCycleStore';
import { FlowSelector } from '@src/components/log/FlowSelector';
import { Card } from '@src/components/ui/Card';
import { Button } from '@src/components/ui/Button';
import { today, subDays, formatDisplayDate, nowISO } from '@src/utils/dateUtils';
import type { DailyLog, FlowIntensity } from '@src/types';
import { colors, typography, spacing } from '@src/constants/theme';
import { formatFlowIntensity } from '@src/utils/formatUtils';

export default function LogScreen() {
  const db = useDatabase();
  const currentCycle = useCycleStore((s) => s.currentCycle);
  const todayLog = useLogStore((s) => s.todayLog);
  const recentLogs = useLogStore((s) => s.recentLogs);
  const loadLogForDate = useLogStore((s) => s.loadLogForDate);
  const upsertLog = useLogStore((s) => s.upsertLog);
  const initLog = useLogStore((s) => s.initialize);
  const isLoading = useLogStore((s) => s.isLoading);

  const [selectedDate, setSelectedDate] = useState(today());
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { initLog(db); }, [db, initLog]);

  // Load log for selected date
  useEffect(() => {
    (async () => {
      const existing = await loadLogForDate(db, selectedDate);
      setEditingLog(existing ?? createBlankLog(selectedDate, currentCycle?.id ?? null));
    })();
  }, [selectedDate, db, loadLogForDate, currentCycle]);

  const handleSave = async () => {
    if (!editingLog) return;
    setIsSaving(true);
    try {
      await upsertLog(db, { ...editingLog, updatedAt: nowISO() });
      Alert.alert('Saved', 'Your log has been saved.');
    } catch {
      Alert.alert('Error', 'Failed to save log.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate last 7 days for date selector
  const dates = Array.from({ length: 7 }, (_, i) => subDays(today(), i));

  const isToday = selectedDate === today();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Daily Log</Text>
            <Text style={styles.screenSubtitle}>
              {isToday ? 'Today' : formatDisplayDate(selectedDate, true)}
            </Text>
          </View>

          {/* Date Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dates.map((date) => {
              const isSelected = date === selectedDate;
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.getDate();
              return (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.dateDayNameSelected]}>
                    {date === today() ? 'Today' : dayName}
                  </Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.dateDayNumSelected]}>
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Flow Selector */}
          {editingLog && (
            <>
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>Flow Level</Text>
                <FlowSelector
                  value={editingLog.flow}
                  onChange={(flow: FlowIntensity) => {
                    setEditingLog((prev) => prev ? { ...prev, flow } : prev);
                  }}
                />
              </Card>

              {/* Notes */}
              <Card style={styles.section}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="How are you feeling today?"
                  placeholderTextColor={colors.secondary[400]}
                  value={editingLog.notes}
                  onChangeText={(text) => {
                    setEditingLog((prev) => prev ? { ...prev, notes: text } : prev);
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </Card>

              {/* Save */}
              <Button
                title="Save Log"
                onPress={handleSave}
                variant="primary"
                fullWidth
                loading={isSaving}
              />
            </>
          )}

          {/* Recent Logs */}
          {recentLogs.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Logs</Text>
              {[...recentLogs]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((log) => (
                  <TouchableOpacity
                    key={log.date}
                    onPress={() => setSelectedDate(log.date)}
                    activeOpacity={0.7}
                    style={styles.recentItem}
                  >
                    <Text style={styles.recentDate}>
                      {log.date === today() ? 'Today' : formatDisplayDate(log.date)}
                    </Text>
                    <View style={styles.recentBadges}>
                      {log.flow && (
                        <View style={styles.recentBadge}>
                          <Ionicons name="water" size={12} color={colors.phase.menstruation} />
                          <Text style={styles.recentBadgeText}>{formatFlowIntensity(log.flow)}</Text>
                        </View>
                      )}
                      {log.notes ? (
                        <View style={styles.recentBadge}>
                          <Ionicons name="chatbubble-outline" size={12} color={colors.secondary[500]} />
                          <Text style={styles.recentBadgeText} numberOfLines={1}>
                            {log.notes.slice(0, 30)}{log.notes.length > 30 ? '…' : ''}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.secondary[300]} />
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  header: { paddingTop: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  screenSubtitle: { fontSize: 14, color: colors.secondary[500] },

  // Date selector
  dateRow: { gap: 8, paddingVertical: 4 },
  dateChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.secondary[50],
    minWidth: 56,
  },
  dateChipSelected: {
    backgroundColor: colors.primary[500],
  },
  dateDayName: { fontSize: 11, color: colors.text.muted, fontWeight: '500' },
  dateDayNameSelected: { color: '#ffffff' },
  dateDayNum: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginTop: 2 },
  dateDayNumSelected: { color: '#ffffff' },

  // Sections
  section: { gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  notesInput: {
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 100,
    lineHeight: 20,
  },

  // Recent logs
  recentSection: { gap: 8, marginTop: 8 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.secondary[100],
  },
  recentDate: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, width: 64 },
  recentBadges: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recentBadgeText: { fontSize: 11, color: colors.text.secondary },
});