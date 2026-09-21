import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export type SelectProps<T extends string = string> = {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
};

export function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-md border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2.5"
      >
        <Text
          className={cn(
            'text-body',
            selected
              ? 'text-primary-text dark:text-primary-text-dark'
              : 'text-secondary-text dark:text-secondary-text-dark',
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} className="text-secondary-text dark:text-secondary-text-dark" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-4" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-surface dark:bg-surface-dark rounded-lg overflow-hidden"
          >
            <ScrollView className="max-h-72">
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'px-4 py-3',
                      active && 'bg-primary/10 dark:bg-primary-dark/15',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-body',
                        active
                          ? 'font-semibold text-primary dark:text-primary-dark'
                          : 'text-primary-text dark:text-primary-text-dark',
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}