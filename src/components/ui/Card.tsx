import React from 'react';
import { View, type ViewStyle } from 'react-native';

type CardVariant = 'default' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  className = '',
  style,
}: CardProps) {
  const variantClass =
    variant === 'elevated'
      ? 'bg-white rounded-card p-4 shadow-md'
      : 'bg-white rounded-card p-4 border border-secondary-200';

  return (
    <View className={`${variantClass} ${className}`} style={style}>
      {children}
    </View>
  );
}