import { campaigns, dailyMetrics, insights as seedInsights } from '@/data';
import { getBusinessByUser } from '@/services/auth';
import type {
  DailyMetric,
  DashboardSummary,
  Insight,
  Kpis,
  Period,
  PlatformId,
  PlatformSummary,
} from '@/types';
import { round } from '@/utils/mock';

export type MetricsFilter = {
  campaignIds?: string[];
  platformIds?: string[];
  period?: Period;
  startDate?: string;
  endDate?: string;
};

const EMPTY_KPIS: Kpis = {
  totalSpend: 0,
  totalImpressions: 0,
  totalReach: 0,
  totalClicks: 0,
  totalConversions: 0,
  totalRevenue: 0,
  ctr: 0,
  cpc: 0,
  cpa: 0,
  roas: 0,
};

function periodDays(period: Period): number {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '90d') return 90;
  return 90;
}

export function getDailyMetrics(filters: MetricsFilter = {}): DailyMetric[] {
  let rows = dailyMetrics;
  if (filters.campaignIds?.length) rows = rows.filter((r) => filters.campaignIds!.includes(r.campaignId));
  if (filters.platformIds?.length) rows = rows.filter((r) => filters.platformIds!.includes(r.platformId));
  if (filters.startDate) {
    const start = filters.startDate;
    rows = rows.filter((r) => r.date >= start);
  }
  if (filters.endDate) {
    const end = filters.endDate;
    rows = rows.filter((r) => r.date <= end);
  }
  if (filters.period) {
    const days = periodDays(filters.period);
    const today = new Date('2026-09-18T00:00:00Z');
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - days);
    rows = rows.filter((r) => new Date(`${r.date}T00:00:00Z`) >= cutoff);
  }
  return [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Aggregate daily rows into KPI metrics with derived rates. */
export function aggregateMetrics(rows: DailyMetric[]): Kpis {
  const total = rows.reduce(
    (acc, r) => {
      acc.spend += r.spend;
      acc.impressions += r.impressions;
      acc.reach += r.reach;
      acc.clicks += r.clicks;
      acc.conversions += r.conversions;
      acc.revenue += r.revenue;
      return acc;
    },
    { spend: 0, impressions: 0, reach: 0, clicks: 0, conversions: 0, revenue: 0 },
  );
  return {
    totalSpend: round(total.spend),
    totalImpressions: total.impressions,
    totalReach: total.reach,
    totalClicks: total.clicks,
    totalConversions: total.conversions,
    totalRevenue: round(total.revenue),
    ctr: round(total.impressions ? (total.clicks / total.impressions) * 100 : 0),
    cpc: round(total.clicks ? total.spend / total.clicks : 0),
    cpa: round(total.conversions ? total.spend / total.conversions : 0),
    roas: round(total.spend ? total.revenue / total.spend : 0),
  };
}

function campaignIdsForBusiness(businessId: string): string[] {
  return campaigns.filter((c) => c.businessId === businessId).map((c) => c.id);
}

export function getDashboardSummary(userId: string, period: Period): DashboardSummary {
  const business = getBusinessByUser(userId);
  const ids = business ? campaignIdsForBusiness(business.id) : [];
  const rows = getDailyMetrics({ campaignIds: ids, period });
  const kpis = aggregateMetrics(rows);
  const businessCampaigns = business ? campaigns.filter((c) => c.businessId === business.id) : [];
  return {
    userId,
    period,
    ...kpis,
    activeCampaigns: businessCampaigns.filter((c) => c.status === 'active').length,
    completedCampaigns: businessCampaigns.filter((c) => c.status === 'completed').length,
  };
}

export function getPlatformSummary(platformId: PlatformId, period: Period): PlatformSummary {
  const rows = getDailyMetrics({ platformIds: [platformId], period });
  const kpis = aggregateMetrics(rows);
  return { platformId, period, ...kpis };
}

export function getPlatformSummaries(period: Period, platformIds: PlatformId[]): PlatformSummary[] {
  return platformIds.map((id) => getPlatformSummary(id, period));
}

export function getInsights(campaignId?: string | null): Insight[] {
  if (!campaignId) return [...seedInsights];
  return seedInsights.filter((i) => i.campaignId === campaignId);
}

export type TrendMetric = 'spend' | 'revenue' | 'conversions';

export type TrendPoint = { date: string; spend: number; revenue: number; conversions: number };

function isoDaysAgo(days: number): string {
  const d = new Date('2026-09-18T00:00:00Z');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Per-day totals for the user's campaigns over the period, oldest first. */
export function getDailyTrend(userId: string, period: Period): TrendPoint[] {
  const business = getBusinessByUser(userId);
  if (!business) return [];
  return groupTrend(getDailyMetrics({ campaignIds: campaignIdsForBusiness(business.id), period }));
}

function groupTrend(rows: DailyMetric[]): TrendPoint[] {
  const byDate = new Map<string, TrendPoint>();
  for (const r of rows) {
    const point = byDate.get(r.date) ?? { date: r.date, spend: 0, revenue: 0, conversions: 0 };
    point.spend += r.spend;
    point.revenue += r.revenue;
    point.conversions += r.conversions;
    byDate.set(r.date, point);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Per-day totals for a single campaign, optionally constrained to one platform. */
export function getCampaignTrend(
  campaignId: string,
  period: Period,
  platformId?: PlatformId,
): TrendPoint[] {
  return groupTrend(getDailyMetrics({ campaignIds: [campaignId], platformIds: platformId ? [platformId] : undefined, period }));
}

/** KPI totals for the current window and the equal-length window before it. */
export function getKpisVsPrevious(filters: MetricsFilter): { current: Kpis; previous: Kpis } {
  const days = periodDays(filters.period ?? '30d');
  const previousEnd = isoDaysAgo(days);
  const previousStart = isoDaysAgo(days * 2 - 1);
  const current = aggregateMetrics(getDailyMetrics({ ...filters, startDate: previousEnd, endDate: '2026-09-18' }));
  const previous = aggregateMetrics(getDailyMetrics({ ...filters, startDate: previousStart, endDate: previousEnd }));
  return { current, previous };
}

export function getDashboardVsPrevious(userId: string, period: Period): { current: Kpis; previous: Kpis } {
  const business = getBusinessByUser(userId);
  if (!business) return { current: { ...EMPTY_KPIS }, previous: { ...EMPTY_KPIS } };
  return getKpisVsPrevious({ campaignIds: campaignIdsForBusiness(business.id), period });
}

/** Per-day grouped totals for an arbitrary filter set, oldest first. */
export function getFilteredTrend(filters: MetricsFilter): TrendPoint[] {
  return groupTrend(getDailyMetrics(filters));
}

export type PlatformPerformance = { platformId: PlatformId; spend: number; revenue: number; conversions: number; roas: number };

/** Aggregate period totals per platform for the user's campaigns. */
export function getPlatformPerformance(userId: string, period: Period): PlatformPerformance[] {
  const business = getBusinessByUser(userId);
  if (!business) return [];
  const rows = getDailyMetrics({ campaignIds: campaignIdsForBusiness(business.id), period });
  const ids = [...new Set(rows.map((r) => r.platformId))] as PlatformId[];
  return ids
    .map((platformId) => {
      const k = aggregateMetrics(rows.filter((r) => r.platformId === platformId));
      return { platformId, spend: k.totalSpend, revenue: k.totalRevenue, conversions: k.totalConversions, roas: k.roas };
    })
    .sort((a, b) => b.spend - a.spend);
}

export { EMPTY_KPIS };