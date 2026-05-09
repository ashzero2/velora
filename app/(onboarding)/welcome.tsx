import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { PRIVACY_NOTICE } from '@src/constants/medical';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="flex-1 justify-between px-6 py-8">
        {/* Step indicator */}
        <View className="flex-row justify-center gap-2 mt-2">
          <View className="w-8 h-1 rounded-full bg-primary-500" />
          <View className="w-8 h-1 rounded-full bg-secondary-200" />
          <View className="w-8 h-1 rounded-full bg-secondary-200" />
          <View className="w-8 h-1 rounded-full bg-secondary-200" />
        </View>

        {/* Content */}
        <View className="items-center gap-6">
          <View className="bg-primary-50 rounded-full p-8">
            <Ionicons name="moon" size={64} color="#6b9080" />
          </View>

          <View className="items-center gap-3">
            <Text className="text-3xl font-bold text-secondary-900">
              Velora
            </Text>
            <Text className="text-lg text-secondary-500 text-center">
              Your cycle, understood.
            </Text>
          </View>

          <Text className="text-sm text-secondary-500 text-center leading-5 max-w-xs">
            Track your period, understand your phases, and get personalized
            insights — all with complete privacy.
          </Text>
        </View>

        {/* Privacy + CTA */}
        <View className="gap-4">
          <View className="flex-row items-center gap-2 bg-primary-50 rounded-xl p-3">
            <Ionicons name="lock-closed" size={18} color="#6b9080" />
            <Text className="text-xs text-primary-700 flex-1">
              {PRIVACY_NOTICE}
            </Text>
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