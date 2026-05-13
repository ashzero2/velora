import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@src/components/ui/Card';
import { colors, spacing } from '@src/constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionCardProps {
  title: string;
  icon: string;
  iconColor: string;
  preview?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionCard({
  title,
  icon,
  iconColor,
  preview,
  children,
  defaultOpen = false,
}: AccordionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={styles.header}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {!isOpen && preview && (
            <Text style={styles.preview} numberOfLines={1}>{preview}</Text>
          )}
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.secondary[400]}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  preview: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: spacing.md,
  },
});