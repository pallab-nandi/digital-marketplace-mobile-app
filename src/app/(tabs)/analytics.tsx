import { useRouter } from 'expo-router';
import { AlertTriangle, BarChart3, CheckCircle2, Info, MousePointerClick, Rocket, SlidersHorizontal, Wallet, Eye } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart } from '@/components/charts/bar-chart';
import { ComparisonBars } from '@/components/charts/comparison-bars';
import { DoughnutChart } from '@/components/charts/doughnut-chart';
import { TrendChart } from '@/components/charts/trend-chart';
import { Badge, BottomSheet, Button, Card, ChartSkeleton, EmptyState, FadeInView, FilterChip, MetricCard, MetricCardSkeleton, ProLockCard, SectionHeader, Skeleton, Select } from '@/components/ui';
import { MaxContentWidth, Spacing, Colors } from '@/constants/theme';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import {
  aggregateMetrics,
  getBusinessByUser,
  getDailyMetrics,
  getFilteredTrend,
  getInsights,
  getKpisVsPrevious,
  getPlatforms,
  hasFeature,
  type TrendMetric,
} from '@/services';
import { useStore } from '@/store';
import type { Insight, Kpis, Period, PlatformId } from '@/types';

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

function metricValue(kpis: Kpis, metric: TrendMetric): number {
  if (metric === 'revenue') return kpis.totalRevenue;
  if (metric === 'conversions') return kpis.totalConversions;
  return kpis.totalSpend;
}

function metricDelta(vs: { current: Kpis; previous: Kpis }, metric: TrendMetric): number {
  return pctDelta(metricValue(vs.current, metric), metricValue(vs.previous, metric));
}

function formatMetric(metric: TrendMetric, value: number): string {
  if (metric === 'conversions') return String(Math.round(value));
  return formatINR(value);
}

const INSIGHT_ICON = { positive: CheckCircle2, negative: AlertTriangle, neutral: Info };
const INSIGHT_COLOR = { positive: '#16A34A', negative: '#D97706', neutral: '#2563EB' };

export default function AnalyticsScreen() {
  const router = useRouter();
  const { state } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;
  const insets = useSafeAreaInsets();
  const loading = useSimulatedLoading();

  const [period, setPeriod] = useState<Period>('30d');
  const [metric, setMetric] = useState<TrendMetric>('spend');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const businessCampaigns = useMemo(
    () => (business ? state.campaigns.filter((c) => c.businessId === business!.id && !c.isArchived) : []),
    [state.campaigns, business],
  );
  const campaignIds = useMemo(
    () => (campaignId ? [campaignId] : businessCampaigns.map((c) => c.id)),
    [campaignId, businessCampaigns],
  );
  const platformIds = useMemo(() => (platformId ? [platformId] : undefined), [platformId]);

  const rows = useMemo(
    () => getDailyMetrics({ campaignIds, platformIds, period }),
    [campaignIds, platformIds, period],
  );
  const kpis = useMemo(() => aggregateMetrics(rows), [rows]);
  const vsPrevious = useMemo(
    () => getKpisVsPrevious({ campaignIds, platformIds, period }),
    [campaignIds, platformIds, period],
  );
  const trend = useMemo(
    () => getFilteredTrend({ campaignIds, platformIds, period }),
    [campaignIds, platformIds, period],
  );

  const breakdown = useMemo(() => {
    const all = getDailyMetrics({ campaignIds, period });
    const map = new Map<PlatformId, typeof all>();
    for (const r of all) {
      const list = map.get(r.platformId as PlatformId) ?? [];
      list.push(r);
      map.set(r.platformId as PlatformId, list);
    }
    return [...map.entries()]
      .map(([id, list]) => ({ id, k: aggregateMetrics(list) }))
      .sort((a, b) => b.k.totalSpend - a.k.totalSpend);
  }, [campaignIds, period]);

  const comparison = useMemo(() => {
    const all = getDailyMetrics({ campaignIds: businessCampaigns.map((c) => c.id), platformIds, period });
    const map = new Map<string, typeof all>();
    for (const r of all) {
      const list = map.get(r.campaignId) ?? [];
      list.push(r);
      map.set(r.campaignId, list);
    }
    return [...map.entries()]
      .map(([id, list]) => {
        const k = aggregateMetrics(list);
        const campaign = businessCampaigns.find((c) => c.id === id);
        return { id, k, name: campaign?.name ?? id };
      })
      .sort((a, b) => b.k.totalSpend - a.k.totalSpend);
  }, [businessCampaigns, platformIds, period]);

  const platformById = new Map(getPlatforms().map((p) => [p.id, p]));
  const platformColor = (id: string) => platformById.get(id)?.brandColorToken ?? '#69707D';
  const insights = getInsights(campaignId);
  const hasAdvanced = hasFeature(user?.mode ?? 'lite', 'analytics');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = (period !== '30d' ? 1 : 0) + (metric !== 'spend' ? 1 : 0) + (campaignId !== null ? 1 : 0) + (platformId !== null ? 1 : 0);

  const metricConfig = METRICS.find((m) => m.key === metric) ?? METRICS[0];
  const chartData = trend.map((t) => t[metric]);
  const chartLabels = trend.map((t) => shortDate(t.date));

  const periodLabel = period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days';
  const campaignLabel = campaignId ? businessCampaigns.find((c) => c.id === campaignId)?.name ?? 'selected campaign' : 'all campaigns';
  const breakdownTotal = breakdown.reduce((s, b) => s + b.k.totalSpend, 0);
  const hasData = rows.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <View className="px-4 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">Analytics</Text>
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
          {loading ? 'Crunching numbers…' : `${business?.name ?? 'Your business'} · ${periodLabel}`}
        </Text>
      </View>

      {loading ? (
        <View className="px-4 mt-2 gap-3">
          <Skeleton width="100%" height={40} rounded="md" />
          <Skeleton width="100%" height={40} rounded="md" />
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
          <Card>
            <ChartSkeleton />
          </Card>
        </View>
      ) : (
        <>
      <View className="flex-row items-center gap-2 px-4 pb-2">
        <Pressable
          onPress={() => setFiltersOpen(true)}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2">
          <SlidersHorizontal size={14} color={colors.textSecondary} />
          <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <View className="w-4 h-4 rounded-full bg-primary dark:bg-primary-dark items-center justify-center">
              <Text className="text-caption font-bold text-rich-black dark:text-rich-black">{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {!hasData ? (
        <View className="px-4 mt-6">
          <EmptyState
            icon={BarChart3}
            title="No data for these filters"
            message="Try a wider period, another platform or clear the campaign filter."
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
                    animateTo={kpis.totalSpend}
                    formatValue={(v) => formatINR(v)}
                    delta={pctDelta(vsPrevious.current.totalSpend, vsPrevious.previous.totalSpend)}
                    icon={<Wallet size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Conversions"
                    value={kpis.totalConversions.toLocaleString('en-IN')}
                    animateTo={kpis.totalConversions}
                    formatValue={(v) => Math.round(v).toLocaleString('en-IN')}
                    delta={pctDelta(vsPrevious.current.totalConversions, vsPrevious.previous.totalConversions)}
                    icon={<Rocket size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="ROAS"
                    value={`${kpis.roas.toFixed(2)}x`}
                    animateTo={kpis.roas}
                    formatValue={(v) => `${v.toFixed(2)}x`}
                    goodWhenDown={false}
                    delta={pctDelta(vsPrevious.current.roas, vsPrevious.previous.roas)}
                    icon={<BarChart3 size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Impressions"
                    value={compact(kpis.totalImpressions)}
                    animateTo={kpis.totalImpressions}
                    formatValue={(v) => compact(v)}
                    delta={pctDelta(vsPrevious.current.totalImpressions, vsPrevious.previous.totalImpressions)}
                    icon={<Eye size={16} color="#69707D" />}
                  />
                </View>
                <View className="w-40">
                  <MetricCard
                    label="Clicks"
                    value={compact(kpis.totalClicks)}
                    animateTo={kpis.totalClicks}
                    formatValue={(v) => compact(v)}
                    delta={pctDelta(vsPrevious.current.totalClicks, vsPrevious.previous.totalClicks)}
                    icon={<MousePointerClick size={16} color="#69707D" />}
                  />
                </View>
              </View>
            </ScrollView>
          </View>

          <View className="px-4 mt-4">
            <FadeInView>
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                    {metricConfig.label} trend
                  </Text>
                  <Badge label={periodLabel} tone="primary" />
                </View>
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
                {campaignLabel}{platformId ? ` · ${platformById.get(platformId)?.name?.replace(' Ads', '')}` : ''} ·{' '}
                {formatMetric(metric, metricValue(kpis, metric))} {metricDelta(vsPrevious, metric)}% vs previous period
              </Text>
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
            </FadeInView>
          </View>

          {hasAdvanced ? (
            <>
              <View className="px-4 mt-4 gap-3">
                <SectionHeader title="Platform performance" subtitle={`Spend by platform · ${campaignLabel} in ${periodLabel}`} />
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
                <SectionHeader title="Budget distribution" subtitle={`Platform mix · ${periodLabel}`} />
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

              <View className="px-4 mt-4 gap-3">
                <SectionHeader title="Campaign comparison" subtitle={`Spend vs results · ${periodLabel}`} />
                <Card>
                  <ComparisonBars
                    data={comparison.map((c) => ({
                      key: c.id,
                      label: c.name,
                      value: c.k.totalSpend,
                      caption: `${c.k.totalConversions} conversions · ${c.k.roas.toFixed(2)}x ROAS`,
                      onPress: () => router.push({ pathname: '/analytics/[id]', params: { id: c.id } }),
                    }))}
                    formatValue={formatINR}
                  />
                </Card>
              </View>

              {insights.length > 0 && (
                <View className="px-4 mt-4 gap-3">
                  <SectionHeader title="Insights" subtitle={campaignId ? 'For the selected campaign' : 'Across your account'} />
                  {insights.map((insight: Insight) => {
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
          ) : (
            <View className="px-4 mt-4">
              <ProLockCard
                title="Advanced analytics is a Pro feature"
                message="Unlock platform breakdowns, budget distribution, campaign comparison and AI insights with Pro. Your core KPIs and trend stay available."
              />
            </View>
          )}
        </>
      )}
      </>
      )}

      <BottomSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter analytics">
        <View className="gap-3">
          <Select
            label="Period"
            value={period}
            onChange={(v) => setPeriod(v as Period)}
            options={PERIODS.map((p) => ({ label: p.label, value: p.key }))}
          />
          <Select
            label="Metric"
            value={metric}
            onChange={(v) => setMetric(v as TrendMetric)}
            options={METRICS.map((m) => ({ label: m.label, value: m.key }))}
          />
          <View className="gap-1.5">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Platform</Text>
            <View className="flex-row flex-wrap gap-2">
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
          </View>
          <Select
            label="Campaign"
            value={campaignId ?? 'all'}
            onChange={(v) => setCampaignId(v === 'all' ? null : v)}
            options={[{ label: 'All campaigns', value: 'all' }, ...businessCampaigns.map((c) => ({ label: c.name, value: c.id }))]}
          />
          <View className="flex-row gap-2 pt-1">
            <Button label="Reset" variant="outline" onPress={() => { setPeriod('30d'); setMetric('spend'); setCampaignId(null); setPlatformId(null); }} className="flex-1" />
            <Button label="Done" className="flex-1" onPress={() => setFiltersOpen(false)} />
          </View>
        </View>
      </BottomSheet>
    </ScrollView>
  );
}