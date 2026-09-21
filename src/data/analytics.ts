import type { DailyMetric } from '@/types';
import { datePlusDaysISO, randInt, round } from '@/utils/mock';

const basePerPlatform: Record<string, { impressions: number; clicks: number; conversions: number; spend: number }> = {
  meta: { impressions: 6200, clicks: 285, conversions: 4, spend: 260 },
  google: { impressions: 3400, clicks: 175, conversions: 3, spend: 218 },
  instagram: { impressions: 4100, clicks: 140, conversions: 2, spend: 153 },
  reddit: { impressions: 2900, clicks: 105, conversions: 1, spend: 162 },
};

function generateDailyMetrics(
  campaignId: string,
  platforms: string[],
  startDate: string,
  days: number,
): DailyMetric[] {
  const out: DailyMetric[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = datePlusDaysISO(start.toISOString(), i).slice(0, 10);
    for (const platformId of platforms) {
      const base = basePerPlatform[platformId] ?? { impressions: 3000, clicks: 120, conversions: 2, spend: 150 };
      const seed = `${campaignId}-${platformId}-${date}`;
      const impressions = randInt(Math.round(base.impressions * 0.75), Math.round(base.impressions * 1.35), seed);
      const clicks = randInt(Math.round(base.clicks * 0.7), Math.round(base.clicks * 1.4), `${seed}-c`);
      const conversions = randInt(Math.max(1, Math.round(base.conversions * 0.5)), Math.round(base.conversions * 1.8), `${seed}-x`);
      const spend = round(
        randInt(Math.round(base.spend * 0.7), Math.round(base.spend * 1.4), `${seed}-s`),
        0,
      );
      const revenue = round(spend * (1.5 + randInt(0, 350, `${seed}-r`) / 100), 2);
      out.push({
        id: `dm_${campaignId.slice(-4)}_${platformId}_${date}`,
        campaignId,
        platformId,
        date,
        impressions,
        reach: Math.round(impressions * (0.45 + randInt(0, 25, `${seed}-p`) / 100)),
        clicks,
        conversions,
        spend,
        revenue,
      });
    }
  }
  return out;
}

// Startup date for metric generation (30 days of rich data)
const METRIC_START = '2026-08-20';

export const dailyMetrics: DailyMetric[] = [
  ...generateDailyMetrics('campaign_001', ['meta', 'google', 'instagram'], METRIC_START, 30),
  ...generateDailyMetrics('campaign_002', ['meta', 'google', 'reddit'], METRIC_START, 30),
  ...generateDailyMetrics('campaign_003', ['meta', 'google'], '2026-07-01', 30),
  ...generateDailyMetrics('campaign_006', ['google', 'meta', 'instagram'], METRIC_START, 30),
  ...generateDailyMetrics('campaign_008', ['instagram', 'meta'], METRIC_START, 30),
];