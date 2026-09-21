import { useRouter } from 'expo-router';
import { Eye, MousePointerClick, MailCheck, ShoppingCart, ThumbsUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MARKETING_GOALS } from '@/constants/onboarding';
import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import { Button } from '@/components/ui';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

const goalIcons = [Eye, MousePointerClick, MailCheck, ShoppingCart, ThumbsUp] as const;

export default function PrimaryGoalScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState<string | null>(state.onboardingDraft.objective || null);

  function handleNext() {
    if (!selected) return;
    dispatch({ type: 'SET_ONBOARDING_DRAFT', patch: { objective: selected } });
    router.push('/(onboarding)/plan');
  }

  return (
    <OnboardingScaffold step={2} title="What is your primary goal?" subtitle="We'll tailor your dashboard around this outcome.">
      <View className="gap-3">
        {MARKETING_GOALS.map((option, i) => {
          const Icon = goalIcons[i];
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