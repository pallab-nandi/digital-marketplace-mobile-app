import { Laptop, Moon, Sun } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, PageHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStore, type ThemePreference } from '@/store';
import { cn } from '@/utils/cn';

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'system', label: 'System', icon: <Laptop size={18} className="text-secondary-text dark:text-secondary-text-dark" />, description: 'Follow device appearance' },
  { key: 'light', label: 'Light', icon: <Sun size={18} className="text-secondary-text dark:text-secondary-text-dark" />, description: 'Always light theme' },
  { key: 'dark', label: 'Dark', icon: <Moon size={18} className="text-secondary-text dark:text-secondary-text-dark" />, description: 'Always dark theme' },
];

export default function AppearanceScreen() {
  const { state, dispatch } = useStore();
  const theme = state.appearance.theme;

  function setTheme(next: ThemePreference) {
    dispatch({ type: 'SET_APPEARANCE', theme: next });
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ width: '100%', maxWidth: 800, alignSelf: 'center', paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Appearance" subtitle="Theme applies instantly" />

      <View className="px-4 gap-3">
        <SectionHeader title="Theme" />
        <Card className="gap-2">
          {THEME_OPTIONS.map((option, index) => (
            <View key={option.key}>
              {index > 0 && <View className="h-px bg-border dark:bg-border-dark mx-4" />}
              <Pressable
                onPress={() => setTheme(option.key)}
                accessibilityRole="button"
                className={cn(
                  'flex-row items-center gap-3 rounded-md border bg-surface dark:bg-surface-dark px-4 py-3',
                  theme === option.key
                    ? 'border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary/5'
                    : 'border-border dark:border-border-dark',
                )}>
                <View className="w-10 h-10 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
                  {option.icon}
                </View>
                <View className="flex-1 flex-col justify-center gap-0.5">
                  <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                    {option.label}
                  </Text>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    {option.description}
                  </Text>
                </View>
                {theme === option.key && (
                  <View className="w-6 h-6 rounded-full border-2 border-primary dark:border-primary-dark items-center justify-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-primary-dark" />
                  </View>
                )}
              </Pressable>
            </View>
          ))}
        </Card>
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark px-2">
          The demo syncs the whole app — tabs, cards, charts and system navigation.
        </Text>
      </View>
    </ScrollView>
  );
}