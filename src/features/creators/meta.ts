import { Image, Images, Play } from 'lucide-react-native';

import type { BadgeTone } from '@/components/ui';
import type { Creator, CreatorAvailability, PortfolioItem } from '@/types';

export const AVAILABILITY_META: Record<
  CreatorAvailability,
  { label: string; tone: BadgeTone }
> = {
  available: { label: 'Available', tone: 'success' },
  limited: { label: 'Limited', tone: 'warning' },
  busy: { label: 'Busy', tone: 'neutral' },
};

/** Reusable cover tints so portfolio placeholders stay on-brand. */
export const COVER_TINTS = [
  '#5B5CE2',
  '#7C3AED',
  '#2563EB',
  '#0E7490',
  '#059669',
  '#B45309',
  '#DB2777',
  '#4F46E5',
];

const MEDIA_LABEL: Record<PortfolioItem['mediaType'], string> = {
  image: 'Photo',
  video: 'Video',
  carousel: 'Carousel',
};

export function mediaTypeLabel(type: PortfolioItem['mediaType']): string {
  return MEDIA_LABEL[type];
}

/** Stable, module-scope icon map (never create components during render). */
export const MEDIA_TYPE_ICONS: Record<
  PortfolioItem['mediaType'],
  typeof Play
> = {
  video: Play,
  image: Image,
  carousel: Images,
};

/** Pick the portfolio item that best represents the creator's work. */
export function coverItem(creator: Creator, portfolio: PortfolioItem[]): PortfolioItem | undefined {
  return portfolio[0] ?? undefined;
}

export function coverTint(creator: Creator): string {
  return COVER_TINTS[creator.creatorIndex % COVER_TINTS.length];
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(Math.round(value));
}

export function ratingLabel(rating: number): string {
  return rating.toFixed(1);
}