import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  onBack,
  backVisible = true,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  backVisible?: boolean;
}) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 pt-3 pb-2">
          {backVisible ? (
            <Pressable
              onPress={() => (onBack ? onBack() : router.back())}
              accessibilityLabel="Go back"
              hitSlop={8}
              className="w-9 h-9 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
              <ArrowLeft size={20} className="text-secondary-text dark:text-secondary-text-dark" />
            </Pressable>
          ) : (
            <View className="w-9" />
          )}
          <View className="flex-1 flex-row items-center justify-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={cn(
                  'h-1.5 rounded-full',
                  s <= step ? 'w-6 bg-primary dark:bg-primary-dark' : 'w-1.5 bg-border dark:bg-border-dark',
                )}
              />
            ))}
          </View>
          <View className="w-9" />
        </View>

        <View className="flex-1 px-5 pt-4">
          <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark">{title}</Text>
          {subtitle && (
            <Text className="text-body text-secondary-text dark:text-secondary-text-dark mt-1">{subtitle}</Text>
          )}
          <View className="mt-5 flex-1">{children}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}