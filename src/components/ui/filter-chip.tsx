import { Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/utils/cn';

export type FilterChipProps = ViewProps & {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, selected = false, onPress, className, ...rest }: FilterChipProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      <View
        className={cn(
          'rounded-full px-3.5 py-2 border',
          selected
            ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
            : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark',
          className,
        )}
        {...rest}
      >
        <Text
          className={cn(
            'text-small font-medium',
            selected
              ? 'text-white dark:text-bg-dark'
              : 'text-primary-text dark:text-primary-text-dark',
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}