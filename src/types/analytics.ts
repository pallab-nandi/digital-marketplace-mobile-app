export type PlatformId = 'google' | 'meta' | 'instagram' | 'reddit' | 'x' | 'linkedin';
export type Period = '7d' | '30d' | '90d' | 'custom';

export type Kpis = {
  totalSpend: number;
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
};

export type DashboardSummary = Kpis & {
  userId: string;
  period: Period;
  activeCampaigns: number;
  completedCampaigns: number;
};

export type PlatformSummary = Kpis & {
  platformId: string;
  period: Period;
};

export type InsightSeverity = 'info' | 'warning' | 'critical';
export type InsightType = 'positive' | 'negative' | 'neutral';

export type Insight = {
  id: string;
  campaignId?: string | null;
  type: InsightType;
  title: string;
  description: string;
  metric: string;
  metricValue: number;
  change: number;
  severity: InsightSeverity;
  createdAt: string;
};