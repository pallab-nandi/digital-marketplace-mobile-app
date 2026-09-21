import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart3, CalendarDays, Eye, Lightbulb, Link2, MoreHorizontal, MousePointerClick, Pause, Play, Rocket, Sparkles, Wallet } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TrendChart } from '@/components/charts/trend-chart';
import { Badge, Button, CampaignCardSkeleton, Card, ChartSkeleton, EmptyState, MetricCard, MetricCardSkeleton, PageHeader, ProgressBar, ProLockCard, SectionHeader, Skeleton, Tabs, useToast } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CampaignActionsSheet } from '@/features/campaigns/campaign-actions';
import { CAMPAIGN_STATUS_META } from '@/features/campaigns/status';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { getAudienceById, getCampaignTrend, getCreatives, getInsights, getPlatforms, hasFeature, summarizeCampaignPlatforms } from '@/services';
import { useStore } from '@/store';
import type { PlatformId } from '@/types';

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function shortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function CampaignDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const toast = useToast();

  const campaign = state.campaigns.find((c) => c.id === params.id);
  const [tab, setTab] = useState('overview');
  const [sheetVisible, setSheetVisible] = useState(false);
  const loading = useSimulatedLoading();

  const rows = useMemo(
    () => state.campaignPlatforms.filter((cp) => cp.campaignId === params.id),
    [state.campaignPlatforms, params.id],
  );
  const platformById = new Map(getPlatforms().map((p) => [p.id, p]));

  if (!campaign) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title="Campaign" subtitle="Not found" />
        <EmptyState
          icon={Rocket}
          title="Campaign not found"
          message="This campaign may have been removed."
          action={<Button label="Back to campaigns" onPress={() => router.replace('/campaigns')} />}
        />
      </View>
    );
  }

  const statusMeta = CAMPAIGN_STATUS_META[campaign.status];
  const kpis = summarizeCampaignPlatforms(rows);
  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...rows.map((r) => ({ key: r.platformId, label: platformById.get(r.platformId)?.name.replace(' Ads', '') ?? r.platformId })),
  ];
  const activeTabId: PlatformId | undefined = tab === 'overview' ? undefined : (tab as PlatformId);
  const trend = getCampaignTrend(campaign.id, '30d', activeTabId);
  const tabRows = activeTabId ? rows.filter((r) => r.platformId === activeTabId) : rows;
  const tabKpis = summarizeCampaignPlatforms(tabRows);

  const audience = campaign.audienceId ? getAudienceById(campaign.audienceId) : undefined;
  const creatives = getCreatives(campaign.id);
  const insights = getInsights(campaign.id);
  const durationDays = campaign.endDate
    ? Math.max(1, Math.round((new Date(`${campaign.endDate}T00:00:00Z`).getTime() - new Date(`${campaign.startDate}T00:00:00Z`).getTime()) / 86400000) + 1)
    : 0;
  const spentPct = campaign.totalBudget ? Math.min(100, (kpis.spend / campaign.totalBudget) * 100) : 0;

  if (loading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title={campaign.name} subtitle={`${statusMeta.label} · ${campaign.objective.replace('_', ' ')}`} />
        <ScrollView
          contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
          showsVerticalScrollIndicator={false}>
          <View className="px-4 pt-2 gap-3">
            <Skeleton width="100%" height={44} rounded="md" />
            <View className="flex-row gap-3">
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
            <CampaignCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <PageHeader
        title={campaign.name}
        subtitle={`${statusMeta.label} · ${campaign.objective.replace('_', ' ')}`}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push({ pathname: '/ai', params: { campaignId: campaign.id } })}
              accessibilityLabel="Ask AI about this campaign"
              hitSlop={8}
              className="w-9 h-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/15">
              <Sparkles size={18} color="#5B5CE2" />
            </Pressable>
            <Pressable
              onPress={() => setSheetVisible(true)}
              accessibilityLabel="Campaign actions"
              hitSlop={8}
              className="w-9 h-9 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
              <MoreHorizontal size={20} color="#69707D" />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}>
        {(campaign.status === 'active' || campaign.status === 'scheduled' || campaign.status === 'paused') && (
          <View className="px-4 pb-2">
            {campaign.status === 'paused' ? (
              <Button
                label="Resume campaign"
                fullWidth
                leftIcon={<Play size={18} color="#FFFFFF" />}
                onPress={() => {
                  dispatch({ type: 'RESUME_CAMPAIGN', campaignId: campaign.id });
                  toast.success('Campaign resumed');
                }}
              />
            ) : (
              <Button
                label="Pause campaign"
                variant="outline"
                fullWidth
                leftIcon={<Pause size={18} color="#69707D" />}
                onPress={() => {
                  dispatch({ type: 'PAUSE_CAMPAIGN', campaignId: campaign.id });
                  toast.success('Campaign paused');
                }}
              />
            )}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pt-2">
          <View className="flex-row gap-3 pr-4">
            <View className="w-40">
              <MetricCard label="Spend" value={formatINR(kpis.spend)} icon={<Wallet size={16} color="#69707D" />} />
            </View>
            <View className="w-40">
              <MetricCard label="Impressions" value={kpis.impressions.toLocaleString('en-IN')} icon={<Eye size={16} color="#69707D" />} />
            </View>
            <View className="w-40">
              <MetricCard label="Clicks" value={kpis.clicks.toLocaleString('en-IN')} icon={<MousePointerClick size={16} color="#69707D" />} />
            </View>
            <View className="w-40">
              <MetricCard label="Conversions" value={kpis.conversions.toLocaleString('en-IN')} icon={<BarChart3 size={16} color="#69707D" />} />
            </View>
            <View className="w-40">
              <MetricCard label="ROAS" value={`${kpis.roas.toFixed(2)}x`} icon={<Rocket size={16} color="#69707D" />} />
            </View>
          </View>
        </ScrollView>

        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">Performance</Text>
              <Badge label={statusMeta.label} tone={statusMeta.tone} dot />
            </View>
            <View className="mt-1">
              <Tabs items={tabs} value={tab} onChange={setTab} scrollable />
            </View>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className="text-h2 font-semibold text-primary-text dark:text-primary-text-dark">
                {formatINR(tabKpis.spend)}
              </Text>
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark pb-1">
                spent · {tabKpis.conversions} conversions · {tabKpis.roas.toFixed(2)}x ROAS
              </Text>
            </View>
            <View className="mt-3">
              <TrendChart
                data={trend.map((t) => t.spend)}
                labels={trend.map((t) => shortDate(t.date))}
                color="#5B5CE2"
                height={150}
                formatValue={(v) => (v >= 1000 ? `${((v / 1000).toFixed(1))}k` : String(Math.round(v)))}
              />
            </View>
          </Card>
        </View>

        <View className="px-4 mt-4 gap-3">
          <SectionHeader title="Platform allocation" />
          <Card padded={false}>
            {rows.length === 0 ? (
              <Text className="px-4 py-4 text-body text-secondary-text dark:text-secondary-text-dark">
                No platforms attached to this campaign yet.
              </Text>
            ) : (
              rows.map((row, i) => {
                const platform = platformById.get(row.platformId);
                return (
                  <View
                    key={row.id}
                    className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border dark:border-border-dark' : ''}`}>
                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform?.brandColorToken ?? '#69707D' }} />
                    <View className="flex-1">
                      <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                        {platform?.name ?? row.platformId}
                      </Text>
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        Allocated {formatINR(row.allocatedBudget)} · Spent {formatINR(row.spent)} · {row.conversions} conversions
                      </Text>
                    </View>
                    <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                      {row.roas.toFixed(2)}x
                    </Text>
                  </View>
                );
              })
            )}
          </Card>
        </View>

        <View className="px-4 mt-4 gap-3">
          <SectionHeader title="Budget" />
          <Card>
            <View className="flex-row gap-6">
              <View className="flex-1">
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Total budget</Text>
                <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                  {formatINR(campaign.totalBudget)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Daily budget</Text>
                <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                  {formatINR(campaign.dailyBudget)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Duration</Text>
                <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                  {durationDays}d
                </Text>
              </View>
            </View>
            <ProgressBar progress={spentPct / 100} className="mt-3" />
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-1.5">
              {formatINR(kpis.spend)} spent of {formatINR(campaign.totalBudget)}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-3">
              <CalendarDays size={14} color="#69707D" />
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                {shortDate(campaign.startDate)} – {campaign.endDate ? shortDate(campaign.endDate) : '—'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <Link2 size={14} color="#69707D" />
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark" numberOfLines={1}>
                {campaign.landingPage || 'No landing page set'}
              </Text>
            </View>
          </Card>
        </View>

        {audience && (
          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Audience" />
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                  {audience.name}
                </Text>
                <Badge label={`${(audience.estimatedSize / 1000).toFixed(0)}k reach`} tone="info" />
              </View>
              <Text className="text-small text-secondary-text dark:text-secondary-text-dark mt-2">
                {audience.ageMin}–{audience.ageMax} years · {audience.genders.join(', ')}
              </Text>
              <View className="flex-row flex-wrap gap-1.5 mt-3">
                {audience.locations.map((l) => (
                  <View key={l} className="bg-surface-muted dark:bg-surface-muted-dark rounded-full px-2.5 py-1">
                    <Text className="text-caption text-primary-text dark:text-primary-text-dark">{l}</Text>
                  </View>
                ))}
                {audience.interests.map((it) => (
                  <View key={it} className="bg-primary/10 dark:bg-primary-dark/15 rounded-full px-2.5 py-1">
                    <Text className="text-caption text-primary dark:text-primary-dark">{it}</Text>
                  </View>
                ))}
              </View>
              {audience.description && (
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-3">
                  {audience.description}
                </Text>
              )}
            </Card>
          </View>
        )}

        {creatives.length > 0 && (
          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Creative" />
            <View className="gap-3">
              {creatives.map((creative) => (
                <Card key={creative.id}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                      {creative.name}
                    </Text>
                    <Badge label={creative.type} tone="neutral" />
                  </View>
                  <Text className="text-small text-primary-text dark:text-primary-text-dark mt-1.5">
                    {creative.headline}
                  </Text>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
                    {creative.description}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <Badge label={creative.cta} tone="primary" />
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      Status: {creative.status}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {!hasFeature(state.currentUser?.mode ?? 'lite', 'budget-insights') ? (
          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Optimization insights" />
            <ProLockCard
              title="Optimization insights is a Pro feature"
              message="Unlock AI-powered performance insights, budget suggestions and warnings for this campaign with Pro."
            />
          </View>
        ) : insights.length > 0 ? (
          <View className="px-4 mt-4 gap-3">
            <SectionHeader title="Optimization insights" />
            <View className="gap-3">
              {insights.map((insight) => (
                <Card key={insight.id} className="flex-row gap-3">
                  <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10 dark:bg-primary-dark/15 self-start">
                    <Lightbulb size={16} color="#5B5CE2" />
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
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <CampaignActionsSheet campaign={campaign} visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </View>
  );
}