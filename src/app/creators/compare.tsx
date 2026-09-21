import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheck, Users, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ComparisonBars } from '@/components/charts/comparison-bars';
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, ProLockScreen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { AVAILABILITY_META, compactNumber, formatPrice, ratingLabel } from '@/features/creators/meta';
import { findCreatorsByIds, hasFeature } from '@/services';
import { useStore } from '@/store';
import type { Creator } from '@/types';

type RowDef = {
  label: string;
  height: number;
  render: (creator: Creator) => React.ReactNode;
};

const ROW_HEADER_HEIGHT = 76;
const CTA_HEIGHT = 64;

const ROWS: RowDef[] = [
  {
    label: 'Rating',
    height: 48,
    render: (c) => (
      <Text className="text-body font-bold text-primary-text dark:text-primary-text-dark">{ratingLabel(c.rating)}</Text>
    ),
  },
  {
    label: 'Projects',
    height: 48,
    render: (c) => (
      <Text className="text-body text-primary-text dark:text-primary-text-dark">{c.completedProjects}</Text>
    ),
  },
  {
    label: 'Audience',
    height: 48,
    render: (c) => (
      <Text className="text-body text-primary-text dark:text-primary-text-dark">{compactNumber(c.audienceSize)}</Text>
    ),
  },
  {
    label: 'Engagement',
    height: 48,
    render: (c) => (
      <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
        {c.engagementRate}%
      </Text>
    ),
  },
  {
    label: 'Starting price',
    height: 48,
    render: (c) => (
      <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
        {formatPrice(c.startingPrice)}
      </Text>
    ),
  },
  {
    label: 'Availability',
    height: 48,
    render: (c) => {
      const meta = AVAILABILITY_META[c.availability];
      return <Badge label={meta.label} tone={meta.tone} dot />;
    },
  },
  {
    label: 'Skills',
    height: 92,
    render: (c) => (
      <Text
        className="text-caption text-secondary-text dark:text-secondary-text-dark text-center leading-4"
        numberOfLines={3}>
        {c.skills.join(', ')}
      </Text>
    ),
  },
];

export default function CreatorComparisonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ids?: string }>();
  const { state } = useStore();
  const ids = useMemo(() => (params.ids ? params.ids.split(',').filter(Boolean) : []), [params.ids]);
  const creators = useMemo(() => findCreatorsByIds(ids), [ids]);

  const removeCreator = (creatorId: string) => {
    const remaining = ids.filter((id) => id !== creatorId);
    if (remaining.length >= 2) {
      router.setParams({ ids: remaining.join(',') });
    } else {
      router.back();
    }
  };

  if (!hasFeature(state.currentUser?.mode ?? 'lite', 'creator-marketplace')) {
    return (
      <ProLockScreen
        title="Compare creators"
        subtitle="Pro plan feature"
        featureTitle="Creator comparison is a Pro feature"
        message="Compare creators side by side on ratings, pricing, engagement and audience with Pro."
      />
    );
  }

  if (creators.length < 2) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title="Compare creators" subtitle="Pick at least two" />
        <EmptyState
          icon={Users}
          title="Select at least two creators"
          message="Go back to the marketplace, open a few creator cards and tap the compare button to add them here."
          action={<Button label="Browse creators" onPress={() => router.replace('/creators')} />}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Compare creators" subtitle={`${creators.length} creators side by side`} />

      <View className="flex-row">
        <View className="w-[96px]">
          <View style={{ height: ROW_HEADER_HEIGHT }} />
          {ROWS.map((row) => (
            <View
              key={row.label}
              style={{ height: row.height }}
              className="justify-center py-1 pr-3 border-t border-border dark:border-border-dark">
              <Text className="text-small text-secondary-text dark:text-secondary-text-dark text-right">
                {row.label}
              </Text>
            </View>
          ))}
          <View style={{ height: CTA_HEIGHT }} className="border-t border-border dark:border-border-dark" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          <View className="flex-row">
            {creators.map((creator) => (
              <View key={creator.id} className="w-[152px] border-l border-border dark:border-border-dark">
                <Pressable
                  onPress={() => router.push({ pathname: '/creators/[id]', params: { id: creator.id } })}
                  style={{ height: ROW_HEADER_HEIGHT }}
                  className="items-center justify-center px-2">
                  <View className="absolute top-1.5 right-1.5">
                    <Pressable
                      onPress={() => removeCreator(creator.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove creator from comparison"
                      hitSlop={8}
                      className="w-6 h-6 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
                      <X size={12} color="#69707D" />
                    </Pressable>
                  </View>
                  <Avatar name={creator.name} size="sm" />
                  <View className="flex-row items-center gap-0.5 mt-1">
                    <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
                      {creator.name}
                    </Text>
                    {creator.verified && <BadgeCheck size={12} color="#5B5CE2" />}
                  </View>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{creator.username}</Text>
                </Pressable>

                {ROWS.map((row) => (
                  <View
                    key={row.label}
                    style={{ height: row.height }}
                    className="items-center justify-center px-2 py-1 border-t border-border dark:border-border-dark">
                    {row.render(creator)}
                  </View>
                ))}

                <View style={{ height: CTA_HEIGHT }} className="items-center justify-center border-t border-border dark:border-border-dark">
                  <Button
                    label="View profile"
                    size="sm"
                    variant="secondary"
                    onPress={() => router.push({ pathname: '/creators/[id]', params: { id: creator.id } })}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="px-4 mt-5 gap-3">
        <SectionHeader title="Side-by-side metrics" subtitle="Relative scale for the selected creators" />
        <Card className="gap-4">
          <View className="gap-1">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Audience size</Text>
            <ComparisonBars
              data={creators.map((c) => ({ key: c.id, label: c.name, value: c.audienceSize, color: '#5B5CE2' }))}
              formatValue={compactNumber}
            />
          </View>
          <View className="h-px bg-border dark:bg-border-dark" />
          <View className="gap-1">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Engagement rate</Text>
            <ComparisonBars
              data={creators.map((c) => ({ key: c.id, label: c.name, value: c.engagementRate, color: '#16A34A' }))}
              formatValue={(v) => `${Math.round(v)}%`}
            />
          </View>
          <View className="h-px bg-border dark:bg-border-dark" />
          <View className="gap-1">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Starting price</Text>
            <ComparisonBars
              data={creators.map((c) => ({ key: c.id, label: c.name, value: c.startingPrice, color: '#D97706' }))}
              formatValue={formatPrice}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}