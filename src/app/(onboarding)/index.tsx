import { useRouter } from 'expo-router';
import { Box, Component, Megaphone, Rocket, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_INDUSTRY, MARKETING_TYPES } from '@/constants/onboarding';
import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import { Button } from '@/components/ui';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

const typeIcons = [Box, Smartphone, Megaphone, Rocket, Component] as const;

export default function MarketingTypeScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const draft = state.onboardingDraft;
  const [selected, setSelected] = useState<string | null>(draft.category || null);

  function handleNext() {
    if (!selected) return;
    dispatch({
      type: 'SET_ONBOARDING_DRAFT',
      patch: { category: selected, industry: CATEGORY_INDUSTRY[selected] ?? 'Business' },
    });
    router.push('/(onboarding)/goal');
  }

  return (
    <OnboardingScaffold step={1} title="What are you marketing?" subtitle="Choose the type of business you want to promote.">
      <View className="gap-3">
        {MARKETING_TYPES.map((option, i) => {
          const Icon = typeIcons[i];
          const active = selected === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setSelected(option.value)}
              className={cn(
                'flex-row items-center gap-3 rounded-lg border bg-surface dark:bg-surface-dark p-4',
                active
                  ? 'border-primary dark:border-primary-dark'
                  : 'border-border dark:border-border-dark',
              )}>
              <View className="w-10 h-10 items-center justify-center rounded-md bg-primary/10 dark:bg-primary-dark/15">
                <Icon size={20} color="#5B5CE2" />
              </View>
              <Text className="flex-1 text-body font-medium text-primary-text dark:text-primary-text-dark">
                {option.label}
              </Text>
              <View
                className={cn(
                  'w-5 h-5 rounded-full border-2 items-center justify-center',
                  active ? 'border-primary dark:border-primary-dark' : 'border-border dark:border-border-dark',
                )}>
                {active && <View className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-primary-dark" />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
        <Button label="Continue" size="lg" fullWidth disabled={!selected} onPress={handleNext} />
      </View>
    </OnboardingScaffold>
  );
}