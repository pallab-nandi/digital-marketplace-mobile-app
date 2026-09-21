import { aiRecommendations, campaigns } from '@/data';
import type { AIRecommendation, AIGeneratedPlan, CampaignObjective, RecommendationPriority, RecommendationType } from '@/types';
import { randInt, uid } from '@/utils/mock';

export function getAIRecommendations(campaignId: string): AIRecommendation[] {
  return aiRecommendations.filter((r) => r.campaignId === campaignId);
}

/** Mark a recommendation as applied (builds new record, does not persist). */
export function applyRecommendation(rec: AIRecommendation): AIRecommendation {
  return { ...rec, isApplied: true };
}

const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'brand awareness',
  traffic: 'website traffic',
  lead_generation: 'lead generation',
  sales: 'online sales',
  app_promotion: 'app installs',
  engagement: 'engagement',
};

type GenerateInput = {
  objective?: CampaignObjective;
  businessName?: string;
  monthlyBudget?: number;
  platforms?: string[];
  prompt?: string;
  campaignId?: string | null;
};

/** Deterministic canned AI plan for the campaign wizard. */
export function generateAIPlan(input: GenerateInput): AIGeneratedPlan {
  const objective = input.objective ?? 'sales';
  const platforms = input.platforms?.length ? input.platforms : ['meta', 'google', 'instagram'];
  const budget = input.monthlyBudget ?? 50000;
  const seed = `${objective}-${platforms[0] ?? 'meta'}-${budget}`;
  const daily = Math.max(500, Math.round((budget / 30) / 10) * 10);

  return {
    objective: OBJECTIVE_LABELS[objective],
    audience: 'Urban professionals aged 24-38 in metro cities',
    locations: randInt(0, 1, seed) ? ['Bangalore', 'Mumbai', 'Delhi'] : ['Delhi', 'Pune', 'Hyderabad'],
    interests: objective === 'awareness' ? ['Lifestyle', 'Trends', 'News'] : ['Online Shopping', 'Deals', 'Lifestyle'],
    keywords: [input.businessName ?? 'premium brand', 'best value', 'shop online', 'free delivery'],
    recommendedPlatforms: platforms.slice(0, 3),
    suggestedDailyBudget: daily,
    creativeDirection: objective === 'awareness' ? 'Story-driven video' : 'Performance-focused carousel with clear CTA',
    cta: objective === 'lead_generation' ? 'Get Guide' : 'Shop Now',
  };
}

/** Deterministic canned chat assistant responses for the AI chat screen. */
export function generateMockAIResponse(input: GenerateInput): string {
  const prompt = (input.prompt ?? '').toLowerCase();
  if (/(budget|spend|cost)/.test(prompt)) {
    return `Based on a ₹${(input.monthlyBudget ?? 50000).toLocaleString('en-IN')}/month budget, I suggest starting with a ${input.objective === 'awareness' ? 'lower' : 'moderate'} daily spend of ₹${(input.monthlyBudget ?? 50000) > 60000 ? '1,500' : '1,000'} on Meta-first, then scaling winners to Google. Hold enough budget for weekends when CPA usually drops.`;
  }
  if (/(audience|target|who)/.test(prompt)) {
    return 'Your strongest audience for this category is urban professionals 24-38, opted into shopping behaviors, across Bangalore, Mumbai and Delhi. I would layer in lookalike audiences once you collect 1,000+ conversions.';
  }
  if (/(creative|image|video|ad copy)/.test(prompt)) {
    return 'Start with a video-first creative (15-30s) showing the product in lifestyle use, with a clear benefit hook in the first 2 seconds. Test 2 variants: benefit-led vs social-proof-led copy.';
  }
  if (/(platform|where|google|meta|instagram)/.test(prompt)) {
    return 'I recommend Meta for volume + Instagram for visually-led products, Google Search for high-intent buyers, and Reddit only if your audience is community-active there. Start with Meta + Google.';
  }
  return `Here is a plan to crush your "${input.objective === 'awareness' ? 'brand awareness' : OBJECTIVE_LABELS[(input.objective ?? 'sales') as CampaignObjective]}" goal for ${input.businessName ?? 'your brand'}: focus on short-form video, target urban professionals, and run a controlled A/B test before scaling budget.`;
}

export { aiRecommendations, campaigns };

// ---------------------------------------------------------------------------
// Phase 8 — AI Campaign Assistant (deterministic, no API)
// ---------------------------------------------------------------------------

export type MockChatReply = {
  text: string;
  recommendations: AIRecommendation[];
};

type RecTemplate = {
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  priority: RecommendationPriority;
  data: Record<string, unknown>;
};

const TOPIC_RECS: Record<string, RecTemplate[]> = {
  coffee: [
    {
      type: 'keyword',
      title: 'Expand premium coffee keywords',
      description: 'Add specialty and artisan coffee terms to capture high-intent coffee shoppers.',
      confidence: 0.87,
      priority: 'high',
      data: { keywords: ['specialty coffee', 'artisan coffee', 'single origin', 'cold brew kits'] },
    },
    {
      type: 'audience',
      title: 'Target urban coffee lovers 24-38',
      description: 'City professionals with disposable income convert best for coffee products.',
      confidence: 0.84,
      priority: 'high',
      data: { audienceId: 'aud_001', ageMin: 24, ageMax: 38, locations: ['Bangalore', 'Mumbai', 'Delhi'] },
    },
    {
      type: 'platform',
      title: 'Lead with Instagram Reels',
      description: 'Short pour-over demos on Reels outperform static images for food & beverage.',
      confidence: 0.78,
      priority: 'medium',
      data: { from: 'reddit', to: 'instagram', amount: 2000 },
    },
    {
      type: 'creative',
      title: 'Hero video: morning pour-over',
      description: 'A 15-30s lifestyle video with a strong first-frame hook lifts CTR.',
      confidence: 0.76,
      priority: 'medium',
      data: { direction: '15-30s lifestyle video, pour-over at sunrise', cta: 'Shop Now' },
    },
    {
      type: 'budget',
      title: 'Front-load weekend spend',
      description: 'Coffee orders spike on weekends; weight 20% more budget into Sat-Sun.',
      confidence: 0.71,
      priority: 'low',
      data: { dailyBudget: 1200, note: 'Weekend uplift strategy' },
    },
  ],
  fitness: [
    {
      type: 'keyword',
      title: 'Target home-workout demand',
      description: 'Home gym, wellness and recovery terms are trending for this category.',
      confidence: 0.85,
      priority: 'high',
      data: { keywords: ['home workout gear', 'protein bundles', 'yoga mats', 'recovery tools'] },
    },
    {
      type: 'audience',
      title: 'Focus on fitness enthusiasts 18-40',
      description: 'Active users who follow fitness content buy gear and supplements repeatedly.',
      confidence: 0.86,
      priority: 'high',
      data: { audienceId: 'aud_004', ageMin: 18, ageMax: 40, locations: ['Bangalore', 'Mumbai'] },
    },
    {
      type: 'creative',
      title: '15s transformation shorts',
      description: 'Before/after shorts with captions convert strongly on Instagram and TikTok.',
      confidence: 0.8,
      priority: 'medium',
      data: { direction: '15s before/after transformation short', cta: 'Start Now' },
    },
    {
      type: 'platform',
      title: 'Lean on Meta + Google Fit queries',
      description: 'Combining Meta reach with Google intent captures both discovery and demand.',
      confidence: 0.74,
      priority: 'medium',
      data: { from: 'reddit', to: 'google', amount: 2500 },
    },
    {
      type: 'budget',
      title: 'Scale winners after 500 conversions',
      description: 'Once the campaign clears 500 conversions, raise daily spend 15% on top platforms.',
      confidence: 0.69,
      priority: 'low',
      data: { dailyBudget: 1500, note: 'Scaling rule' },
    },
  ],
  fashion: [
    {
      type: 'keyword',
      title: 'Add trending streetwear keywords',
      description: 'Streetwear, festival outfits and minimal basics drive fashion-related search.',
      confidence: 0.86,
      priority: 'high',
      data: { keywords: ['trending streetwear', 'festival outfits', 'minimal basics', 'seasonal drops'] },
    },
    {
      type: 'audience',
      title: 'Target fashion-forward millennials 20-38',
      description: 'Style-conscious early adopters who follow trends and shop online frequently.',
      confidence: 0.88,
      priority: 'high',
      data: { audienceId: 'aud_002', ageMin: 20, ageMax: 38, locations: ['Mumbai', 'Delhi'] },
    },
    {
      type: 'creative',
      title: 'Carousel lookbook — 5 slides',
      description: 'A swipeable lookbook outperforms single image ads for apparel, up to 22%.',
      confidence: 0.79,
      priority: 'medium',
      data: { direction: '5-slide carousel lookbook', cta: 'Shop the Drop' },
    },
    {
      type: 'platform',
      title: 'Push Instagram Stories',
      description: 'Stories have the lowest CPA of all positions for this audience.',
      confidence: 0.77,
      priority: 'medium',
      data: { from: 'google', to: 'instagram', amount: 1800 },
    },
    {
      type: 'budget',
      title: 'Reserve 15% for launch spikes',
      description: 'Keep a buffer for drop days and collab announcements; CPA drops sharply then.',
      confidence: 0.68,
      priority: 'low',
      data: { dailyBudget: 1300, note: 'Launch spike buffer' },
    },
  ],
};

const GENERIC_RECS: RecTemplate[] = [
  {
    type: 'audience',
    title: 'Focus on urban professionals 24-38',
    description: 'Your highest-converting segment is urban professionals in metro cities.',
    confidence: 0.82,
    priority: 'high',
    data: { audienceId: 'aud_001', ageMin: 24, ageMax: 38, locations: ['Bangalore', 'Mumbai', 'Delhi'] },
  },
  {
    type: 'keyword',
    title: 'Build a tight keyword set',
    description: 'Start with 8-12 high-intent keywords and let the winners receive more budget.',
    confidence: 0.75,
    priority: 'medium',
    data: { keywords: ['best value', 'shop online', 'free delivery'] },
  },
  {
    type: 'creative',
    title: 'Performance carousel with clear CTA',
    description: 'Carousels with one clear benefit per slide and a strong CTA test well across most categories.',
    confidence: 0.72,
    priority: 'medium',
    data: { direction: 'Performance-focused carousel with clear CTA', cta: 'Shop Now' },
  },
  {
    type: 'budget',
    title: 'Keep daily pace consistent',
    description: 'Spreading daily budget evenly stops overspend early in the month.',
    confidence: 0.65,
    priority: 'low',
    data: { dailyBudget: 1000, note: 'Even daily pacing' },
  },
];

const TOPIC_TEXTS: Record<string, { pattern: RegExp; pitch: string }> = {
  coffee: {
    pattern: /coffee|brew|caf[eé]|espresso|bean|roast/i,
    pitch:
      'I went through your coffee campaigns. The strongest move is to expand premium keywords (specialty + artisan) and push Instagram Reels for pour-over demos. I have pulled together a few recommendations below you can apply in one tap.',
  },
  fitness: {
    pattern: /fitness|gym|workout|exercise|health|wellness|yoga|protein/i,
    pitch:
      'For fitness, the opportunity is home-workout demand — think bundles, yoga mats and recovery gear. Before/after shorts tend to outperform here. The plan below is ready to apply.',
  },
  fashion: {
    pattern: /fashion|apparel|style|clothing|streetwear|outfit|brand|lookbook/i,
    pitch:
      'Fashion performs best with a swipeable lookbook and Instagram Stories, which carry the lowest CPA for this audience. I have drafted recommendations below — review and apply whatever fits.',
  },
};

function buildRecommendations(topic: string | null, campaignId: string | null | undefined): AIRecommendation[] {
  const templates = (topic && TOPIC_RECS[topic]) || GENERIC_RECS;
  const now = new Date().toISOString();
  return templates.map((t) => ({
    id: uid('ai'),
    campaignId: campaignId ?? '',
    type: t.type,
    title: t.title,
    description: t.description,
    confidence: t.confidence,
    priority: t.priority,
    recommendationData: t.data,
    isApplied: false,
    createdAt: now,
  }));
}

/**
 * Deterministic chat reply for the AI assistant screen.
 * Detects a product topic (coffee/fitness/fashion) for the recommendation set,
 * then answers the specific question (budget, audience, creative, platform)
 * with a canned text response. Unknown inputs fall back to a generic plan.
 */
export function generateAssistantReply(input: GenerateInput): MockChatReply {
  const prompt = (input.prompt ?? '').toLowerCase();
  const topicEntry = Object.values(TOPIC_TEXTS).find((t) => t.pattern.test(prompt));
  const topic = topicEntry ? Object.keys(TOPIC_TEXTS).find((k) => TOPIC_TEXTS[k].pattern.test(prompt)) ?? null : null;

  let text: string;
  if (/(budget|spend|cost|allocat|split)/.test(prompt)) {
    text = `Based on a ₹${(input.monthlyBudget ?? 50000).toLocaleString('en-IN')}/month budget, I suggest a ${input.objective === 'awareness' ? 'lower' : 'moderate'} daily pace and front-loading weekends for this category. Keep a small buffer for spikes — it keeps CPA steady.`;
  } else if (/(audience|target|who|segment|demographic)/.test(prompt)) {
    text = `Your strongest audience for this category is urban professionals 24-38 across Bangalore, Mumbai and Delhi. Layer a lookalike once you pass 1,000 conversions — that is usually where scale kicks in.`;
  } else if (/(creative|image|video|ad copy|adcopy|visual)/.test(prompt)) {
    text = `Start with a ${topic ?? 'benefit-led'} video or carousel and test two copy angles: benefit-led vs social-proof-led. Keep the first 2 seconds as the hook, then let the CTA do the work.`;
  } else if (/(platform|where|google|meta|instagram|facebook|reddit|linkedin)/.test(prompt)) {
    text = `I would run Meta for volume, Instagram for visually-led products and Google for high-intent searches in this category. Start with two platforms, then shift spend to whatever wins.`;
  } else if (topicEntry) {
    text = topicEntry.pitch;
  } else {
    text = `Here is a plan to grow "${input.businessName ?? 'your brand'}": tight keywords, a clearly targeted audience, and one strong creative tested in pairs before you scale. The recommendations below summarise the playbook.`;
  }

  return {
    text,
    recommendations: buildRecommendations(topic, input.campaignId),
  };
}