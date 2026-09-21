import { useRouter } from 'expo-router';
import { Archive, ChevronRight, Megaphone, MoreHorizontal, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, CampaignListSkeleton, EmptyState, FilterChip, ProgressBar, SearchInput, Skeleton, Button } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CampaignActionsSheet } from '@/features/campaigns/campaign-actions';
import { CAMPAIGN_STATUS_META } from '@/features/campaigns/status';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { getBusinessByUser, getCampaignPlatforms, getCampaignSpend, getPlatforms } from '@/services';
import { useStore } from '@/store';
import type { Campaign, CampaignStatus } from '@/types';

type StatusFilter = 'all' | CampaignStatus | 'archived';
type SortKey = 'recent' | 'name' | 'spend';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'name', label: 'Name' },
  { key: 'spend', label: 'Spend' },
];

export default function CampaignsScreen() {
  const router = useRouter();
  const { state } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;
  const insets = useSafeAreaInsets();
  const loading = useSimulatedLoading();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [sheetCampaign, setSheetCampaign] = useState<Campaign | null>(null);

  const platformById = new Map(getPlatforms().map((p) => [p.id, p]));
  const archivedCount = useMemo(
    () => (business ? state.campaigns.filter((c) => c.businessId === business.id && c.isArchived).length : 0),
    [state.campaigns, business],
  );

  const campaigns = useMemo(() => {
    if (!business) return [];
    let list = state.campaigns.filter((c) => c.businessId === business.id);
    if (status === 'archived') {
      list = list.filter((c) => c.isArchived);
    } else {
      list = list.filter((c) => !c.isArchived);
      if (status !== 'all') list = list.filter((c) => c.status === status);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'spend') return getCampaignSpend(b) - getCampaignSpend(a);
      return b.updatedAt > a.updatedAt ? 1 : -1;
    });
  }, [state.campaigns, business, status, query, sort]);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
          <View className="flex-1">
            <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">Campaigns</Text>
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
              {loading ? 'Loading campaigns…' : `${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
            </Text>
          </View>
          <Button
            label="New"
            size="sm"
            leftIcon={<Plus size={16} className="text-white" />}
            onPress={() => router.push('/campaigns/new')}
          />
        </View>

        {loading ? (
          <View className="px-4 gap-3 pb-10">
            <Skeleton width="100%" height={44} rounded="md" />
            <Skeleton width="100%" height={40} rounded="md" />
            <CampaignListSkeleton count={4} />
          </View>
        ) : (
        <>
        <View className="px-4">
          <SearchInput value={query} onChangeText={setQuery} onClear={() => setQuery('')} showClear placeholder="Search campaigns..." />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3">
          <View className="flex-row gap-2 pr-2">
            {STATUS_FILTERS.map((f) => (
              <FilterChip
                key={f.key}
                label={f.key === 'archived' && archivedCount > 0 ? `${f.label} (${archivedCount})` : f.label}
                selected={status === f.key}
                onPress={() => setStatus(f.key)}
              />
            ))}
          </View>
        </ScrollView>

        <View className="flex-row items-center gap-2 px-4 pb-2">
          <Text className="text-small text-secondary-text dark:text-secondary-text-dark">Sort</Text>
          {SORT_OPTIONS.map((s) => (
            <Pressable key={s.key} onPress={() => setSort(s.key)}>
              <Text
                className={`text-small ${
                  sort === s.key
                    ? 'text-primary dark:text-primary-dark font-semibold'
                    : 'text-secondary-text dark:text-secondary-text-dark'
                }`}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {campaigns.length === 0 ? (
          <View className="px-4 pt-6">
            <EmptyState
              icon={status === 'archived' ? Archive : Megaphone}
              title={status === 'archived' ? 'Nothing archived yet' : 'No campaigns found'}
              message={
                status === 'archived'
                  ? 'Campaigns you archive will show up here.'
                  : query.trim()
                    ? 'Try a different search term or filter.'
                    : 'Create your first campaign to start tracking performance.'
              }
              action={
                status === 'archived' ? undefined : (
                  <Button label="Create Campaign" onPress={() => router.push('/campaigns/new')} />
                )
              }
            />
          </View>
        ) : (
          <View className="px-4 gap-3">
            {campaigns.map((campaign) => {
              const meta = CAMPAIGN_STATUS_META[campaign.status];
              const spend = getCampaignSpend(campaign);
              const rows = getCampaignPlatforms(campaign.id);
              const clicks = rows.reduce((s, r) => s + r.clicks, 0);
              const conversions = rows.reduce((s, r) => s + r.conversions, 0);
              const spentPct = campaign.totalBudget ? Math.min(100, (spend / campaign.totalBudget) * 100) : 0;
              const campaignPlatforms = rows.map((r) => platformById.get(r.platformId)).filter((p) => !!p);
              return (
                <Pressable
                  key={campaign.id}
                  onPress={() => router.push({ pathname: '/campaigns/[id]', params: { id: campaign.id } })}
                  className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 active:opacity-80">
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                        {campaign.name}
                      </Text>
                      {campaign.isArchived && (
                        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
                          Archived
                        </Text>
                      )}
                    </View>
                    <Badge label={meta.label} tone={meta.tone} dot />
                    <Pressable
                      onPress={() => setSheetCampaign(campaign)}
                      accessibilityLabel="Campaign actions"
                      hitSlop={8}
                      className="w-9 h-9 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
                      <MoreHorizontal size={18} className="text-secondary-text dark:text-secondary-text-dark" />
                    </Pressable>
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
                    {campaignPlatforms.length === 0 && (
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        No platforms selected yet
                      </Text>
                    )}
                  </View>

                  <View className="mt-2">
                    <ProgressBar progress={spentPct / 100} />
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      ₹{spend.toLocaleString('en-IN')} / ₹{campaign.totalBudget.toLocaleString('en-IN')}
                    </Text>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      {clicks.toLocaleString('en-IN')} clicks · {conversions} conversions
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-end mt-2 pt-2 border-t border-border dark:border-border-dark">
                    <Text className="text-small font-medium text-primary dark:text-primary-dark">
                      View campaign
                    </Text>
                    <ChevronRight size={16} color="#5B5CE2" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        </>
        )}
      </ScrollView>

      {sheetCampaign && (
        <CampaignActionsSheet
          campaign={sheetCampaign}
          visible={!!sheetCampaign}
          onClose={() => setSheetCampaign(null)}
        />
      )}
    </View>
  );
}