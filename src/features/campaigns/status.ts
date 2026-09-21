import type { BadgeTone } from '@/components/ui';
import type { CampaignStatus } from '@/types';

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  completed: { label: 'Completed', tone: 'info' },
  rejected: { label: 'Rejected', tone: 'danger' },
};