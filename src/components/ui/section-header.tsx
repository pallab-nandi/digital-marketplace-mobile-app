import { Text, View, type ViewProps } from 'react-native';

export type SectionHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, action, className, ...rest }: SectionHeaderProps) {
  return (
    <View className={className} {...rest}>
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-1">
          <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
        {action}
      </View>
    </View>
  );
}