import { Check, Crown } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, PageHeader, useToast } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getPlans } from '@/services';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

export default function PlanScreen() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const plans = getPlans();
  const isPro = state.currentUser?.mode === 'pro';

  function switchPlan() {
    dispatch({ type: 'SWITCH_PLAN', mode: isPro ? 'lite' : 'pro' });
    toast.success(isPro ? 'Downgraded to Lite' : 'Upgraded to Pro');
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Subscription" subtitle={`Current plan: ${isPro ? 'Pro' : 'Lite'}`} />

      <View className="px-4 gap-3">
        {plans.map((plan) => {
          const current = (plan.id === 'plan_pro') === isPro;
          return (
            <Card
              key={plan.id}
              className={cn(
                current && 'border-primary dark:border-primary-dark',
                !current && 'opacity-90',
              )}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  {plan.id === 'plan_pro' && <Crown size={18} color="#D97706" />}
                  <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                    {plan.name}
                  </Text>
                  {plan.isPopular && <Badge label="Popular" tone="primary" />}
                  {current && <Badge label="Current" tone="success" dot />}
                </View>
                <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">
                  {plan.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      ₹{plan.price.toLocaleString('en-IN')}
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        {' '}
                        /{plan.billingPeriod}
                      </Text>
                    </>
                  )}
                </Text>
              </View>
              <Text className="text-small text-secondary-text dark:text-secondary-text-dark mt-1">
                {plan.description}
              </Text>
              <View className="mt-3 gap-2">
                {plan.features.map((feature) => (
                  <View key={feature} className="flex-row items-center gap-2">
                    <Check size={15} color="#16A34A" />
                    <Text className="text-small text-primary-text dark:text-primary-text-dark">{feature}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-4">
                <Button
                  label={current ? 'Current plan' : isPro ? 'Downgrade to Lite' : `Upgrade to ${plan.name}`}
                  variant={current ? 'secondary' : 'primary'}
                  fullWidth
                  disabled={current}
                  onPress={switchPlan}
                />
              </View>
            </Card>
          );
        })}

        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark text-center px-4">
          Demo plan switch — no payment required.
        </Text>
      </View>
    </ScrollView>
  );
}