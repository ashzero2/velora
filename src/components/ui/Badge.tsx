import React from 'react';
import { View, Text } from 'react-native';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  color?: string;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  label,
  color = '#6b9080',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View
      className={`rounded-full self-start ${sizeClass} ${className}`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Text className={`font-medium ${textSize}`} style={{ color }}>
        {label}
      </Text>
    </View>
  );
}