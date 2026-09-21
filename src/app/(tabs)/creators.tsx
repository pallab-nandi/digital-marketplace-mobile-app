import { useRouter } from 'expo-router';
import { ArrowLeftRight, Bookmark, SlidersHorizontal, Users, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, CreatorListSkeleton, EmptyState, FilterChip, ProLockScreen, SearchInput, Skeleton, Select, useToast } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CreatorCard } from '@/features/creators/creator-card';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { createNotification, getCreatorCategories, getCreatorLocations, getCreators, hasFeature } from '@/services';
import { useStore } from '@/store';
import type { Creator, CreatorAvailability } from '@/types';

const AVAILABILITY_OPTIONS: { key: CreatorAvailability | 'any'; label: string }[] = [
  { key: 'any', label: 'Any' },
  { key: 'available', label: 'Available' },
  { key: 'limited', label: 'Limited' },
  { key: 'busy', label: 'Busy' },
];

const RATING_OPTIONS: { key: number | 0; label: string }[] = [
  { key: 0, label: 'Any' },
  { key: 4.5, label: '4.5+' },
  { key: 4.7, label: '4.7+' },
  { key: 4.9, label: '4.9+' },
];

const PRICE_OPTIONS: { key: number | 0; label: string }[] = [
  { key: 0, label: 'Any budget' },
  { key: 8000, label: 'Under ₹8k' },
  { key: 12000, label: 'Under ₹12k' },
  { key: 16000, label: 'Under ₹16k' },
];

type SortKey = 'top' | 'engagement' | 'price';

export default function CreatorsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { state, dispatch } = useStore();
  const user = state.currentUser;
  const insets = useSafeAreaInsets();
  const loading = useSimulatedLoading();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('top');
  const [savedOnly, setSavedOnly] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);

  const [location, setLocation] = useState<string>('');
  const [availability, setAvailability] = useState<'any' | CreatorAvailability>('any');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const categories = useMemo(() => getCreatorCategories(), []);
  const locations = useMemo(() => getCreatorLocations(), []);

  const savedIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(state.savedCreators.filter((s) => s.userId === user.id).map((s) => s.creatorId));
  }, [state.savedCreators, user]);

  const creators = useMemo(() => {
    let list = getCreators({
      search: query || undefined,
      category: category === 'all' ? undefined : category,
      location: location || undefined,
      availability: availability === 'any' ? undefined : availability,
      minRating: minRating || undefined,
      maxPrice: maxPrice || undefined,
      verified: verifiedOnly || undefined,
    });
    if (savedOnly) list = list.filter((c) => savedIds.has(c.id));
    return [...list].sort((a, b) => {
      if (sort === 'engagement') return b.engagementRate - a.engagementRate;
      if (sort === 'price') return a.startingPrice - b.startingPrice;
      return b.creatorIndex - a.creatorIndex;
    });
  }, [query, category, location, availability, minRating, maxPrice, verifiedOnly, savedOnly, savedIds, sort]);

  const toggleFilterSheet = (open: boolean) => {
    if (!open) {
      const count = [location, availability !== 'any', minRating > 0, maxPrice > 0, verifiedOnly].filter(Boolean).length;
      setActiveFilterCount(count);
    }
    setFiltersOpen(open);
  };

  const resetFilters = () => {
    setLocation('');
    setAvailability('any');
    setMinRating(0);
    setMaxPrice(0);
    setVerifiedOnly(false);
    setActiveFilterCount(0);
  };

  const toggleSave = (creator: Creator) => {
    if (!user) return;
    const saved = savedIds.has(creator.id);
    dispatch(saved ? { type: 'REMOVE_SAVED_CREATOR', creatorId: creator.id } : { type: 'SAVE_CREATOR', creatorId: creator.id });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: createNotification({
        userId: user.id,
        type: 'creator',
        title: saved ? 'Creator removed from saved' : 'Creator saved',
        message: saved
          ? `${creator.name} was removed from your saved list.`
          : `${creator.name} was added to your saved creators.`,
        relatedId: creator.id,
      }),
    });
  };

  const toggleCompare = (creator: Creator) => {
    if (!compare.includes(creator.id) && compare.length >= 3) {
      toast.info('Compare up to 3 creators at a time');
      return;
    }
    setCompare((ids) =>
      ids.includes(creator.id) ? ids.filter((id) => id !== creator.id) : [...ids, creator.id],
    );
  };

  const openCompare = () => {
    if (compare.length < 2) return;
    router.push({ pathname: '/creators/compare', params: { ids: compare.join(',') } });
  };

  if (!hasFeature(user?.mode ?? 'lite', 'creator-marketplace')) {
    return (
      <ProLockScreen
        title="Creator marketplace"
        subtitle="Pro plan feature"
        featureTitle="Creator marketplace is a Pro feature"
        message="Discover promotional creators, browse portfolios and send collaboration requests with Pro."
        showBack={false}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <ScrollView
          contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' }}
          showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
            <Skeleton width="50%" height={20} rounded="sm" />
            <Skeleton width="35%" height={12} />
          </View>
          <View className="px-4 gap-3">
            <Skeleton width="100%" height={44} rounded="md" />
            <Skeleton width="100%" height={40} rounded="md" />
            <CreatorListSkeleton count={3} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: compare.length > 0 ? 88 : Spacing.six }}
        showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
          <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">Find creative talent</Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            {creators.length} creator{creators.length === 1 ? '' : 's'} · {categories.length} categories
          </Text>
        </View>

        <View className="px-4">
          <SearchInput value={query} onChangeText={setQuery} onClear={() => setQuery('')} showClear placeholder="Search creators, skills, or services" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          <View className="flex-row gap-2 pr-2">
            <FilterChip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
            {categories.map((cat) => (
              <FilterChip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
            ))}
          </View>
        </ScrollView>

        <View className="flex-row items-center gap-2 px-4 pb-2">
          <Pressable
            onPress={() => toggleFilterSheet(true)}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2">
            <SlidersHorizontal size={14} color="#69707D" />
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <View className="w-4 h-4 rounded-full bg-primary dark:bg-primary-dark items-center justify-center">
                <Text className="text-caption font-bold text-white dark:text-bg-dark">{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setSavedOnly((v) => !v)}
            accessibilityRole="button"
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${savedOnly
              ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
              : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark'}`}>
            <Bookmark size={14} color={savedOnly ? '#FFFFFF' : '#69707D'} />
            <Text className={`text-small font-medium ${savedOnly ? 'text-white dark:text-bg-dark' : 'text-primary-text dark:text-primary-text-dark'}`}>
              Saved
            </Text>
          </Pressable>
          <View className="ml-auto flex-row items-center gap-1">
            {(['top', 'engagement', 'price'] as SortKey[]).map((key) => (
              <Pressable key={key} onPress={() => setSort(key)} hitSlop={6}>
                <Text
                  className={`text-small ${
                    sort === key
                      ? 'font-semibold text-primary dark:text-primary-dark'
                      : 'text-secondary-text dark:text-secondary-text-dark'
                  }`}>
                  {key === 'top' ? 'Top' : key === 'engagement' ? 'Eng' : 'Price'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {creators.length === 0 ? (
          <View className="px-4 pt-6">
            <EmptyState
              icon={savedOnly ? Bookmark : Users}
              title={savedOnly ? 'No saved creators' : 'No creators found'}
              message={
                savedOnly
                  ? 'Your saved creators will appear here. Tap the bookmark on any creator card.'
                  : query.trim() || activeFilterCount > 0
                    ? 'Try a different search term or clear the filters.'
                    : 'New talent is added to the marketplace regularly.'
              }
              action={
                savedOnly ? (
                  <Button label="Browse all creators" onPress={() => setSavedOnly(false)} />
                ) : undefined
              }
            />
          </View>
        ) : (
          <View className="px-4 gap-4">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                saved={savedIds.has(creator.id)}
                comparing={compare.includes(creator.id)}
                onOpen={() => router.push({ pathname: '/creators/[id]', params: { id: creator.id } })}
                onToggleSave={() => toggleSave(creator)}
                onToggleCompare={() => toggleCompare(creator)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {compare.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center gap-2 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-2.5 shadow-md">
            <ArrowLeftRight size={16} color="#5B5CE2" />
            <Text className="flex-1 text-small font-medium text-primary-text dark:text-primary-text-dark">
              {compare.length} creator{compare.length === 1 ? '' : 's'} selected
            </Text>
            <Pressable
              onPress={() => setCompare([])}
              accessibilityRole="button"
              accessibilityLabel="Clear comparison"
              hitSlop={8}>
              <X size={16} color="#69707D" />
            </Pressable>
          </View>
          <Button label="Compare" disabled={compare.length < 2} onPress={openCompare} />
        </View>
      )}

      <BottomSheet visible={filtersOpen} onClose={() => toggleFilterSheet(false)} title="Filter creators">
        <View className="gap-3">
          <Select
            label="Location"
            placeholder="Any location"
            value={location || undefined}
            onChange={(v) => setLocation(v)}
            options={locations.map((l) => ({ label: l, value: l }))}
          />
          <View className="gap-1.5">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Availability</Text>
            <View className="flex-row flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.key}
                  label={opt.label}
                  selected={availability === opt.key}
                  onPress={() => setAvailability(opt.key)}
                />
              ))}
            </View>
          </View>
          <View className="gap-1.5">
            <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">Rating</Text>
            <View className="flex-row flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.key}
                  label={opt.label}
                  selected={minRating === opt.key}
                  onPress={() => setMinRating(opt.key)}
                />
              ))}
            </View>
          </View>
          <Select
            label="Budget"
            placeholder="Any budget"
            value={maxPrice > 0 ? String(maxPrice) : undefined}
            onChange={(v) => setMaxPrice(Number(v))}
            options={PRICE_OPTIONS.map((opt) => ({ label: opt.label, value: String(opt.key) }))}
          />
          <Pressable
            onPress={() => setVerifiedOnly((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: verifiedOnly }}
            className="flex-row items-center justify-between rounded-md border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2.5">
            <Text className="text-body text-primary-text dark:text-primary-text-dark">Verified creators only</Text>
            <View
              className={`w-6 h-3.5 rounded-full p-0.5 ${verifiedOnly ? 'bg-primary dark:bg-primary-dark items-end' : 'items-start bg-surface-muted dark:bg-surface-muted-dark'}`}>
              <View className="w-2.5 h-2.5 rounded-full bg-white" />
            </View>
          </Pressable>
          <View className="flex-row gap-2 pt-1">
            <Button label="Reset" variant="outline" onPress={resetFilters} className="flex-1" />
            <Button label="Done" className="flex-1" onPress={() => toggleFilterSheet(false)} />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}