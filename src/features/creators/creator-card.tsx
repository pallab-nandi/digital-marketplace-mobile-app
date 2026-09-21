import { ArrowLeftRight, BadgeCheck, ChevronRight, Star } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Avatar, Badge } from '@/components/ui';
import {
  AVAILABILITY_META,
  MEDIA_TYPE_ICONS,
  compactNumber,
  coverItem,
  coverTint,
  formatPrice,
  mediaTypeLabel,
  ratingLabel,
} from '@/features/creators/meta';
import { getCreatorPortfolio } from '@/services';
import type { Creator } from '@/types';
import { cn } from '@/utils/cn';

export type CreatorCardProps = {
  creator: Creator;
  saved: boolean;
  comparing: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
  onToggleCompare: () => void;
};

function CreatorAction({
  tint,
  icon,
  label,
  active,
  onPress,
}: {
  tint: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.85 }] },
        active ? { backgroundColor: tint } : undefined,
      ]}
      className={cn('w-8 h-8 rounded-full items-center justify-center', !active && 'bg-black/30')}>
      {icon}
    </Pressable>
  );
}

export function CreatorCard({
  creator,
  saved,
  comparing,
  onOpen,
  onToggleSave,
  onToggleCompare,
}: CreatorCardProps) {
  const portfolio = useMemo(() => getCreatorPortfolio(creator.id), [creator.id]);
  const item = coverItem(creator, portfolio);
  const CoverIcon = item ? MEDIA_TYPE_ICONS[item.mediaType] : null;
  const availability = AVAILABILITY_META[creator.availability];

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark overflow-hidden active:opacity-80">
      <View style={{ height: 132, backgroundColor: coverTint(creator) }}>
        <View className="flex-row items-start justify-between p-2">
          {item && CoverIcon && (
            <View className="flex-row items-center gap-1 rounded-full bg-black/30 px-2 py-1">
              <CoverIcon size={12} color="#FFFFFF" />
              <Text className="text-caption font-medium text-white">{mediaTypeLabel(item.mediaType)}</Text>
            </View>
          )}
          <View className="flex-row gap-1">
            <CreatorAction
              tint="#5B5CE2"
              icon={<ArrowLeftRight size={15} color="#FFFFFF" />}
              label={comparing ? 'Remove from compare' : 'Compare'}
              active={comparing}
              onPress={onToggleCompare}
            />
            <CreatorAction
              tint="#5B5CE2"
              icon={
                <Animated.View key={saved ? 'saved' : 'unsaved'} entering={ZoomIn.duration(220)}>
                  <BadgeCheck size={15} color={saved ? '#5B5CE2' : '#FFFFFF'} />
                </Animated.View>
              }
              label={saved ? 'Saved creator' : 'Save creator'}
              active={saved}
              onPress={onToggleSave}
            />
          </View>
        </View>
        {item && (
          <View className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/35">
            <Text className="text-small font-semibold text-white" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-caption text-white/85" numberOfLines={1}>
              {item.clientIndustry}
            </Text>
          </View>
        )}
      </View>

      <View className="p-3 gap-1.5">
        <View className="flex-row items-center gap-2">
          <Avatar name={creator.name} size="sm" />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
                {creator.name}
              </Text>
              {creator.verified && <BadgeCheck size={14} color="#5B5CE2" />}
            </View>
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
              {creator.username}
            </Text>
          </View>
        </View>

        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark" numberOfLines={1}>
          {creator.categories.join(' · ')}
        </Text>

        <View className="flex-row items-center gap-1">
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
            {ratingLabel(creator.rating)}
          </Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            {creator.reviewCount} reviews
          </Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            · {compactNumber(creator.audienceSize)} audience
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            Engagement{' '}
            <Text className="font-semibold text-primary-text dark:text-primary-text-dark">
              {creator.engagementRate}%
            </Text>
          </Text>
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            From{' '}
            <Text className="font-semibold text-primary-text dark:text-primary-text-dark">
              {formatPrice(creator.startingPrice)}
            </Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between border-t border-border dark:border-border-dark pt-2">
          <Badge label={availability.label} tone={availability.tone} dot />
          <View className="flex-row items-center gap-0.5">
            <Text className="text-small font-medium text-primary dark:text-primary-dark">View Profile</Text>
            <ChevronRight size={14} color="#5B5CE2" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}