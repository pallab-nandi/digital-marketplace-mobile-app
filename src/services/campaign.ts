import { audiences, campaignPlatforms, campaigns, creatives } from '@/data';
import { platforms } from '@/data/users';
import type {
  Audience,
  Campaign,
  CampaignObjective,
  CampaignPlatform,
  CampaignStatus,
  Creative,
  Platform,
} from '@/types';
import { round } from '@/utils/mock';

export type CampaignKpis = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
};

/** Aggregate campaign platform rows into KPI metrics with derived rates. */
export function summarizeCampaignPlatforms(rows: CampaignPlatform[]): CampaignKpis {
  const spend = rows.reduce((s, r) => s + r.spent, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const conversions = rows.reduce((s, r) => s + r.conversions, 0);
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  return {
    spend: round(spend),
    impressions,
    clicks,
    conversions,
    revenue: round(revenue),
    ctr: round(impressions ? (clicks / impressions) * 100 : 0),
    cpc: round(clicks ? spend / clicks : 0),
    cpa: round(conversions ? spend / conversions : 0),
    roas: round(spend ? revenue / spend : 0),
  };
}

export type CampaignFilters = {
  businessId?: string;
  status?: CampaignStatus;
  objective?: CampaignObjective;
  platformId?: string;
  search?: string;
};

export function getPlatforms(): Platform[] {
  return [...platforms] as Platform[];
}

export function getCampaigns(filters: CampaignFilters = {}): Campaign[] {
  let list = campaigns;
  if (filters.businessId) list = list.filter((c) => c.businessId === filters.businessId);
  if (filters.status) list = list.filter((c) => c.status === filters.status);
  if (filters.objective) list = list.filter((c) => c.objective === filters.objective);
  if (filters.platformId) {
    const ids = campaignPlatforms
      .filter((cp) => cp.platformId === filters.platformId)
      .map((cp) => cp.campaignId);
    list = list.filter((c) => ids.includes(c.id));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }
  return [...list].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}

export function getCampaignPlatforms(campaignId: string): CampaignPlatform[] {
  return campaignPlatforms.filter((cp) => cp.campaignId === campaignId);
}

export function getCampaignPlatform(campaignId: string, platformId: string): CampaignPlatform | undefined {
  return campaignPlatforms.find((cp) => cp.campaignId === campaignId && cp.platformId === platformId);
}

export function getAudiences(): Audience[] {
  return audiences;
}

export function getAudienceById(id: string): Audience | undefined {
  return audiences.find((a) => a.id === id);
}

export function getCreatives(campaignId: string): Creative[] {
  return creatives.filter((cr) => cr.campaignId === campaignId);
}

export function getCreativeById(id: string): Creative | undefined {
  return creatives.find((cr) => cr.id === id);
}

export function getCampaignSpend(campaign: Campaign): number {
  const rows = campaignPlatforms.filter((cp) => cp.campaignId === campaign.id);
  return rows.reduce((sum, row) => sum + row.spent, 0);
}