import { Check } from 'lucide-react-native';
import { Pressable, Text, View, type PressableProps, type ViewStyle } from 'react-native';

import { cn } from '@/utils/cn';

export type CheckboxProps = Omit<PressableProps, 'children'> & {
  checked: boolean;
  label?: string;
  style?: ViewStyle;
};

export function Checkbox({ checked, label, onPress, className, ...rest }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      className={cn('flex-row items-center gap-2', className)}
      {...rest}
    >
      <View
        className={cn(
          'w-5 h-5 rounded-sm items-center justify-center border',
          checked
            ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
            : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark',
        )}
      >
        {checked && <Check size={14} color="#01161E" strokeWidth={3} />}
      </View>
      {label && (
        <Text className="flex-1 text-body text-primary-text dark:text-primary-text-dark">
          {label}
        </Text>
      )}
    </Pressable>
  );
}