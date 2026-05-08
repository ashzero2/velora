import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-secondary-200 active:bg-secondary-300',
  outline: 'bg-transparent border border-primary-500',
  ghost: 'bg-transparent active:bg-secondary-100',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-secondary-900',
  outline: 'text-primary-600',
  ghost: 'text-primary-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`
        rounded-button items-center justify-center flex-row
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
      style={style}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#6b9080'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        className={`
          font-semibold
          ${variantTextClasses[variant]}
          ${sizeTextClasses[size]}
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}