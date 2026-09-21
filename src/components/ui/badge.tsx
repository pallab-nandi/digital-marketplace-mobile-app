import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeProps = ViewProps & {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted dark:bg-surface-muted-dark',
  primary: 'bg-primary/10 dark:bg-primary-dark/15',
  success: 'bg-success/10 dark:bg-success-dark/15',
  warning: 'bg-warning/10 dark:bg-warning-dark/15',
  danger: 'bg-danger/10 dark:bg-danger-dark/15',
  info: 'bg-info/10 dark:bg-info-dark/15',
};

const textClasses: Record<BadgeTone, string> = {
  neutral: 'text-secondary-text dark:text-secondary-text-dark',
  primary: 'text-primary dark:text-primary-dark',
  success: 'text-success dark:text-success-dark',
  warning: 'text-warning dark:text-warning-dark',
  danger: 'text-danger dark:text-danger-dark',
  info: 'text-info dark:text-info-dark',
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: 'bg-secondary-text dark:bg-secondary-text-dark',
  primary: 'bg-primary dark:bg-primary-dark',
  success: 'bg-success dark:bg-success-dark',
  warning: 'bg-warning dark:bg-warning-dark',
  danger: 'bg-danger dark:bg-danger-dark',
  info: 'bg-info dark:bg-info-dark',
};

export function Badge({ label, tone = 'neutral', dot = false, className, ...rest }: BadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1.5 rounded-full px-2.5 py-1 self-start',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {dot && <View className={cn('w-1.5 h-1.5 rounded-full', dotClasses[tone])} />}
      <Text className={cn('text-caption font-medium', textClasses[tone])}>{label}</Text>
    </View>
  );
}