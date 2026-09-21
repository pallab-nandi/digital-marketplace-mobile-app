import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Avatar, Badge, PageHeader } from '@/components/ui';
import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { getUsers } from '@/services';
import { useStore } from '@/store';

const ROLE_LABEL: Record<string, string> = {
  business_owner: 'Business Owner',
  marketing_manager: 'Marketing Manager',
  creator: 'Creator',
};

export default function DemoUsersScreen() {
  const { dispatch } = useStore();
  const users = getUsers();

  function handleSelect(userId: string) {
    dispatch({ type: 'LOGIN', userId });
    router.replace('/');
  }

  return (
    <AuthScaffold scroll={false}>
      <PageHeader title="Demo accounts" subtitle="Jump into a ready-made demo" showBack />

      <View className="gap-3 mt-2">
        <View className="flex-row items-center gap-2 mb-1">
          <Sparkles size={16} color="#5B5CE2" />
          <Text className="text-small text-secondary-text dark:text-secondary-text-dark flex-1">
            Each account comes preloaded with campaigns, analytics, creators and notifications.
          </Text>
        </View>

        {users.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => handleSelect(user.id)}
            className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 active:opacity-80">
            <View className="flex-row items-center gap-3">
              <Avatar name={user.name} />
              <View className="flex-1 gap-1">
                <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                  {user.name}
                </Text>
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                  {ROLE_LABEL[user.role] ?? user.role} · {user.email}
                </Text>
              </View>
              <Badge label={user.mode === 'pro' ? 'Pro' : 'Lite'} tone={user.mode === 'pro' ? 'primary' : 'neutral'} />
            </View>
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-2">
              {user.industry || 'Business'} account
            </Text>
          </Pressable>
        ))}
      </View>
    </AuthScaffold>
  );
}