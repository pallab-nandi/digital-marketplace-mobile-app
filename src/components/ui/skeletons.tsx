import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';

export function MetricCardSkeleton() {
  return (
    <View className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-md p-4 gap-2">
      <Skeleton width="55%" height={12} />
      <Skeleton width="70%" height={18} rounded="sm" />
      <Skeleton width="40%" height={12} />
    </View>
  );
}

export function ChartSkeleton() {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Skeleton width="45%" height={16} rounded="sm" />
        <Skeleton width={56} height={16} rounded="full" />
      </View>
      <Skeleton width="100%" height={150} rounded="md" />
    </View>
  );
}

export function CampaignCardSkeleton() {
  return (
    <View className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 gap-2.5">
      <View className="flex-row items-center gap-3">
        <Skeleton width="55%" height={16} rounded="sm" />
        <Skeleton width={18} height={18} rounded="full" />
      </View>
      <Skeleton width="70%" height={12} />
      <Skeleton width="100%" height={8} rounded="full" />
      <View className="flex-row justify-between">
        <Skeleton width="40%" height={12} />
        <Skeleton width="32%" height={12} />
      </View>
    </View>
  );
}

export function CampaignListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function CreatorCardSkeleton() {
  return (
    <View className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark overflow-hidden">
      <Skeleton height={132} rounded="sm" />
      <View className="p-3 gap-2">
        <View className="flex-row items-center gap-2">
          <Skeleton width={32} height={32} rounded="full" />
          <View className="flex-1 gap-1.5">
            <Skeleton width="60%" height={12} />
            <Skeleton width="40%" height={10} />
          </View>
        </View>
        <Skeleton width="70%" height={12} />
        <Skeleton width="45%" height={12} />
      </View>
    </View>
  );
}

export function CreatorListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CreatorCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function NotificationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="flex-row gap-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4">
          <Skeleton width={40} height={40} rounded="full" />
          <View className="flex-1 gap-2">
            <Skeleton width="50%" height={12} />
            <Skeleton width="85%" height={12} />
            <Skeleton width="30%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <MetricCardSkeleton />
        </View>
        <View className="flex-1">
          <MetricCardSkeleton />
        </View>
        <View className="flex-1">
          <MetricCardSkeleton />
        </View>
      </View>
      <View className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4">
        <ChartSkeleton />
      </View>
      <CampaignListSkeleton count={2} />
    </View>
  );
}