import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useDatabase } from '@src/hooks/useDatabase';
import { useSettingsStore } from '@src/stores/useSettingsStore';
import { useCycleStore } from '@src/stores/useCycleStore';

/**
 * Entry point: initializes stores and redirects to onboarding or tabs.
 */
export default function IndexScreen() {
  const db = useDatabase();
  const initializeSettings = useSettingsStore((s) => s.initialize);
  const initializeCycles = useCycleStore((s) => s.initialize);
  const onboardingComplete = useSettingsStore((s) => s.settings.onboardingComplete);
  const isLoading = useSettingsStore((s) => s.isLoading);

  useEffect(() => {
    const init = async () => {
      await initializeSettings(db);
      await initializeCycles(db);
    };
    init();
  }, [db]);

  useEffect(() => {
    if (isLoading) return;

    if (onboardingComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/welcome');
    }
  }, [onboardingComplete, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' }}>
      <ActivityIndicator size="large" color="#6b9080" />
    </View>
  );
}