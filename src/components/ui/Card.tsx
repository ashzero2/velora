import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, shadows } from '@src/constants/theme';

type CardVariant = 'default' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' ? styles.elevated : styles.default,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  default: {
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  elevated: {
    ...shadows.md,
  },
});