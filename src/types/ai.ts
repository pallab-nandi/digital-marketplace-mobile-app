export type RecommendationType =
  | 'keyword'
  | 'audience'
  | 'budget'
  | 'platform'
  | 'creative'
  | 'optimization'
  | 'warning';

export type RecommendationPriority = 'low' | 'medium' | 'high';

export type AIRecommendation = {
  id: string;
  campaignId: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  priority: RecommendationPriority;
  recommendationData: Record<string, unknown>;
  isApplied: boolean;
  createdAt: string;
};

export type AIMessageRole = 'user' | 'assistant';

export type AIMessage = {
  id: string;
  conversationId: string;
  role: AIMessageRole;
  message: string;
  createdAt: string;
  recommendations: AIRecommendation[];
};

export type AIGeneratedPlan = {
  objective: string;
  audience: string;
  locations: string[];
  interests: string[];
  keywords: string[];
  recommendedPlatforms: string[];
  suggestedDailyBudget: number;
  creativeDirection: string;
  cta: string;
};

export type AIConversation = {
  id: string;
  userId: string;
  messages: AIMessage[];
  createdAt: string;
};