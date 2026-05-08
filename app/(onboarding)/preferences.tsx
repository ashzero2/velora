import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@src/components/ui/Button';
import { TYPICAL_SYMPTOMS } from '@src/constants/medical';

export default function PreferencesScreen() {
  const params = useLocalSearchParams<{
    lastPeriodStart: string;
    avgCycleLength: string;
    avgPeriodLength: string;
  }>();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isIrregular, setIsIrregular] = useState(false);
  const [fertilityTracking, setFertilityTracking] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/complete',
      params: {
        ...params,
        typicalSymptoms: JSON.stringify(selectedSymptoms),
        isIrregular: String(isIrregular),
        fertilityTracking: String(fertilityTracking),
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(onboarding)/complete',
      params: {
        ...params,
        typicalSymptoms: '[]',
        isIrregular: 'false',
        fertilityTracking: 'false',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 py-8 gap-6">
          {/* Back button + Step indicator */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Ionicons name="arrow-back" size={24} color="#57534e" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-primary-500" />
              <View className="w-8 h-1 rounded-full bg-secondary-200" />
            </View>
            <TouchableOpacity onPress={handleSkip} className="p-1">
              <Text className="text-sm text-primary-600 font-medium">Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-secondary-900">
              Preferences
            </Text>
            <Text className="text-sm text-secondary-500 leading-5">
              Optional — help us personalize your experience. You can always
              change these later.
            </Text>
          </View>

          {/* Typical Symptoms */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-secondary-600">
              Typical symptoms you experience
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPICAL_SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <TouchableOpacity
                    key={symptom}
                    onPress={() => toggleSymptom(symptom)}
                    activeOpacity={0.7}
                    className={`
                      rounded-full px-4 py-2 border
                      ${isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-secondary-200'
                      }
                    `}
                  >
                    <Text
                      className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-secondary-700'}`}
                    >
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Irregular cycle toggle */}
          <TouchableOpacity
            onPress={() => setIsIrregular(!isIrregular)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-white rounded-xl p-4 border border-secondary-200"
          >
            <View className="flex-1 mr-3">
              <Text className="text-sm font-medium text-secondary-900">
                My cycles are irregular
              </Text>
              <Text className="text-xs text-secondary-400 mt-0.5">
                Cycles vary by more than 8 days in length
              </Text>
            </View>
            <View
              className={`w-11 h-6 rounded-full justify-center px-0.5 ${isIrregular ? 'bg-primary-500' : 'bg-secondary-200'}`}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white ${isIrregular ? 'self-end' : 'self-start'}`}
              />
            </View>
          </TouchableOpacity>

          {/* Fertility tracking toggle */}
          <TouchableOpacity
            onPress={() => setFertilityTracking(!fertilityTracking)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-white rounded-xl p-4 border border-secondary-200"
          >
            <View className="flex-1 mr-3">
              <Text className="text-sm font-medium text-secondary-900">
                Enable fertility tracking
              </Text>
              <Text className="text-xs text-secondary-400 mt-0.5">
                Shows estimated ovulation and fertile window
              </Text>
            </View>
            <View
              className={`w-11 h-6 rounded-full justify-center px-0.5 ${fertilityTracking ? 'bg-primary-500' : 'bg-secondary-200'}`}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white ${fertilityTracking ? 'self-end' : 'self-start'}`}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-6">
        <Button
          title="Continue"
          onPress={handleContinue}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}