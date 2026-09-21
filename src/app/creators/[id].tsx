import { useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Bookmark, CheckCircle2, Clock3, Handshake, MapPin, Repeat2, Star, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SafeAreaView, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Avatar, Badge, BottomSheet, Button, Card, EmptyState, Input, PageHeader, ProLockScreen, ProgressBar, Select, Tabs } from '@/components/ui';
import {
  AVAILABILITY_META,
  MEDIA_TYPE_ICONS,
  compactNumber,
  coverTint,
  formatPrice,
  mediaTypeLabel,
  ratingLabel,
} from '@/features/creators/meta';
import { createNotification, getBusinessByUser, getCreatorById, getCreatorPerformance, getCreatorPortfolio, getCreatorReviews, getCreatorServices, hasFeature } from '@/services';
import { useStore } from '@/store';
import type { CreatorPerformance } from '@/types';

const PERF_LABELS: { key: keyof Omit<CreatorPerformance, 'id' | 'creatorId' | 'completedProjects'>; label: string }[] = [
  { key: 'creativity', label: 'Creativity' },
  { key: 'editingSkill', label: 'Editing skill' },
  { key: 'contentQuality', label: 'Content quality' },
  { key: 'audienceReach', label: 'Audience reach' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'socialPresence', label: 'Social presence' },
  { key: 'clientSatisfaction', label: 'Client satisfaction' },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">{value}</Text>
      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark text-center">{label}</Text>
    </View>
  );
}

export default function CreatorProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;

  const creator = useMemo(() => getCreatorById(params.id), [params.id]);
  const portfolio = useMemo(() => (creator ? getCreatorPortfolio(creator.id) : []), [creator]);
  const services = useMemo(() => (creator ? getCreatorServices(creator.id) : []), [creator]);
  const reviews = useMemo(() => (creator ? getCreatorReviews(creator.id) : []), [creator]);
  const performance = useMemo(() => (creator ? getCreatorPerformance(creator.id) : undefined), [creator]);

  const saved = useMemo(() => {
    if (!user || !creator) return false;
    return state.savedCreators.some((s) => s.userId === user.id && s.creatorId === creator.id);
  }, [state.savedCreators, user, creator]);

  const businessCampaigns = useMemo(
    () => (business ? state.campaigns.filter((c) => c.businessId === business.id && !c.isArchived) : []),
    [state.campaigns, business],
  );

  const [tab, setTab] = useState('portfolio');
  const [collabOpen, setCollabOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const openCollab = (presetServiceId?: string) => {
    const preset = presetServiceId ?? services[0]?.id ?? '';
    setServiceId(preset);
    const presetService = services.find((s) => s.id === preset);
    setBudget(String(presetService?.startingPrice ?? creator?.startingPrice ?? 8000));
    setMessage(creator ? `Hi ${creator.name}! We would love your help with a project for ${business?.name ?? 'our brand'}.` : '');
    setCampaignId('');
    setSent(false);
    setCollabOpen(true);
  };

  const toggleSave = () => {
    if (!user || !creator) return;
    dispatch(saved ? { type: 'REMOVE_SAVED_CREATOR', creatorId: creator.id } : { type: 'SAVE_CREATOR', creatorId: creator.id });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: createNotification({
        userId: user.id,
        type: 'creator',
        title: saved ? 'Creator removed from saved' : 'Creator saved',
        message: saved ? `${creator.name} was removed from your saved list.` : `${creator.name} was added to your saved creators.`,
        relatedId: creator.id,
      }),
    });
  };

  const sendRequest = () => {
    if (!user || !creator) return;
    dispatch({
      type: 'SEND_COLLABORATION_REQUEST',
      input: {
        creatorId: creator.id,
        serviceId: serviceId || 'custom',
        message: message.trim(),
        budget: Number(budget) || 0,
        campaignId: campaignId || null,
      },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: createNotification({
        userId: user.id,
        type: 'creator',
        title: 'Collaboration request sent',
        message: `Request sent to ${creator.name}. They typically reply within 48 hours.`,
        relatedId: creator.id,
      }),
    });
    setSent(true);
  };

  if (!creator) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title="Creator profile" subtitle="Not found" />
        <EmptyState icon={Users} title="Creator not found" message="This creator may no longer be on the marketplace." />
      </View>
    );
  }

  const availability = AVAILABILITY_META[creator.availability];
  const selectedService = serviceId ? services.find((s) => s.id === serviceId) : undefined;
  const canSend = Number(budget || 0) > 0 && message.trim().length > 0;

  if (!hasFeature(user?.mode ?? 'lite', 'creator-marketplace')) {
    return (
      <ProLockScreen
        title="Creator profile"
        subtitle={creator.username}
        featureTitle="Creator profiles are a Pro feature"
        message="Browse creator portfolios, reviews and send collaboration requests with Pro."
      />
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Creator profile"
          subtitle={creator.username}
          right={
            <Pressable
              onPress={toggleSave}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from saved' : 'Save creator'}
              hitSlop={8}
              className="w-9 h-9 items-center justify-center rounded-full bg-surface-muted dark:bg-surface-muted-dark">
              <Animated.View key={saved ? 'saved' : 'unsaved'} entering={ZoomIn.duration(220)}>
                <Bookmark size={18} color={saved ? '#5B5CE2' : '#69707D'} fill={saved ? '#5B5CE2' : 'none'} />
              </Animated.View>
            </Pressable>
          }
        />

        <View className="mx-4 rounded-lg overflow-hidden border border-border dark:border-border-dark">
          <View className="h-24 items-center justify-center" style={{ backgroundColor: coverTint(creator) }} />
          <View className="bg-surface dark:bg-surface-dark px-4 pb-4 -mt-8 items-center">
            <Avatar name={creator.name} size="lg" />
            <View className="flex-row items-center gap-1 mt-1.5">
              <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark">{creator.name}</Text>
              {creator.verified && <BadgeCheck size={16} color="#5B5CE2" />}
            </View>
            <View className="flex-row items-center gap-3 mt-0.5">
              <View className="flex-row items-center gap-1">
                <MapPin size={12} color="#69707D" />
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{creator.location}</Text>
              </View>
              <Badge label={availability.label} tone={availability.tone} dot />
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                {creator.categories.join(' · ')}
              </Text>
            </View>
          </View>
          <View className="flex-row border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark py-3 px-2">
            <Stat value={String(creator.completedProjects)} label="Projects" />
            <View className="w-px bg-border dark:bg-border-dark" />
            <Stat value={`${creator.engagementRate}%`} label="Engagement" />
            <View className="w-px bg-border dark:bg-border-dark" />
            <Stat value={compactNumber(creator.audienceSize)} label="Audience" />
            <View className="w-px bg-border dark:bg-border-dark" />
            <Stat value={ratingLabel(creator.rating)} label="Rating" />
          </View>
        </View>

        <View className="px-4 mt-4">
          <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">About</Text>
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark mt-1">{creator.bio}</Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {creator.skills.map((skill) => (
              <Badge key={skill} label={skill} />
            ))}
          </View>
        </View>

        <View className="mt-4">
          <Tabs
            items={[
              { key: 'portfolio', label: 'Portfolio' },
              { key: 'services', label: 'Services' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'performance', label: 'Performance' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        <View className="px-4 mt-4 gap-3">
          {tab === 'portfolio' &&
            (portfolio.length === 0 ? (
              <EmptyState icon={Users} title="No portfolio yet" message="Work samples will appear here." />
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {portfolio.map((item) => {
                  const Icon = MEDIA_TYPE_ICONS[item.mediaType];
                  const views = item.metrics.views;
                  const saves = item.metrics.saves;
                  return (
                    <View key={item.id} className="w-[calc(50%-6px)] rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark overflow-hidden">
                      <View className="h-24 items-center justify-center" style={{ backgroundColor: coverTint(creator) }}>
                        <View className="flex-row items-center gap-1 rounded-full bg-black/30 px-2 py-1">
                          {Icon && <Icon size={12} color="#FFFFFF" />}
                          <Text className="text-caption font-medium text-white">{mediaTypeLabel(item.mediaType)}</Text>
                        </View>
                      </View>
                      <View className="p-2.5 gap-1">
                        <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark" numberOfLines={1}>
                          {item.clientIndustry}
                        </Text>
                        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                          {views != null && `Views ${compactNumber(views)}`}
                          {views != null && saves != null ? ' · ' : ''}
                          {saves != null && `${saves.toLocaleString('en-IN')} saves`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}

          {tab === 'services' &&
            (services.length === 0 ? (
              <EmptyState icon={Handshake} title="No services listed" message="You can still request a custom collaboration." />
            ) : (
              services.map((service) => (
                <Card key={service.id} className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">{service.title}</Text>
                    <Text className="text-body font-bold text-primary dark:text-primary-dark">{formatPrice(service.startingPrice)}</Text>
                  </View>
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{service.description}</Text>
                  <View className="flex-row items-center gap-3 mt-1">
                    <View className="flex-row items-center gap-1">
                      <Clock3 size={12} color="#69707D" />
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        {service.deliveryDays} days
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Repeat2 size={12} color="#69707D" />
                      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                        {service.revisions} revision{service.revisions === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View className="ml-auto">
                      <Button label="Request" size="sm" onPress={() => openCollab(service.id)} />
                    </View>
                  </View>
                </Card>
              ))
            ))}

          {tab === 'reviews' &&
            (reviews.length === 0 ? (
              <EmptyState icon={Star} title="No reviews yet" message="Reviews from past collaborators will appear here." />
            ) : (
              <>
                <Card className="flex-row items-center gap-3">
                  <Text className="text-display font-bold text-primary-text dark:text-primary-text-dark">{ratingLabel(creator.rating)}</Text>
                  <View className="flex-1 gap-1">
                    <View className="flex-row gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={14} color="#F59E0B" fill={n <= Math.round(creator.rating) ? '#F59E0B' : 'none'} />
                      ))}
                    </View>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      Based on {creator.reviewCount} reviews
                    </Text>
                  </View>
                </Card>
                {reviews.map((review) => (
                  <Card key={review.id} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                        {review.reviewerName}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Star size={11} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark">
                          {ratingLabel(review.rating)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      {review.reviewerCompany} · {review.projectType}
                    </Text>
                    <Text className="text-body text-primary-text dark:text-primary-text-dark mt-0.5">{review.comment}</Text>
                  </Card>
                ))}
              </>
            ))}

          {tab === 'performance' &&
            (performance ? (
              <Card className="gap-3">
                {PERF_LABELS.map((row) => (
                  <View key={row.key} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-small text-secondary-text dark:text-secondary-text-dark">{row.label}</Text>
                      <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                        {performance[row.key]}
                      </Text>
                    </View>
                    <ProgressBar progress={performance[row.key] / 100} />
                  </View>
                ))}
                <View className="flex-row items-center justify-between border-t border-border dark:border-border-dark pt-3">
                  <Text className="text-small text-secondary-text dark:text-secondary-text-dark">Completed projects</Text>
                  <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                    {performance.completedProjects}
                  </Text>
                </View>
              </Card>
            ) : (
              <EmptyState icon={Star} title="No performance data" message="Performance metrics are not available yet." />
            ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background/95 dark:bg-background-dark/95 border-t border-border dark:border-border-dark">
        <SafeAreaView className="px-4 py-3">
          <Button label="Request Collaboration" fullWidth leftIcon={<Handshake size={18} color="#FFFFFF" />} onPress={() => openCollab()} />
        </SafeAreaView>
      </View>

      <BottomSheet visible={collabOpen} onClose={() => setCollabOpen(false)} title={sent ? 'Request sent' : `Request ${creator.name}`}>
        {sent ? (
          <View className="items-center py-4 gap-3">
            <View className="w-14 h-14 rounded-full bg-success/10 items-center justify-center">
              <CheckCircle2 size={24} color="#16A34A" />
            </View>
            <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">Request sent!</Text>
            <Text className="text-center text-body text-secondary-text dark:text-secondary-text-dark">
              Your collaboration request to {creator.name} is now pending. They typically reply within 48 hours.
            </Text>
            <Button label="Done" fullWidth onPress={() => setCollabOpen(false)} />
          </View>
        ) : (
          <View className="gap-3">
            <Select
              label="Service"
              placeholder="Custom brief"
              value={serviceId || undefined}
              onChange={(v) => {
                setServiceId(v);
                const svc = services.find((s) => s.id === v);
                if (svc) setBudget(String(svc.startingPrice));
              }}
              options={[
                ...services.map((s) => ({ label: `${s.title} · ${formatPrice(s.startingPrice)}`, value: s.id })),
                { label: 'Custom brief (no service)', value: 'custom' },
              ]}
            />
            <Input
              label="Budget (INR)"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="e.g. 20000"
            />
            <Input
              label="Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              placeholder="Tell the creator about your project..."
            />
            <Select
              label="Related campaign (optional)"
              placeholder="No campaign"
              value={campaignId || undefined}
              onChange={setCampaignId}
              options={businessCampaigns.map((c) => ({ label: c.name, value: c.id }))}
            />
            {selectedService && (
              <View className="flex-row items-center justify-between rounded-md bg-surface-muted dark:bg-surface-muted-dark px-3 py-2">
                <Text className="text-small text-secondary-text dark:text-secondary-text-dark">Service starting price</Text>
                <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                  {formatPrice(selectedService.startingPrice)}
                </Text>
              </View>
            )}
            <Button label="Send Request" fullWidth disabled={!canSend} onPress={sendRequest} />
          </View>
        )}
      </BottomSheet>
    </View>
  );
}