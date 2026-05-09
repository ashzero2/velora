import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { TYPICAL_SYMPTOMS } from '@src/constants/medical';
import { colors } from '@src/constants/theme';

export default function PreferencesScreen() {
  const params = useLocalSearchParams<{ lastPeriodStart: string; avgCycleLength: string; avgPeriodLength: string }>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isIrregular, setIsIrregular] = useState(false);
  const [fertilityTracking, setFertilityTracking] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]);
  };

  const nav = (symptoms: string[], irreg: boolean, fert: boolean) => {
    router.push({
      pathname: '/(onboarding)/complete',
      params: { ...params, typicalSymptoms: JSON.stringify(symptoms), isIrregular: String(irreg), fertilityTracking: String(fert) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={24} color={colors.secondary[600]} />
            </TouchableOpacity>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={styles.stepDot} />
            </View>
            <TouchableOpacity onPress={() => nav([], false, false)} style={{ padding: 4 }}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.title}>Preferences</Text>
            <Text style={styles.subtitle}>Optional — help us personalize your experience. You can always change these later.</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Typical symptoms you experience</Text>
            <View style={styles.chipWrap}>
              {TYPICAL_SYMPTOMS.map((symptom) => {
                const sel = selectedSymptoms.includes(symptom);
                return (
                  <TouchableOpacity
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    activeOpacity={0.7}
                    style={[styles.chip, sel ? styles.chipSelected : styles.chipDefault]}
                  >
                    <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{symptom}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Irregular toggle */}
          <TouchableOpacity onPress={() => setIsIrregular(!isIrregular)} activeOpacity={0.7} style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>My cycles are irregular</Text>
              <Text style={styles.toggleDesc}>Cycles vary by more than 8 days in length</Text>
            </View>
            <View style={[styles.switch, isIrregular && styles.switchOn]}>
              <View style={[styles.switchThumb, isIrregular && styles.switchThumbOn]} />
            </View>
          </TouchableOpacity>

          {/* Fertility toggle */}
          <TouchableOpacity onPress={() => setFertilityTracking(!fertilityTracking)} activeOpacity={0.7} style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>Enable fertility tracking</Text>
              <Text style={styles.toggleDesc}>Shows estimated ovulation and fertile window</Text>
            </View>
            <View style={[styles.switch, fertilityTracking && styles.switchOn]}>
              <View style={[styles.switchThumb, fertilityTracking && styles.switchThumbOn]} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={() => nav(selectedSymptoms, isIrregular, fertilityTracking)} size="lg" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  body: { paddingHorizontal: 24, paddingVertical: 32, gap: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 32, height: 4, borderRadius: 9999, backgroundColor: colors.secondary[200] },
  stepActive: { backgroundColor: colors.primary[500] },
  skipText: { fontSize: 14, color: colors.primary[600], fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: colors.secondary[900] },
  subtitle: { fontSize: 14, color: colors.secondary[500], lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '500', color: colors.secondary[600] },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  chipDefault: { backgroundColor: '#ffffff', borderColor: colors.secondary[200] },
  chipSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  chipText: { fontSize: 14, color: colors.secondary[700] },
  chipTextSelected: { color: '#ffffff', fontWeight: '500' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.secondary[200],
  },
  toggleTitle: { fontSize: 14, fontWeight: '500', color: colors.secondary[900] },
  toggleDesc: { fontSize: 12, color: colors.secondary[400], marginTop: 2 },
  switch: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.secondary[200], justifyContent: 'center', paddingHorizontal: 2 },
  switchOn: { backgroundColor: colors.primary[500] },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff', alignSelf: 'flex-start' },
  switchThumbOn: { alignSelf: 'flex-end' },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
});