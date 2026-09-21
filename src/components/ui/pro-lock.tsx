import { useRouter } from 'expo-router';
import { Crown, Lock } from 'lucide-react-native';
import { Text, View, type ViewProps } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export const DEFAULT_PRO_LOCK_MESSAGE =
  'Unlock AI recommendations, advanced analytics and creator discovery with Pro.';

export type ProLockCardProps = ViewProps & {
  title?: string;
  message?: string;
  actionLabel?: string;
};

export function ProLockCard({
  title = 'Pro feature',
  message = DEFAULT_PRO_LOCK_MESSAGE,
  actionLabel = 'Explore Pro',
  className,
  ...rest
}: ProLockCardProps) {
  const router = useRouter();

  return (
    <Card
      className={className}
      {...rest}>
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/15 items-center justify-center">
          <Lock size={18} className="text-primary dark:text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
            {title}
          </Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-1 leading-5">
            {message}
          </Text>
          <Button
            label={actionLabel}
            size="sm"
            variant="primary"
            leftIcon={<Crown size={14} className="text-rich-black dark:text-rich-black" />}
            className="mt-3 self-start"
            onPress={() => router.push('/plan')}
          />
        </View>
      </View>
    </Card>
  );
}

export type ProLockScreenProps = {
  title: string;
  subtitle?: string;
  featureTitle?: string;
  message?: string;
  showBack?: boolean;
};

export function ProLockScreen({
  title,
  subtitle,
  featureTitle = 'Pro feature',
  message = DEFAULT_PRO_LOCK_MESSAGE,
  showBack = true,
}: ProLockScreenProps) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <PageHeader title={title} subtitle={subtitle} showBack={showBack} />
      <EmptyState
        icon={Lock}
        title={featureTitle}
        message={message}
        action={
          <Button
            label="Explore Pro"
            variant="primary"
            leftIcon={<Crown size={18} className="text-rich-black dark:text-rich-black" />}
            onPress={() => router.push('/plan')}
          />
        }
      />
    </View>
  );
}