import { ActivityIndicator, Pressable, Text, type PressableProps, type ViewStyle } from 'react-native';

import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary dark:bg-primary',
  secondary: 'bg-surface-muted dark:bg-surface-muted-dark',
  outline: 'border border-border dark:border-border-dark bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-danger dark:bg-danger-dark',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-rich-black dark:text-rich-black',
  secondary: 'text-primary-text dark:text-primary-text-dark',
  outline: 'text-primary-text dark:text-primary-text-dark',
  ghost: 'text-primary dark:text-primary-dark',
  danger: 'text-white dark:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-sm',
  md: 'px-4 py-3 rounded-md',
  lg: 'px-5 py-4 rounded-md',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-small',
  md: 'text-body',
  lg: 'text-body',
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth,
  style,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      style={({ pressed }) => [
        style,
        pressed && !isDisabled ? { transform: [{ scale: 0.97 }] } : null,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          className={labelClasses[variant]}
        />
      ) : (
        leftIcon
      )}
      <Text className={cn('font-semibold', labelClasses[variant], sizeTextClasses[size])}>
        {label}
      </Text>
      {!loading && rightIcon}
    </Pressable>
  );
}