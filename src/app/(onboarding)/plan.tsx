import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import { Badge, Button } from '@/components/ui';
import { getPlans } from '@/services';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

const planMeta = {
  lite: { tagline: 'Keep it simple.', accent: false },
  pro: { tagline: 'Build, analyze, and optimize at a deeper level.', accent: true },
} as const;

export default function PlanSelectionScreen() {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState<'lite' | 'pro'>(state.currentUser?.mode ?? 'pro');
  const plans = getPlans();

  function handleComplete() {
    dispatch({ type: 'SWITCH_PLAN', mode: selected });
    dispatch({ type: 'COMPLETE_ONBOARDING', data: state.onboardingDraft });
    router.replace('/');
  }

  return (
    <OnboardingScaffold step={3} title="Choose your plan" subtitle="Start free with Lite, or unlock the full toolkit with Pro.">
      <View className="gap-4">
        {plans.map((plan) => {
          const mode = plan.id === 'plan_pro' ? 'pro' : 'lite';
          const active = selected === mode;
          const meta = planMeta[mode];
          return (
            <Pressable
              key={plan.id}
              onPress={() => setSelected(mode)}
              className={cn(
                'rounded-lg border bg-surface dark:bg-surface-dark p-4 gap-3',
                active
                  ? 'border-primary dark:border-primary-dark'
                  : 'border-border dark:border-border-dark',
              )}>
              <View className="flex-row items-center gap-2">
                <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">{plan.name}</Text>
                {meta.accent && <Badge label="Pro" tone="primary" />}
                <View className="flex-1" />
                <View
                  className={cn(
                    'w-6 h-6 rounded-full border-2 items-center justify-center',
                    active ? 'border-primary dark:border-primary-dark' : 'border-border dark:border-border-dark',
                  )}>
                  {active && <View className="w-3 h-3 rounded-full bg-primary dark:bg-primary-dark" />}
                </View>
              </View>

              <Text className="text-body text-secondary-text dark:text-secondary-text-dark">
                {meta.tagline}
              </Text>

              <View className="flex-row items-baseline gap-1">
                <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark">
                  {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                </Text>
                {plan.price > 0 && (
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">/month</Text>
                )}
              </View>

              <View className="gap-2">
                {plan.features.map((feature) => (
                  <View key={feature} className="flex-row items-center gap-2">
                    <Check size={15} color="#16A34A" />
                    <Text className="text-small text-primary-text dark:text-primary-text-dark">{feature}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
        <Button label="Finish Setup" size="lg" fullWidth onPress={handleComplete} />
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark text-center mt-3">
          You can switch plans anytime from Profile.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}