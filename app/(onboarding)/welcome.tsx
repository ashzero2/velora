import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { PRIVACY_NOTICE } from '@src/constants/medical';
import { colors } from '@src/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="moon" size={64} color={colors.primary[500]} />
          </View>
          <Text style={styles.title}>Velora</Text>
          <Text style={styles.tagline}>Your cycle, understood.</Text>
          <Text style={styles.description}>
            Track your period, understand your phases, and get personalized
            insights — all with complete privacy.
          </Text>
        </View>

        {/* Privacy + CTA */}
        <View style={{ gap: 16 }}>
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={18} color={colors.primary[500]} />
            <Text style={styles.privacyText}>{PRIVACY_NOTICE}</Text>
          </View>
          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/cycle-info')}
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.light },
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 32 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  stepDot: { width: 32, height: 4, borderRadius: 9999, backgroundColor: colors.secondary[200] },
  stepActive: { backgroundColor: colors.primary[500] },
  content: { alignItems: 'center', gap: 24 },
  iconWrap: { backgroundColor: colors.primary[50], borderRadius: 9999, padding: 32 },
  title: { fontSize: 30, fontWeight: '700', color: colors.secondary[900] },
  tagline: { fontSize: 18, color: colors.secondary[500], textAlign: 'center' },
  description: { fontSize: 14, color: colors.secondary[500], textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary[50], borderRadius: 12, padding: 12 },
  privacyText: { fontSize: 12, color: colors.primary[700], flex: 1 },
});