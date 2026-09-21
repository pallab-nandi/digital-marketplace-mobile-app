import { useRouter } from 'expo-router';
import { ArrowRight, BarChart3, Bell, Rocket, Wallet, Wrench } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrendChart } from '@/components/charts/trend-chart';
import { Avatar, Badge, Button, Card, DashboardSkeleton, FadeInView, MetricCard, ProgressBar, SectionHeader, Skeleton, Tabs } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { NOTIFICATION_TYPE_META, notificationTimeLabel } from '@/features/notifications/meta';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import {
  getBusinessByUser,
  getCampaignPlatforms,
  getCampaignSpend,
  getDailyTrend,
  getDashboardVsPrevious,
  getPlatformPerformance,
  getPlatforms,
  type TrendMetric,
} from '@/services';
import { useStore } from '@/store';
import type { Period } from '@/types';

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

const TREND_METRICS: { key: TrendMetric; label: string; color: string }[] = [
  { key: 'spend', label: 'Spend', color: '#5B5CE2' },
  { key: 'revenue', label: 'Revenue', color: '#2563EB' },
  { key: 'conversions', label: 'Conversions', color: '#16A34A' },
];

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function compact(value: number): string {
  if (value >= 1000) {
    const v = value / 1000;
    return `${v % 1 === 0 ? Math.round(v) : v.toFixed(1)}k`;
  }
  return String(Math.round(value));
}

function shortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;
  const firstName = user?.name.split(' ')[0] ?? 'there';
  const insets = useSafeAreaInsets();
  const loading = useSimulatedLoading();

  const [period, setPeriod] = useState<Period>('30d');
  const [metric, setMetric] = useState<TrendMetric>('spend');

  const idPrefix = user ? user.id : '';

  const { current, previous } = getDashboardVsPrevious(idPrefix, period);
  const trend = getDailyTrend(idPrefix, period);
  const platformPerformance = user ? getPlatformPerformance(user.id, period) : [];
  const platformById = new Map(getPlatforms().map((p) => [p.id, p]));

  const metricConfig = TREND_METRICS.find((t) => t.key === metric) ?? TREND_METRICS[0];
  const chartData = useMemo(() => trend.map((t) => t[metric]), [trend, metric]);
  const chartLabels = useMemo(() => trend.map((t) => shortDate(t.date)), [trend]);

  const activeCampaigns = business
    ? state.campaigns
        .filter((c) => c.businessId === business.id && (c.status === 'active' || c.status === 'scheduled'))
        .slice(0, 4)
    : [];

  const unread = state.notifications.filter((n) => n.userId === user?.id && !n.isRead).length;

  const recentActivity = state.notifications
    .filter((n) => n.userId === user?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 4);

  const bestPlatform = platformPerformance[0];
  const totalConversions = current.totalConversions;
  const insightPct =
    bestPlatform && totalConversions > 0 ? Math.round((bestPlatform.conversions / totalConversions) * 100) : 0;

  const periodLabel = period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days';

  if (!user) return null;

  if (loading) {
    return (
      <ScrollView
        className="flex-1 bg-background dark:bg-background-dark"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
          <View className="flex-1 gap-1.5">
            <Skeleton width="45%" height={20} rounded="sm" />
            <Skeleton width="30%" height={12} />
          </View>
          <Skeleton width={40} height={40} rounded="full" />
          <Skeleton width={40} height={40} rounded="full" />
        </View>
        <View className="mx-4">
          <Skeleton width="100%" height={40} rounded="md" />
        </View>
        <View className="px-4 mt-3 gap-3">
          <DashboardSkeleton />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-1">
          <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">
            {greeting()}, {firstName}
          </Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            Your marketing overview
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Notifications"
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark relative">
          <Bell size={20} className="text-secondary-text dark:text-secondary-text-dark" />
          {unread > 0 && (
            <View className="absolute -top-1 -right-1 min-w-5 h-5 px-1 items-center justify-center rounded-full bg-danger dark:bg-danger-dark">
              <Text className="text-caption font-bold text-white">{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </Pressable>
        <Avatar name={user.name} size="md" />
      </View>

      <View className="mx-4">
        <Tabs
          items={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
          value={period}
          onChange={(key) => setPeriod(key as Period)}
          scrollable={false}
        />
      </View>

      <View className="flex-row flex-wrap gap-3 px-4 mt-3">
        <View className="basis-[140px] grow min-w-0">
          <MetricCard
            label="Total Spend"
            value={`₹${current.totalSpend.toLocaleString('en-IN')}`}
            animateTo={current.totalSpend}
            formatValue={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`}
            delta={pctDelta(current.totalSpend, previous.totalSpend)}
            icon={<Wallet size={16} className="text-secondary-text dark:text-secondary-text-dark" />}
          />
        </View>
        <View className="basis-[140px] grow min-w-0">
          <MetricCard
            label="Conversions"
            value={current.totalConversions.toLocaleString('en-IN')}
            animateTo={current.totalConversions}
            formatValue={(v) => Math.round(v).toLocaleString('en-IN')}
            delta={pctDelta(current.totalConversions, previous.totalConversions)}
            icon={<BarChart3 size={16} className="text-secondary-text dark:text-secondary-text-dark" />}
          />
        </View>
        <View className="basis-[140px] grow min-w-0">
          <MetricCard
            label="ROAS"
            value={`${current.roas.toFixed(2)}x`}
            animateTo={current.roas}
            formatValue={(v) => `${v.toFixed(2)}x`}
            delta={pctDelta(current.roas, previous.roas)}
            icon={<Rocket size={16} className="text-secondary-text dark:text-secondary-text-dark" />}
          />
        </View>
      </View>

      <View className="px-4 mt-4">
        <FadeInView>
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">
                Performance overview
              </Text>
              <Badge label={periodLabel} tone="neutral" />
            </View>
          <View className="mt-1">
            <Tabs
              items={TREND_METRICS.map((t) => ({ key: t.key, label: t.label }))}
              value={metric}
              onChange={(key) => setMetric(key as TrendMetric)}
              scrollable={false}
            />
          </View>
          <View className="mt-3 flex-row items-end gap-2">
            <Text className="text-h2 font-semibold text-primary-text dark:text-primary-text-dark">
              {metric === 'spend'
                ? `₹${current.totalSpend.toLocaleString('en-IN')}`
                : metric === 'revenue'
                  ? `₹${current.totalRevenue.toLocaleString('en-IN')}`
                  : current.totalConversions.toLocaleString('en-IN')}
            </Text>
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark pb-1">
              {metric === 'spend'
                ? `+${pctDelta(current.totalSpend, previous.totalSpend)}% vs prev. ${periodLabel}`
                : metric === 'revenue'
                  ? `+${pctDelta(current.totalRevenue, previous.totalRevenue)}% vs prev. ${periodLabel}`
                  : `+${pctDelta(current.totalConversions, previous.totalConversions)}% vs prev. ${periodLabel}`}
            </Text>
          </View>
          <View className="mt-3">
            <TrendChart
              data={chartData}
              labels={chartLabels}
              color={metricConfig.color}
              height={168}
              formatValue={compact}
            />
          </View>
          </Card>
        </FadeInView>
      </View>

      <View className="px-4 mt-4 gap-3">
        <SectionHeader
          title="Active campaigns"
          action={
            <Pressable onPress={() => router.push('/campaigns')} className="flex-row items-center gap-1 py-1">
              <Text className="text-small font-medium text-primary dark:text-primary-dark">View all</Text>
              <ArrowRight size={16} color="#5B5CE2" />
            </Pressable>
          }
        />
        {activeCampaigns.length === 0 ? (
          <Card>
            <Text className="text-body text-secondary-text dark:text-secondary-text-dark">
              No active campaigns yet. Create your first campaign to start tracking performance.
            </Text>
            <Button
              label="Create Campaign"
              variant="primary"
              size="sm"
              className="mt-3 self-start"
              onPress={() => router.push('/campaigns')}
            />
          </Card>
        ) : (
          activeCampaigns.map((campaign) => {
            const spend = getCampaignSpend(campaign);
            const rows = getCampaignPlatforms(campaign.id);
            const conversions = rows.reduce((sum, r) => sum + r.conversions, 0);
            const spentPct = campaign.totalBudget ? Math.min(100, (spend / campaign.totalBudget) * 100) : 0;
            const campaignPlatforms = rows
              .map((r) => platformById.get(r.platformId))
              .filter((p) => !!p);
            return (
              <Pressable
                key={campaign.id}
                onPress={() => router.push('/campaigns')}
                className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 active:opacity-80">
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 text-body font-semibold text-primary-text dark:text-primary-text-dark">
                    {campaign.name}
                  </Text>
                  <Badge
                    label={campaign.status === 'active' ? 'Active' : 'Scheduled'}
                    tone={campaign.status === 'active' ? 'success' : 'warning'}
                    dot
                  />
                </View>
                <View className="flex-row items-center gap-1.5 mt-2">
                  {campaignPlatforms.map((p) => (
                    <View
                      key={p.id}
                      className="flex-row items-center gap-1 border border-border dark:border-border-dark rounded-full px-2 py-0.5">
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: p.brandColorToken }} />
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        {p.name.replace(' Ads', '')}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className="flex-row items-center gap-2 mt-2">
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    ₹{spend.toLocaleString('en-IN')} of ₹{campaign.totalBudget.toLocaleString('en-IN')} ·{' '}
                    {conversions} conversions
                  </Text>
                </View>
                <ProgressBar progress={spentPct / 100} className="mt-2" />
              </Pressable>
            );
          })
        )}
      </View>

      <View className="px-4 mt-4 gap-3">
        <SectionHeader
          title="Recent activity"
          action={
            <Pressable onPress={() => router.push('/notifications')} className="flex-row items-center gap-1 py-1">
              <Text className="text-small font-medium text-primary dark:text-primary-dark">View all</Text>
              <ArrowRight size={16} className="text-primary dark:text-primary" />
            </Pressable>
          }
        />
        {recentActivity.length === 0 ? (
          <Card>
            <Text className="text-body text-secondary-text dark:text-secondary-text-dark">
              No activity yet. Alerts about your campaigns will show up here.
            </Text>
          </Card>
        ) : (
          <Card padded={false}>
            {recentActivity.map((n, i) => {
              const meta = NOTIFICATION_TYPE_META[n.type];
              const Icon = meta.Icon;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => router.push('/notifications')}
                  className={`flex-row items-center gap-3 px-4 py-3 active:opacity-80 ${i > 0 ? 'border-t border-border dark:border-border-dark' : ''}`}>
                  <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10 dark:bg-primary-dark/15">
                    <Icon size={16} color={meta.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark" numberOfLines={1}>
                      {n.message}
                    </Text>
                  </View>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    {notificationTimeLabel(n.createdAt)}
                  </Text>
                  {!n.isRead && <View className="w-2 h-2 rounded-full bg-primary dark:bg-primary-dark" />}
                </Pressable>
              );
            })}
          </Card>
        )}
      </View>

      <View className="px-4 mt-4 gap-3">
        <SectionHeader title="AI insight" />
        {user.mode === 'pro' && bestPlatform ? (
          <Card>
            <View className="flex-row items-center gap-2 pb-2 border-b border-border dark:border-border-dark">
              <View className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/15 items-center justify-center">
                <Rocket size={16} className="text-primary dark:text-primary" />
              </View>
              <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                Best performer · {periodLabel}
              </Text>
            </View>
            <Text className="text-body text-primary-text dark:text-primary-text-dark leading-6 mt-2">
              {platformById.get(bestPlatform.platformId)?.name} is generating{' '}
              <Text className="font-semibold text-primary dark:text-primary-dark">{insightPct}% of your conversions</Text>{' '}
              with a {bestPlatform.roas.toFixed(2)}x ROAS — your highest return this period.
            </Text>
            <Button
              label="Ask AI"
              variant="ghost"
              size="sm"
              className="mt-2 self-start"
              onPress={() => router.push('/ai')}
            />
            <Button
              label="View insight"
              variant="ghost"
              size="sm"
              className="mt-2 self-start"
              onPress={() => router.push('/analytics')}
            />
          </Card>
        ) : (
          <Card>
            <View className="flex-row items-center gap-2 pb-2 border-b border-border dark:border-border-dark">
              <View className="w-8 h-8 rounded-full bg-surface-muted dark:bg-surface-muted-dark items-center justify-center">
                <Wrench size={16} className="text-secondary-text dark:text-secondary-text-dark" />
              </View>
              <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                Unlock AI insights
              </Text>
            </View>
            <Text className="text-body text-secondary-text dark:text-secondary-text-dark leading-6 mt-2">
              Upgrade to Pro to get campaign intelligence, budget recommendations and performance insights
              powered by AI.
            </Text>
            <Button
              label="Upgrade to Pro"
              variant="primary"
              size="sm"
              className="mt-2 self-start"
              onPress={() => router.push('/profile')}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}