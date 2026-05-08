import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'flower-outline',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <View className="bg-primary-50 rounded-full p-5 mb-4">
        <Ionicons name={icon} size={40} color="#6b9080" />
      </View>
      <Text className="text-lg font-semibold text-secondary-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-secondary-500 text-center mb-6 max-w-xs">
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} size="md" />
      )}
    </View>
  );
}