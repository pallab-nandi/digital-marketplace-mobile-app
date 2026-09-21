import { useRouter } from 'expo-router';
import { Check, ChevronLeft, ChevronRight, Save, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Badge, Button, Card, Checkbox, Input, PageHeader, ProgressBar, ProLockCard, SectionHeader, Select, useToast } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { createNotification, generateAIPlan, getAudiences, getBusinessByUser, getPlatforms, hasFeature } from '@/services';
import { useStore } from '@/store';
import type { CampaignDraft } from '@/store';
import type { AIGeneratedPlan, Audience, CampaignObjective, CampaignPlatform } from '@/types';
import { round, uid } from '@/utils/mock';

const STEPS = ['Brief', 'Audience', 'Budget', 'Platforms', 'AI', 'Review'];

const OBJECTIVES: { value: CampaignObjective; label: string }[] = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'traffic', label: 'Website Traffic' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'sales', label: 'Sales' },
  { value: 'app_promotion', label: 'App Promotion' },
  { value: 'engagement', label: 'Engagement' },
];

const ALLOCATIONS: { value: AllocationStrategy; label: string; hint: string }[] = [
  { value: 'equal', label: 'Equal split', hint: 'Spread budget evenly across every selected platform.' },
  { value: 'frontload', label: 'Front-load winner', hint: 'Give the highest-ranked platform 60%, split the rest.' },
  { value: 'focus', label: 'Focus & test', hint: 'Give the highest-ranked platform 45%, test the rest.' },
];

type AllocationStrategy = 'equal' | 'frontload' | 'focus';

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

/** Deterministic share of a total budget across platforms, adjusted to sum exactly. */
function splitBudget(total: number, ids: string[], strategy: AllocationStrategy): number[] {
  const n = ids.length;
  if (n === 0) return [];
  const shares = new Array<number>(n).fill(100 / n);
  if (strategy === 'frontload' && n > 1) {
    const rest = (100 - 60) / (n - 1);
    shares[0] = 60;
    for (let i = 1; i < n; i++) shares[i] = rest;
  } else if (strategy === 'focus' && n > 1) {
    const rest = (100 - 45) / (n - 1);
    shares[0] = 45;
    for (let i = 1; i < n; i++) shares[i] = rest;
  }
  const parts = shares.map((s) => round((total * s) / 100, 2));
  const sum = parts.reduce((a, b) => a + b, 0);
  parts[n - 1] += round(total - sum, 2);
  return parts;
}

/** Pick the mock audience whose interests overlap most with the AI plan. */
function bestAudienceFor(plan: AIGeneratedPlan): Audience | undefined {
  const planInterests = new Set((plan.interests ?? []).map((i) => i.toLowerCase()));
  return getAudiences()
    .map((a) => ({
      audience: a,
      score: (a.interests ?? []).filter((i) => planInterests.has(i.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score)[0]?.audience;
}

export default function NewCampaignScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [objective, setObjective] = useState<CampaignObjective>('traffic');
  const [description, setDescription] = useState('');
  const [landingPage, setLandingPage] = useState('https://demo.store/promo');
  const [totalBudget, setTotalBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [startDate, setStartDate] = useState('2026-09-22');
  const [endDate, setEndDate] = useState('2026-10-21');

  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<AllocationStrategy>('equal');
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [aiApplied, setAiApplied] = useState(false);

  const platforms = useMemo(() => getPlatforms().filter((p) => p.isAvailable && p.isConnected), []);
  const audiences = useMemo(() => getAudiences(), []);
  const hasAi = hasFeature(user?.mode ?? 'lite', 'ai-assistant');
  const hasBudgetInsights = hasFeature(user?.mode ?? 'lite', 'budget-insights');

  const total = Number(totalBudget) || 0;
  const daily = Number(dailyBudget) || 0;

  const estimatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(`${startDate}T00:00:00Z`).getTime();
    const e = new Date(`${endDate}T00:00:00Z`).getTime();
    if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
    return Math.round((e - s) / 86400000) + 1;
  }, [startDate, endDate]);

  const aiPlan = useMemo(
    () =>
      generateAIPlan({
        objective,
        businessName: business?.name ?? user?.name,
        monthlyBudget: total || user?.monthlyBudget || 50000,
        platforms: platformIds.length ? platformIds : undefined,
      }),
    [objective, total, platformIds, business?.name, user?.name, user?.monthlyBudget],
  );

  const selectedAudience = audienceId ? audiences.find((a) => a.id === audienceId) : undefined;
  const dailyEstimate = daily * estimatedDays;

  function validateCurrentStep(): boolean {
    setError(null);
    switch (step) {
      case 0:
        if (!name.trim()) {
          setError('Give your campaign a name to continue.');
          return false;
        }
        if (!totalBudget || Number.isNaN(total) || total <= 0) {
          setError('Enter a valid total budget.');
          return false;
        }
        if (!dailyBudget || Number.isNaN(daily) || daily <= 0) {
          setError('Enter a valid daily budget.');
          return false;
        }
        return true;
      case 1:
        if (!audienceId) {
          setError('Pick an audience to target.');
          return false;
        }
        return true;
      case 2:
        if (estimatedDays <= 0) {
          setError('Check your campaign dates in the brief.');
          return false;
        }
        return true;
      case 3:
        if (platformIds.length === 0) {
          setError('Select at least one platform.');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  function handleNext() {
    if (step === STEPS.length - 1) {
      handleLaunch();
      return;
    }
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function togglePlatform(platformId: string) {
    setPlatformIds((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId],
    );
  }

  function handleApplyAi() {
    const plan = aiPlan;
    if (aiApplied) return;
    const audience = bestAudienceFor(plan);
    if (audience) setAudienceId(audience.id);
    setPlatformIds((prev) => Array.from(new Set([...prev, ...plan.recommendedPlatforms])));
    if (plan.suggestedDailyBudget > 0) setDailyBudget(String(plan.suggestedDailyBudget));
    setAiApplied(true);
    toast.success('AI recommendations applied');
  }

  function handleSaveDraft() {
    if (!user || !business) return;
    if (!validateCurrentStep()) return;
    const draft: CampaignDraft = {
      businessId: business.id,
      createdBy: user.id,
      name: name.trim(),
      description: description.trim() || `Promoting our offerings across ${business.name || 'selected'} channels.`,
      objective,
      status: 'draft',
      totalBudget: total,
      dailyBudget: daily,
      currency: user.currency || 'INR',
      startDate,
      endDate,
      landingPage: landingPage.trim() || '',
      primaryCreativeId: null,
      audienceId,
    };
    dispatch({ type: 'CREATE_CAMPAIGN', draft });
    toast.success('Draft created');
    router.replace('/campaigns');
  }

  function handleLaunch() {
    if (!user || !business) return;
    if (!validateCurrentStep()) return;
    const campaignId = uid('campaign');
    const split = splitBudget(total, platformIds, allocation);

    const draft: CampaignDraft = {
      id: campaignId,
      businessId: business.id,
      createdBy: user.id,
      name: name.trim(),
      description: description.trim() || `Promoting our offerings across ${business.name || 'selected'} channels.`,
      objective,
      status: 'active',
      totalBudget: total,
      dailyBudget: daily,
      currency: user.currency || 'INR',
      startDate,
      endDate,
      landingPage: landingPage.trim() || '',
      primaryCreativeId: null,
      audienceId,
    };

    const rows: CampaignPlatform[] = platformIds.map((platformId, i) => ({
      id: uid('cplatform'),
      campaignId,
      platformId,
      status: 'active',
      allocatedBudget: split[i] ?? 0,
      spent: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      revenue: 0,
      roas: 0,
    }));

    dispatch({ type: 'CREATE_CAMPAIGN', draft });
    if (rows.length > 0) dispatch({ type: 'ADD_CAMPAIGN_PLATFORMS', rows });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: createNotification({
        userId: user.id,
        type: 'campaign',
        title: 'Campaign launched',
        message: `"${name.trim()}" is now live across ${rows.length} platform${rows.length === 1 ? '' : 's'}.`,
        relatedId: campaignId,
      }),
    });

    router.replace({ pathname: '/campaigns/success', params: { id: campaignId } });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background dark:bg-background-dark">
      <PageHeader
        title="Create campaign"
        subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      />

      <View className="px-4 pt-1">
        <View className="flex-row">
          {STEPS.map((stepName, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <View key={stepName} className="flex-1 items-center">
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    done || current ? 'bg-primary dark:bg-primary-dark' : 'bg-surface-muted dark:bg-surface-muted-dark'
                  } ${current ? 'border-2 border-primary/30 dark:border-primary-dark/40' : ''}`}>
                  {done ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text className={`text-caption font-bold ${current ? 'text-white' : 'text-secondary-text dark:text-secondary-text-dark'}`}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  className={`mt-1 text-caption ${done || current ? 'text-primary dark:text-primary-dark font-semibold' : 'text-secondary-text dark:text-secondary-text-dark'}`}>
                  {stepName}
                </Text>
                {i < STEPS.length - 1 && (
                  <View className="absolute top-3 left-1/2 w-full h-px bg-border dark:bg-border-dark" />
                )}
              </View>
            );
          })}
        </View>
        <View className="mt-3">
          <ProgressBar progress={(step + 1) / STEPS.length} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="px-4 gap-3 mt-4">
          {step === 0 && (
            <>
              <Input label="Campaign name" placeholder="Summer Collection Launch" value={name} onChangeText={setName} />
              <Select label="Primary objective" options={OBJECTIVES} value={objective} onChange={setObjective} />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Total budget (₹)"
                    placeholder="45000"
                    keyboardType="numeric"
                    value={totalBudget}
                    onChangeText={setTotalBudget}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Daily budget (₹)"
                    placeholder="1500"
                    keyboardType="numeric"
                    value={dailyBudget}
                    onChangeText={setDailyBudget}
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input label="Start date" placeholder="2026-09-22" value={startDate} onChangeText={setStartDate} autoCapitalize="none" />
                </View>
                <View className="flex-1">
                  <Input label="End date" placeholder="2026-10-21" value={endDate} onChangeText={setEndDate} autoCapitalize="none" />
                </View>
              </View>

              {estimatedDays > 0 && (
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                  ≈ ₹{(daily * estimatedDays).toLocaleString('en-IN')} total · {estimatedDays} days
                </Text>
              )}

              <Input label="Landing page" placeholder="https://..." value={landingPage} onChangeText={setLandingPage} autoCapitalize="none" />
              <Input
                label="Description"
                placeholder="What is this campaign about?"
                value={description}
                onChangeText={setDescription}
                multiline
                inputMode="text"
              />

              <Button
                label="Save draft"
                variant="outline"
                fullWidth
                leftIcon={<Save size={18} color="#69707D" />}
                className="mt-2"
                onPress={handleSaveDraft}
              />
            </>
          )}

          {step === 1 && (
            <>
              <SectionHeader title="Who do you want to reach?" subtitle="Pick from our pre-built demo audiences" />
              {audiences.map((a) => {
                const selected = a.id === audienceId;
                return (
                  <Pressable key={a.id} onPress={() => setAudienceId(a.id)} className="active:opacity-80">
                    <Card className={selected ? 'border-primary dark:border-primary-dark' : undefined}>
                      <View className="flex-row items-start gap-3">
                        <Checkbox checked={selected} onPress={() => setAudienceId(a.id)} />
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                              {a.name}
                            </Text>
                            <Badge label={`${Math.round(a.estimatedSize / 1000)}k reach`} tone="info" />
                          </View>
                          <Text className="text-small text-secondary-text dark:text-secondary-text-dark mt-1">
                            {a.ageMin}–{a.ageMax} yrs · {a.genders.join(', ')}
                          </Text>
                          <View className="flex-row flex-wrap gap-1.5 mt-2">
                            {a.locations.slice(0, 3).map((l) => (
                              <View key={l} className="bg-surface-muted dark:bg-surface-muted-dark rounded-full px-2 py-0.5">
                                <Text className="text-caption text-primary-text dark:text-primary-text-dark">{l}</Text>
                              </View>
                            ))}
                            {a.interests.slice(0, 3).map((it) => (
                              <View key={it} className="bg-primary/10 dark:bg-primary-dark/15 rounded-full px-2 py-0.5">
                                <Text className="text-caption text-primary dark:text-primary-dark">{it}</Text>
                              </View>
                            ))}
                          </View>
                          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-2">
                            {a.description}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </>
          )}

          {step === 2 && (
            <>
              <SectionHeader title="Budget allocation" subtitle="How the plan will spend" />
              <Card>
                <View className="flex-row gap-6">
                  <View className="flex-1">
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Total budget</Text>
                    <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                      {formatINR(total)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Daily budget</Text>
                    <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                      {formatINR(daily)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">Run time</Text>
                    <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark mt-0.5">
                      {estimatedDays}d
                    </Text>
                  </View>
                </View>
                {dailyEstimate > 0 && (
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-3">
                    Estimated {formatINR(dailyEstimate)} over the full run at the current daily pace.
                  </Text>
                )}
              </Card>

              <SectionHeader title="Spend strategy" />
              {!hasBudgetInsights ? (
                <ProLockCard
                  title="Budget optimization is a Pro feature"
                  message="Unlock smart spend strategies like front-loading your best-performing platform with Pro. Your budget stays split evenly in Lite."
                  actionLabel="Explore Pro"
                />
              ) : (
                ALLOCATIONS.map((opt) => {
                  const selected = opt.value === allocation;
                  return (
                    <Pressable key={opt.value} onPress={() => setAllocation(opt.value)} className="active:opacity-80">
                      <Card className={selected ? 'border-primary dark:border-primary-dark' : undefined}>
                        <View className="flex-row items-start gap-3">
                          <Checkbox checked={selected} onPress={() => setAllocation(opt.value)} />
                          <View className="flex-1">
                            <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                              {opt.label}
                            </Text>
                            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5">
                              {opt.hint}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })
              )}
            </>
          )}

          {step === 3 && (
            <>
              <SectionHeader title="Choose platforms" subtitle="Connected channels available to this demo" />
              <View className="flex-row flex-wrap gap-2">
                {platforms.map((p) => {
                  const selected = platformIds.includes(p.id);
                  return (
                    <Pressable key={p.id} onPress={() => togglePlatform(p.id)} className="active:opacity-80">
                      <View
                        className={`rounded-full px-3.5 py-2 border flex-row items-center gap-2 ${
                          selected
                            ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark'
                            : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark'
                        }`}>
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.brandColorToken }} />
                        <Text
                          className={`text-small font-medium ${
                            selected ? 'text-white dark:text-bg-dark' : 'text-primary-text dark:text-primary-text-dark'
                          }`}>
                          {p.name.replace(' Ads', '')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                Pick at least one. Rows create fresh placements with {formatINR(total)} split across selections.
              </Text>
            </>
          )}

          {step === 4 && (
            <>
              <SectionHeader title="AI campaign assistant" subtitle="A generated plan built from your brief" />
              {!hasAi ? (
                <>
                  <ProLockCard
                    title="AI campaign assistant is a Pro feature"
                    message="Unlock an AI-generated audience, keyword and budget plan for your campaign with Pro. You can skip this step and configure manually."
                  />
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                    Continue to the Review step to launch your campaign without AI recommendations.
                  </Text>
                </>
              ) : (
              <>
              <Card>
                <View className="flex-row items-center gap-2">
                  <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10 dark:bg-primary-dark/15">
                    <Sparkles size={16} color="#5B5CE2" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                      Suggested plan
                    </Text>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                      Objective: {aiPlan.objective}
                    </Text>
                  </View>
                  {aiApplied && <Badge label="Applied" tone="success" dot />}
                </View>

                <View className="mt-4 gap-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                      {formatINR(aiPlan.suggestedDailyBudget)}
                    </Text>
                    <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">suggested daily spend</Text>
                  </View>
                  <View>
                    <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark mb-1">Audience</Text>
                    <Text className="text-body text-secondary-text dark:text-secondary-text-dark">{aiPlan.audience}</Text>
                  </View>
                  <View>
                    <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark mb-1">Keywords</Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {aiPlan.keywords.map((k) => (
                        <Badge key={k} label={k} tone="neutral" />
                      ))}
                    </View>
                  </View>
                  <View>
                    <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark mb-1">Creative direction</Text>
                    <Text className="text-body text-secondary-text dark:text-secondary-text-dark">
                      {aiPlan.creativeDirection} · CTA: {aiPlan.cta}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark mb-1">Platforms</Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {aiPlan.recommendedPlatforms.map((p) => (
                        <Badge key={p} label={p} tone="primary" />
                      ))}
                    </View>
                  </View>
                </View>

                <Button
                  label={aiApplied ? 'Applied to campaign' : 'Apply all recommendations'}
                  fullWidth
                  disabled={aiApplied}
                  leftIcon={<Sparkles size={18} color="#FFFFFF" />}
                  className="mt-4"
                  onPress={handleApplyAi}
                />
              </Card>
              <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                Applying this updates the audience, platforms and daily budget on the Review step. You can skip and adjust manually.
              </Text>
              </>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <SectionHeader title="Review & launch" subtitle="Confirm the details before going live" />
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                    {name.trim() || 'Untitled campaign'}
                  </Text>
                  <Badge label="Active" tone="success" dot />
                </View>
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-1">
                  {OBJECTIVES.find((o) => o.value === objective)?.label} · {formatINR(total)} total
                </Text>
              </Card>

              <Card>
                <View className="gap-3">
                  <Row label="Dates" value={`${startDate} → ${endDate} (${estimatedDays} days)`} />
                  <Row label="Daily budget" value={`${formatINR(daily)} ≈ ${formatINR(dailyEstimate)} total`} />
                  <Row
                    label="Audience"
                    value={selectedAudience ? selectedAudience.name : 'Not selected'}
                    note={selectedAudience ? `${(selectedAudience.estimatedSize / 1000).toFixed(0)}k estimated reach` : undefined}
                  />
                  <Row
                    label="Spend strategy"
                    value={ALLOCATIONS.find((a) => a.value === allocation)?.label}
                  />
                  <Row label="AI plan" value={aiApplied ? 'Applied' : 'Not applied'} />
                </View>
              </Card>

              {platformIds.length > 0 && (
                <Card padded={false}>
                  {platformIds.map((pid, i) => {
                    const platform = platforms.find((p) => p.id === pid);
                    return (
                      <View
                        key={pid}
                        className={`flex-row items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border dark:border-border-dark' : ''}`}>
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform?.brandColorToken ?? '#69707D' }} />
                        <View className="flex-1">
                          <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark">
                            {platform?.name ?? pid}
                          </Text>
                          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
                            ~{Math.round(100 / platformIds.length)}% of budget
                          </Text>
                        </View>
                        <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
                          {formatINR(splitBudget(total, platformIds, allocation)[i] ?? 0)}
                        </Text>
                      </View>
                    );
                  })}
                </Card>
              )}
            </>
          )}

          {error && <Text className="text-small text-danger dark:text-danger-dark">{error}</Text>}
        </View>
      </ScrollView>

      <View className="w-full max-w-[800px] self-center flex-row gap-3 px-4 py-3 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
        <Button
          label="Back"
          variant="outline"
          leftIcon={<ChevronLeft size={18} color="#69707D" />}
          disabled={step === 0}
          className="flex-1"
          onPress={handleBack}
        />
        <Button
          label={step === STEPS.length - 1 ? 'Launch campaign' : 'Continue'}
          rightIcon={<ChevronRight size={18} color="#FFFFFF" />}
          className="flex-1"
          onPress={handleNext}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, note }: { label: string; value?: string; note?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{label}</Text>
      <View className="flex-1 items-end">
        <Text className="text-small font-medium text-primary-text dark:text-primary-text-dark">{value ?? '—'}</Text>
        {note && <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{note}</Text>}
      </View>
    </View>
  );
}