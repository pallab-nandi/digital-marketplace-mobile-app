import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PageHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function PageHeader({ title, subtitle, showBack = true, right, className, style, ...rest }: PageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className={className} style={[{ paddingTop: insets.top }, style]} {...rest}>
      <View className="flex-row items-center gap-3 px-4 pt-3 pb-3">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
            className="w-9 h-9 -ml-1 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark"
          >
            <ArrowLeft size={20} className="text-secondary-text dark:text-secondary-text-dark" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
              {subtitle}
            </Text>
          )}
        </View>
        {right}
      </View>
    </View>
  );
}