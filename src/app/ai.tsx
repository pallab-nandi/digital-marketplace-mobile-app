import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronRight, Lock, Send, Sparkles } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Badge, Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { generateAssistantReply, getBusinessByUser, hasFeature } from '@/services';
import { useStore } from '@/store';
import type { AIRecommendation, Campaign } from '@/types';
import { uid } from '@/utils/mock';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendations?: AIRecommendation[];
};

const SUGGESTIONS = [
  'Optimize my coffee campaigns',
  'Fitness retargeting ideas',
  'Fashion campaign plan',
  'Budget allocation advice',
  'Who should I target?',
];

const PRIORITY_TONE: Record<string, 'success' | 'info' | 'neutral'> = {
  high: 'success',
  medium: 'info',
  low: 'neutral',
};

function confidenceLabel(value: number): string {
  return `${Math.round(value * 100)}% confidence`;
}

export default function AIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ campaignId?: string }>();
  const { state, dispatch } = useStore();
  const user = state.currentUser;
  const business = user ? getBusinessByUser(user.id) : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid('msg'),
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] ?? 'there'}! I can draft recommendations for your campaigns. Ask about budget, targeting, creatives or platforms${
        business ? ` for ${business.name}` : ''
      }.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  const isPro = hasFeature(user?.mode ?? 'lite', 'ai-assistant');

  const targetCampaign = useMemo(() => {
    const fromParam = state.campaigns.find((c) => c.id === params.campaignId);
    if (fromParam) return fromParam;
    return (
      state.campaigns.find(
        (c) => c.businessId === business?.id && c.status !== 'draft' && !c.isArchived,
      ) ?? state.campaigns[0]
    );
  }, [params.campaignId, state.campaigns, business?.id]);

  function send(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const reply = generateAssistantReply({
      prompt: trimmed,
      campaignId: targetCampaign?.id,
      businessName: business?.name ?? user?.name,
      monthlyBudget: user?.monthlyBudget,
      objective: targetCampaign?.objective,
    });
    setMessages((prev) => [
      ...prev,
      { id: uid('msg'), role: 'user', text: trimmed },
      { id: uid('msg'), role: 'assistant', text: reply.text, recommendations: reply.recommendations },
    ]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }

  function patchFor(rec: AIRecommendation): Partial<Campaign> {
    const data = rec.recommendationData;
    const note = `• AI: ${rec.title}`;
    if (rec.type === 'audience' && typeof data.audienceId === 'string') {
      return { audienceId: data.audienceId, description: appendNote() };
    }
    if (rec.type === 'budget' && typeof data.dailyBudget === 'number') {
      return { dailyBudget: data.dailyBudget, description: appendNote() };
    }
    return {
      description:
        (rec.type === 'keyword' && Array.isArray(data.keywords) ? `${note} — ${(data.keywords as string[]).join(', ')}` : note) +
        '\n',
    };

    function appendNote(): string {
      const existing = targetCampaign?.description ?? '';
      return existing.endsWith('\n') ? `${existing}${note}\n` : `${existing}\n${note}\n`;
    }
  }

  function applyRec(rec: AIRecommendation) {
    if (appliedIds.has(rec.id)) return;
    if (targetCampaign) {
      dispatch({ type: 'UPDATE_CAMPAIGN', campaignId: targetCampaign.id, patch: patchFor(rec) });
    }
    dispatch({ type: 'APPLY_AI_RECOMMENDATION', recommendationId: rec.id });
    setAppliedIds((prev) => new Set(prev).add(rec.id));
  }

  function applyAll(recs: AIRecommendation[]) {
    const pending = recs.filter((r) => !appliedIds.has(r.id));
    if (pending.length === 0 || !targetCampaign) return;
    const patch = pending.reduce<Partial<Campaign>>((acc, rec) => {
      const next = patchFor(rec);
      if (typeof next.audienceId === 'string') acc.audienceId = next.audienceId;
      if (typeof next.dailyBudget === 'number') acc.dailyBudget = next.dailyBudget;
      if (typeof next.description === 'string') {
        acc.description = `${acc.description ?? ''}${rec.title}: ${rec.description}\n`;
      }
      return acc;
    }, {});
    dispatch({ type: 'UPDATE_CAMPAIGN', campaignId: targetCampaign.id, patch });
    pending.forEach((rec) => dispatch({ type: 'APPLY_AI_RECOMMENDATION', recommendationId: rec.id }));
    setAppliedIds((prev) => {
      const next = new Set(prev);
      pending.forEach((r) => next.add(r.id));
      return next;
    });
  }

  if (!isPro) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <PageHeader title="AI assistant" subtitle="Campaign intelligence, Pro plan" />
        <EmptyState
          icon={Lock}
          title="AI assistant is a Pro feature"
          message="Upgrade to Pro to unlock the AI assistant, advanced analytics and the creator marketplace."
          action={<Button label="Upgrade to Pro" onPress={() => router.push('/profile')} />}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <PageHeader
        title="AI assistant"
        subtitle="Deterministic demo intelligence · no external API"
        right={
          <View className="flex-row items-center gap-1 bg-primary/10 dark:bg-primary-dark/15 rounded-full px-2.5 py-1">
            <Sparkles size={14} color="#5B5CE2" />
            <Text className="text-caption font-medium text-primary dark:text-primary-dark">Pro</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {targetCampaign && (
          <Pressable
            onPress={() => send(`Help me improve ${targetCampaign.name}`)}
            className="flex-row items-center gap-1.5 mx-4 mb-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-full px-3 py-1.5 self-start active:opacity-80">
            <Sparkles size={12} color="#5B5CE2" />
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
              Advising on
            </Text>
            <Text className="text-caption font-semibold text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
              {targetCampaign.name}
            </Text>
            <ChevronRight size={14} color="#69707D" />
          </Pressable>
        )}

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <View key={msg.id} className="items-end">
                <View className="bg-primary dark:bg-primary-dark rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[82%]">
                  <Text className="text-body text-white dark:text-bg-dark">{msg.text}</Text>
                </View>
              </View>
            ) : (
              <View key={msg.id} className="items-start gap-2">
                <View className="flex-row items-start gap-2 max-w-[92%]">
                  <View className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/15 items-center justify-center mt-0.5">
                    <Sparkles size={15} color="#5B5CE2" />
                  </View>
                  <View className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <Text className="text-body text-primary-text dark:text-primary-text-dark leading-6">{msg.text}</Text>
                  </View>
                </View>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <View className="w-full mt-1 gap-2">
                    {msg.recommendations.map((rec) => {
                      const applied = appliedIds.has(rec.id);
                      return (
                        <Card key={rec.id} className="pl-4">
                          <View className="flex-row items-center justify-between gap-2">
                            <View className="flex-1">
                              <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">
                                {rec.title}
                              </Text>
                            </View>
                            <Badge label={confidenceLabel(rec.confidence)} tone={PRIORITY_TONE[rec.priority] ?? 'neutral'} />
                          </View>
                          <Text className="text-small text-secondary-text dark:text-secondary-text-dark mt-1 leading-5">
                            {rec.description}
                          </Text>
                          <View className="flex-row items-center justify-between mt-3">
                            <Badge label={rec.type} tone="primary" />
                            <Button
                              label={applied ? 'Applied' : 'Apply'}
                              size="sm"
                              variant={applied ? 'secondary' : 'primary'}
                              disabled={applied}
                              leftIcon={applied ? <Check size={14} color="#69707D" /> : undefined}
                              onPress={() => applyRec(rec)}
                            />
                          </View>
                        </Card>
                      );
                    })}
                    {msg.recommendations.some((r) => !appliedIds.has(r.id)) && (
                      <View className="flex-row justify-end">
                        <Button
                          label="Apply all"
                          size="sm"
                          variant="outline"
                          leftIcon={<Check size={14} color="#5B5CE2" />}
                          onPress={() => applyAll(msg.recommendations ?? [])}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            ),
          )}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark pt-2 px-4 pb-0">
          <View className="flex-row gap-2 pr-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} className="active:opacity-80">
                <View className="bg-surface-muted dark:bg-surface-muted-dark rounded-full px-3 py-2">
                  <Text className="text-caption font-medium text-primary-text dark:text-primary-text-dark">{s}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <TextInput
            className="flex-1 rounded-md border border-border dark:border-border-dark bg-background dark:bg-background-dark px-3 py-2.5 text-body text-primary-text dark:text-primary-text-dark"
            placeholder="Ask about budget, audience, creatives…"
            placeholderTextColor="#69707D"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            multiline
          />
          <Pressable
            onPress={() => send(input)}
            accessibilityRole="button"
            accessibilityLabel="Send prompt"
            className="w-11 h-11 rounded-md items-center justify-center bg-primary dark:bg-primary-dark active:opacity-80"
            disabled={!input.trim()}>
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}