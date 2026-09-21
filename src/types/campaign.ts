export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'lead_generation'
  | 'sales'
  | 'app_promotion'
  | 'engagement';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'rejected';

export type Campaign = {
  id: string;
  businessId: string;
  createdBy: string;
  name: string;
  description: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  totalBudget: number;
  dailyBudget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate: string;
  landingPage: string;
  primaryCreativeId?: string | null;
  audienceId?: string | null;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Audience = {
  id: string;
  name: string;
  ageMin: number;
  ageMax: number;
  genders: string[];
  locations: string[];
  languages: string[];
  interests: string[];
  behaviors: string[];
  estimatedSize: number;
  description: string;
};

export type CreativeType = 'image' | 'video' | 'carousel' | 'graphic';

export type Creative = {
  id: string;
  campaignId: string;
  type: CreativeType;
  name: string;
  thumbnail?: string | null;
  asset?: string | null;
  headline: string;
  description: string;
  cta: string;
  duration?: number | null;
  dimensions?: string | null;
  status: string;
};

export type Platform = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  isAvailable: boolean;
  isConnected: boolean;
  brandColorToken: string;
};

export type PlatformStatus = 'active' | 'paused' | 'scheduled' | 'completed';

export type CampaignPlatform = {
  id: string;
  campaignId: string;
  platformId: string;
  status: PlatformStatus;
  allocatedBudget: number;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  revenue: number;
  roas: number;
};

export type DailyMetric = {
  id: string;
  campaignId: string;
  platformId: string;
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  revenue: number;
};