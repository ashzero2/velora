import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, shadows } from '@src/constants/theme';
import { useThemeColors } from '@src/hooks/useThemeColors';

type CardVariant = 'default' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.cardBackground },
        variant === 'elevated'
          ? [styles.elevated, theme.isDark && styles.elevatedDark]
          : [styles.default, { borderColor: theme.border }],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  default: {
    borderWidth: 1,
  },
  elevated: {
    ...shadows.md,
  },
  elevatedDark: {
    borderWidth: 1,
    borderColor: '#2e2a27',
    shadowOpacity: 0,
    elevation: 0,
  },
});
