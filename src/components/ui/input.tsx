import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps, type ViewProps } from 'react-native';

import { cn } from '@/utils/cn';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: ViewProps['className'];
};

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label && (
        <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">
          {label}
        </Text>
      )}
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-md border bg-surface dark:bg-surface-dark px-3',
          focused ? 'border-primary dark:border-primary' : 'border-border dark:border-border-dark',
          error && 'border-danger dark:border-danger-dark',
        )}
      >
        {leftIcon && <View className="text-secondary-text dark:text-secondary-text-dark">{leftIcon}</View>}
        <TextInput
          className={cn(
            'flex-1 py-2.5 text-body text-primary-text dark:text-primary-text-dark placeholder:text-secondary-text dark:placeholder:text-secondary-text-dark',
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && <View className="text-secondary-text dark:text-secondary-text-dark">{rightIcon}</View>}
      </View>
      {error ? (
        <Text className="text-caption text-danger dark:text-danger-dark">{error}</Text>
      ) : hint ? (
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{hint}</Text>
      ) : null}
    </View>
  );
}