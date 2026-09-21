import { Bell, CheckCheck } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, EmptyState, NotificationListSkeleton, PageHeader } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { NOTIFICATION_TYPE_META, notificationTimeLabel } from '@/features/notifications/meta';
import { getBusinessByUser } from '@/services';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useStore } from '@/store';

function timeLabel(iso: string): string {
  return notificationTimeLabel(iso);
}

export default function NotificationsScreen() {
  const { state, dispatch } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;
  const prefs = state.preferences.notifications;
  const loading = useSimulatedLoading();
  const notifications = state.notifications
    .filter((n) => n.userId === user?.id)
    .filter((n) => prefs[n.type])
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const today = notifications.filter((n) => n.createdAt.startsWith('2026-09-18'));
  const earlier = notifications.filter((n) => !n.createdAt.startsWith('2026-09-18'));

  function renderGroup(title: string, items: typeof notifications) {
    if (items.length === 0) return null;
    return (
      <View className="gap-2">
        <Text className="text-small font-semibold text-secondary-text dark:text-secondary-text-dark px-4 pt-2">
          {title}
        </Text>
        {items.map((n) => {
          const meta = NOTIFICATION_TYPE_META[n.type];
          const Icon = meta.Icon;
          return (
            <Pressable
              key={n.id}
              onPress={() => {
                if (!n.isRead) dispatch({ type: 'MARK_NOTIFICATION_READ', notifId: n.id });
              }}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 active:opacity-80">
              <View className="flex-row gap-3">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-primary/10 dark:bg-primary-dark/15">
                  <Icon size={18} color={meta.color} />
                </View>
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="flex-1 text-body font-semibold text-primary-text dark:text-primary-text-dark">
                      {n.title}
                    </Text>
                    {!n.isRead && <View className="w-2 h-2 rounded-full bg-primary dark:bg-primary-dark" />}
                  </View>
                  <Text className="text-small text-secondary-text dark:text-secondary-text-dark leading-5">
                    {n.message}
                  </Text>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    {timeLabel(n.createdAt)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <PageHeader
        title="Notifications"
        subtitle={business?.name}
        right={
          notifications.some((n) => !n.isRead) ? (
            <Pressable
              onPress={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
              accessibilityLabel="Mark all as read"
              hitSlop={8}
              className="w-9 h-9 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
              <CheckCheck size={18} color="#69707D" />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="px-4 pt-2 gap-2">
            <NotificationListSkeleton count={4} />
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" message="New alerts will show up here." />
        ) : (
          <View className="gap-4">
            {renderGroup('Today', today)}
            {renderGroup('Earlier', earlier)}
          </View>
        )}
        <View className="px-4 mt-4">
          <Badge label="Demo account" tone="neutral" />
        </View>
      </ScrollView>
    </View>
  );
}