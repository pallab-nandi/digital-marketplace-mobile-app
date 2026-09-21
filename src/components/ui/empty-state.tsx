import { ComponentType } from 'react';
import { Text, View, type ViewProps } from 'react-native';

export type EmptyStateProps = ViewProps & {
  icon?: ComponentType<{ size?: number; color?: string; className?: string }>;
  title: string;
  message?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, message, action, className, ...rest }: EmptyStateProps) {
  return (
    <View className={className} {...rest}>
      <View className="items-center gap-2 px-6 py-10">
        {Icon && (
          <View className="w-14 h-14 rounded-full bg-surface-muted dark:bg-surface-muted-dark items-center justify-center mb-1">
            <Icon size={24} className="text-secondary-text dark:text-secondary-text-dark" />
          </View>
        )}
        <Text className="text-h3 font-semibold text-center text-primary-text dark:text-primary-text-dark">
          {title}
        </Text>
        {message && (
          <Text className="text-body text-center text-secondary-text dark:text-secondary-text-dark">
            {message}
          </Text>
        )}
        {action && <View className="mt-4">{action}</View>}
      </View>
    </View>
  );
}