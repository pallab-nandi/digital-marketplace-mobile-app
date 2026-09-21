import { ScrollView, Text, View } from 'react-native';

import { Card, PageHeader, SectionHeader, Switch } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { NOTIFICATION_TYPE_META } from '@/features/notifications/meta';
import { useStore } from '@/store';
import type { NotificationType } from '@/types';

const TYPE_LABELS: Record<NotificationType, { label: string; hint: string }> = {
  campaign: { label: 'Campaign alerts', hint: 'Launches, pauses and draft changes' },
  analytics: { label: 'Analytics updates', hint: 'Performance and trend digests' },
  budget: { label: 'Budget alerts', hint: 'Spending near the monthly cap' },
  ai: { label: 'AI suggestions', hint: 'Recommendations from the assistant' },
  creator: { label: 'Creator activity', hint: 'Saved creators and collaboration requests' },
  system: { label: 'System', hint: 'Account and demo updates' },
};

export default function NotificationPreferencesScreen() {
  const { state, dispatch } = useStore();
  const prefs = state.preferences.notifications;

  function toggle(type: NotificationType, enabled: boolean) {
    dispatch({ type: 'SET_NOTIFICATION_PREFERENCE', notificationType: type, enabled });
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Preferences" subtitle="Choose what shows in your feed" />

      <View className="px-4 gap-3">
        <SectionHeader title="Notifications" />
        <Card>
          {(Object.keys(TYPE_LABELS) as NotificationType[]).map((type, index) => {
            const meta = NOTIFICATION_TYPE_META[type];
            const Icon = meta.Icon;
            const info = TYPE_LABELS[type];
            return (
              <View key={type}>
                {index > 0 && <View className="h-px bg-border dark:bg-border-dark mx-4" />}
                <View className="flex-row items-center gap-3 py-3">
                  <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10 dark:bg-primary-dark/15">
                    <Icon size={16} color={meta.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                      {info.label}
                    </Text>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      {info.hint}
                    </Text>
                  </View>
                  <Switch
                    value={prefs[type]}
                    onValueChange={(v) => toggle(type, v)}
                    accessibilityLabel={info.label}
                  />
                </View>
              </View>
            );
          })}
        </Card>
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark px-2">
          Muted types are hidden from the notification list until turned back on.
        </Text>
      </View>
    </ScrollView>
  );
}