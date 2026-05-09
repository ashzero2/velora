import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  color?: string;
  size?: BadgeSize;
}

export function Badge({ label, color = '#6b9080', size = 'md' }: BadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.base,
        isSmall ? styles.sm : styles.md,
        { backgroundColor: `${color}20` },
      ]}
    >
      <Text
        style={[isSmall ? styles.textSm : styles.textMd, { color }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 9999, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
  textSm: { fontSize: 12, fontWeight: '500' },
  textMd: { fontSize: 14, fontWeight: '500' },
});