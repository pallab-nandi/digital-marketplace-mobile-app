/** Onboarding choices per agent_docs/DESIGN.md section 9. */

export const MARKETING_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
  { value: 'brand', label: 'Brand' },
  { value: 'app', label: 'App' },
  { value: 'creator_business', label: 'Creator business' },
] as const;

export const CATEGORY_INDUSTRY: Record<string, string> = {
  product: 'Consumer Goods',
  service: 'Professional Services',
  brand: 'Brand',
  app: 'Technology',
  creator_business: 'Content Creation',
};

/** Maps to CampaignObjective. */
export const MARKETING_GOALS = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'lead_generation', label: 'Leads' },
  { value: 'sales', label: 'Sales' },
  { value: 'engagement', label: 'Engagement' },
] as const;

export const DEFAULT_ONBOARDING_BUDGET = 100000;
export const DEFAULT_ONBOARDING_PLATFORMS = ['meta', 'google', 'instagram'];

export const GOAL_FORWARD_LABEL: Record<string, string> = {
  awareness: 'brand awareness',
  traffic: 'website traffic',
  lead_generation: 'lead generation',
  sales: 'online sales',
  engagement: 'engagement',
};