import { useLocalSearchParams } from 'expo-router';
import { AlertTriangle, BarChart3, CheckCircle2, Eye, Info, MousePointerClick, Rocket, Wallet } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BarChart } from '@/components/charts/bar-chart';
import { DoughnutChart } from '@/components/charts/doughnut-chart';
import { TrendChart } from '@/components/charts/trend-chart';
import { Badge, Card, EmptyState, FilterChip, MetricCard, PageHeader, ProLockScreen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CAMPAIGN_STATUS_META } from '@/features/campaigns/status';
import {
  aggregateMetrics,
  getDailyMetrics,
  getFilteredTrend,
  getInsights,
  getKpisVsPrevious,
  getPlatforms,
  hasFeature,
  type TrendMetric,
} from '@/services';
import { useStore } from '@/store';
import type { Period, PlatformId } from '@/types';

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

const METRICS: { key: TrendMetric; label: string; color: string }[] = [
  { key: 'spend', label: 'Spend', color: '#5B5CE2' },
  { key: 'revenue', label: 'Revenue', color: '#2563EB' },
  { key: 'conversions', label: 'Conversions', color: '#16A34A' },
];

function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

function shortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const INSIGHT_ICON = { positive: CheckCircle2, negative: AlertTriangle, neutral: Info };
const INSIGHT_COLOR = { positive: '#16A34A', negative: '#D97706', neutral: '#2563EB' };

export default function CampaignAnalyticsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const campaign = state.campaigns.find((c) => c.id === params.id);

  const [period, setPeriod] = useState<Period>('30d');
  const [metric, setMetric] = useState<TrendMetric>('spend');
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);

  const rows = useMemo(
    () => getDailyMetrics({ campaignIds: [params.id], platformIds: platformId ? [platformId] : undefined, period }),
    [params.id, platformId, period],
  );
  const kpis = useMemo(() => aggregateMetrics(rows), [rows]);
  const vsPrevious = useMemo(
    () => getKpisVsPrevious({ campaignIds: [params.id], platformIds: platformId ? [platformId] : undefined, period }),
    [params.id, platformId, period],
  );
  const trend = useMemo(
    () => getFilteredTrend({ campaignIds: [params.id], platformIds: platformId ? [platformId] : undefined, period }),
    [params.id, platformId, period],
  );

  const breakdown = useMemo(() => {
    const all = getDailyMetrics({ campaignIds: [params.id], period });
    const map = new Map<PlatformId, typeof all>();
    for (const r of all) {
      const list = map.get(r.platformId as PlatformId) ?? [];
      list.push(r);
      map.set(r.platformId as PlatformId, list);
    }
    return [...map.entries()]
      .map(([id, list]) => ({ id, k: aggregateMetrics(list) }))
      .sort((a, b) => b.k.totalSpend - a.k.totalSpend);
  }, [params.id, period]);

  const platformById = new Map(getPlatforms().map((p) => [p.id, p]));
  const platformColor = (id: string) => platformById.get(id)?.brandColorToken ?? '#69707D';
  const insights = getInsights(params.id);
  const hasData = rows.length > 0;
  const metricConfig = METRICS.find((m) => m.key === metric) ?? METRICS[0];
  const chartData = trend.map((t) => t[metric]);
  const chartLabels = trend.map((t) => shortDate(t.date));
  const breakdownTotal = breakdown.reduce((s, b) => s + b.k.totalSpend, 0);

  if (!campaign) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title="Campaign analytics" subtitle="Not found" />
        <EmptyState icon={BarChart3} title="Campaign not found" message="This campaign may have been removed." />
      </View>
    );
  }

  if (!hasFeature(state.currentUser?.mode ?? 'lite', 'analytics')) {
    return (
      <ProLockScreen
        title="Campaign analytics"
        subtitle={campaign.name}
        featureTitle="Detailed analytics is a Pro feature"
        message="Unlock platform breakdowns, budget distribution and AI insights for each campaign with Pro."
      />
    );
  }

  const statusMeta = CAMPAIGN_STATUS_META[campaign.status];

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Campaign analytics" subtitle={campaign.name} />

      <View className="px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-4">
            {PERIODS.map((p) => (
              <FilterChip key={p.key} label={p.label} selected={period === p.key} onPress={() => setPeriod(p.key)} />
            ))}
            <FilterChip label="All platforms" selected={platformId === null} onPress={() => setPlatformId(null)} />
            {breakdown.map((b) => (
              <FilterChip
                key={b.id}
                label={platformById.get(b.id)?.name.replace(' Ads', '') ?? b.id}
                selected={platformId === b.id}
                onPress={() => setPlatformId(b.id)}
              />
            ))}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2 pr-4">
            {METRICS.map((m) => (
              <FilterChip key={m.key} label={m.label} selected={metric === m.key} onPress={() => setMetric(m.key)} />
            ))}
            <Badge label={statusMeta.label} tone={statusMeta.tone} dot className="my-auto" />
          </View>
        </ScrollView>
      </View>

      {!hasData ? (
        <View className="px-4 mt-6">
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            message="This campaign has no tracked metrics in the selected period yet — it will earn data as it runs."
          />
        </View>
      ) : (
        <>
          <View className="px-4 pt-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-4">
                <View className="w-40">
                  <MetricCard
                    label="Spend"
                    value={formatINR(kpis.totalSpend)}
                    delta={pctDelta(vsPrevious.current.totalSpend, vsPrevious.previous.totalSpend)}
                    icon={<Wallet size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Conversions"
                    value={kpis.totalConversions.toLocaleString('en-IN')}
                    delta={pctDelta(vsPrevious.current.totalConversions, vsPrevious.previous.totalConversions)}
                    icon={<Rocket size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="ROAS"
                    value={`${kpis.roas.toFixed(2)}x`}
                    delta={pctDelta(vsPrevious.current.roas, vsPrevious.previous.roas)}
                    icon={<BarChart3 size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Impressions"
                    value={compact(kpis.totalImpressions)}
                    delta={pctDelta(vsPrevious.current.totalImpressions, vsPrevious.previous.totalImpressions)}
                    icon={<Eye size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Clicks"
                    value={compact(kpis.totalClicks)}
                    delta={pctDelta(vsPrevious.current.totalClicks, vsPrevious.previous.totalClicks)}
                    icon={<MousePointerClick size={16} color="#69707D" />}
                  />
                </View>
              </View>
            </ScrollView>
          </View>

          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                  {metricConfig.label} trend
                </Text>
                <Badge label={period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'} tone="primary" />
              </View>
              <View className="mt-3">
                <TrendChart
                  data={chartData}
                  labels={chartLabels}
                  color={metricConfig.color}
                  height={170}
                  formatValue={(v) => (metric === 'conversions' ? String(Math.round(v)) : compact(v))}
                />
              </View>
            </Card>
          </View>

          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Platform performance" subtitle="Spend by platform for this campaign" />
            <Card>
              <BarChart
                data={breakdown.map((b) => ({
                  label: platformById.get(b.id)?.name.replace(' Ads', '') ?? b.id,
                  value: b.k.totalSpend,
                  color: platformColor(b.id),
                }))}
                height={170}
              />
            </Card>
          </View>

          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Budget distribution" subtitle="Platform mix in the selected period" />
            <Card>
              <View className="flex-row items-center gap-4">
                <DoughnutChart
                  data={breakdown.map((b) => ({ label: b.id, value: b.k.totalSpend, color: platformColor(b.id) }))}
                  size={150}
                  thickness={24}
                  centerValue={compact(breakdownTotal)}
                  centerLabel="total spend"
                />
                <View className="flex-1 gap-2">
                  {breakdown.map((b) => (
                    <View key={b.id} className="flex-row items-center gap-2">
                      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platformColor(b.id) }} />
                      <Text className="flex-1 text-small text-primary-text dark:text-primary-text-dark">
                        {platformById.get(b.id)?.name.replace(' Ads', '')}
                      </Text>
                      <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                        {breakdownTotal > 0 ? Math.round((b.k.totalSpend / breakdownTotal) * 100) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>

          {insights.length > 0 && (
            <View className="px-4 mt-4 gap-3">
              <SectionHeader title="Insights" subtitle="For this campaign" />
              {insights.map((insight) => {
                const Icon = INSIGHT_ICON[insight.type] ?? Info;
                return (
                  <Card key={insight.id} className="flex-row gap-3">
                    <View className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary-dark/15 items-center justify-center self-start">
                      <Icon size={16} color={INSIGHT_COLOR[insight.type] ?? '#5B5CE2'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                        {insight.title}
                      </Text>
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
                        {insight.description}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}