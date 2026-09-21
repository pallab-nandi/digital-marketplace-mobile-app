import { router } from 'expo-router';
import {
  Accessibility,
  Bell,
  Building2,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Copy,
  Crown,
  Info,
  LogOut,
  Moon,
  RefreshCcw,
  UserRoundPlus,
  Wallet,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Badge, BottomSheet, Button, Card, SectionHeader, useToast } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getBusinessByUser, getUsers } from '@/services';
import { useStore } from '@/store';
import type { UserRole } from '@/types';
import { cn } from '@/utils/cn';

function MenuRow({
  icon,
  label,
  onPress,
  right,
  rightIcon = true,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  rightIcon?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('flex-row items-center gap-3 px-4 py-3.5 active:opacity-70', !onPress && 'opacity-90')}>
      {icon}
      <Text
        className={cn(
          'flex-1 text-body',
          danger ? 'text-danger dark:text-danger-dark' : 'text-primary-text dark:text-primary-text-dark',
        )}>
        {label}
      </Text>
      {right}
      {rightIcon && <ChevronRight size={16} color="#9AA3AF" />}
    </Pressable>
  );
}

const ROLE_LABEL: Record<UserRole, string> = {
  business_owner: 'Business Owner',
  marketing_manager: 'Marketing Manager',
  creator: 'Creator',
};

export default function ProfileScreen() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;
  const isPro = user?.mode === 'pro';
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const users = useMemo(() => getUsers(), []);

  if (!user) return null;

  function handleReset() {
    setConfirmResetOpen(false);
    dispatch({ type: 'RESET_DEMO' });
    toast.success('Demo data restored');
  }

  function handleResetOnboarding() {
    dispatch({ type: 'RESET_ONBOARDING' });
    toast.success('Onboarding reset — walk through it again');
    router.replace('/(onboarding)');
  }

  function handleSignOut() {
    dispatch({ type: 'LOGOUT' });
    router.replace('/');
  }

  function switchUser(userId: string) {
    dispatch({ type: 'LOGIN', userId });
    toast.success('Switched demo user');
    setUserPickerOpen(false);
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center gap-2 px-4 pb-4" style={{ paddingTop: insets.top + 24 }}>
          <Avatar name={user.name} size="lg" />
          <View className="flex-row items-center gap-1.5">
            <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark">{user.name}</Text>
            {isPro && <Crown size={18} color="#D97706" />}
          </View>
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark">
            {ROLE_LABEL[user.role]}
          </Text>
          <Badge label={isPro ? 'Pro Plan' : 'Lite Plan'} tone={isPro ? 'primary' : 'neutral'} dot />
        </View>

        <View className="px-4 gap-4">
          <Card>
            <View className="flex-row items-center gap-2 pb-3 border-b border-border dark:border-border-dark">
              <Building2 size={18} color="#5B5CE2" />
              <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">
                {business?.name || 'Your Business'}
              </Text>
            </View>
            <MenuRow
              icon={<Wallet size={18} color="#69707D" />}
              label={`Budget ₹${user.monthlyBudget.toLocaleString('en-IN')} / month`}
              onPress={() => router.push('/business-settings')}
            />
            <View className="h-px bg-border dark:bg-border-dark mx-4" />
            <MenuRow
              icon={<Crown size={18} color="#D97706" />}
              label={`${isPro ? 'Pro' : 'Lite'} subscription`}
              right={
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                  {isPro ? '₹2,499 / mo' : 'Free'}
                </Text>
              }
              onPress={() => router.push('/plan')}
            />
          </Card>

          <View className="gap-3">
            <SectionHeader title="Personalization" />
            <Card>
              <MenuRow
                icon={<Moon size={18} color="#69707D" />}
                label="Appearance"
                right={
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark capitalize">
                    {state.appearance.theme}
                  </Text>
                }
                onPress={() => router.push('/appearance')}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow
                icon={<Bell size={18} color="#69707D" />}
                label="Notifications"
                onPress={() => router.push('/notifications')}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow
                icon={<Accessibility size={18} color="#69707D" />}
                label="Notification preferences"
                onPress={() => router.push('/settings')}
              />
            </Card>
          </View>

          <View className="gap-3">
            <SectionHeader title="Support" />
            <Card>
              <MenuRow
                icon={<Info size={18} color="#69707D" />}
                label="Help & About"
                onPress={() => router.push('/about')}
              />
            </Card>
          </View>

          <View className="gap-3">
            <SectionHeader title="Demo controls" />
            <Card>
              <MenuRow
                icon={<UserRoundPlus size={18} color="#69707D" />}
                label="Switch demo user"
                right={<Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{user.name}</Text>}
                onPress={() => setUserPickerOpen(true)}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow
                icon={<Copy size={18} color="#69707D" />}
                label={isPro ? 'Switch to Lite' : 'Switch to Pro'}
                right={
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    Pro unlocks AI + creators
                  </Text>
                }
                onPress={() => {
                  dispatch({ type: 'SWITCH_PLAN', mode: isPro ? 'lite' : 'pro' });
                  toast.success(isPro ? 'Switched to Lite' : 'Welcome to Pro');
                }}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow
                icon={<ClipboardList size={18} color="#69707D" />}
                label="Reset onboarding"
                right={
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    Replay signup flow
                  </Text>
                }
                onPress={handleResetOnboarding}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow
                icon={<RefreshCcw size={18} color="#69707D" />}
                label="Reset demo data"
                onPress={() => setConfirmResetOpen(true)}
              />
              <View className="h-px bg-border dark:bg-border-dark mx-4" />
              <MenuRow icon={<LogOut size={18} color="#DC2626" />} label="Sign out" danger onPress={handleSignOut} rightIcon={false} />
            </Card>
          </View>
        </View>
      </ScrollView>

      <BottomSheet visible={userPickerOpen} onClose={() => setUserPickerOpen(false)} title="Switch demo user">
        <View className="gap-2">
          {users.map((u) => {
            const active = u.id === user.id;
            return (
              <Pressable
                key={u.id}
                onPress={() => switchUser(u.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={cn(
                  'flex-row items-center gap-3 rounded-md px-3 py-3',
                  active && 'bg-primary/10 dark:bg-primary-dark/15',
                )}>
                <Avatar name={u.name} size="sm" />
                <View className="flex-1">
                  <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                    {u.name}
                  </Text>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    {ROLE_LABEL[u.role]} · {u.mode === 'pro' ? 'Pro' : 'Lite'}
                  </Text>
                </View>
                {active && <CircleCheck size={18} color="#5B5CE2" />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet visible={confirmResetOpen} onClose={() => setConfirmResetOpen(false)} title="Reset demo data?">
        <View className="gap-4 px-1 pb-1">
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark leading-6">
            This restores campaigns, analytics, creators, notifications and preferences to the original
            demo state. You stay signed in as {user.name}.
          </Text>
          <View className="flex-row gap-3">
            <Button label="Cancel" variant="outline" className="flex-1" onPress={() => setConfirmResetOpen(false)} />
            <Button label="Reset data" variant="danger" className="flex-1" onPress={handleReset} />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}