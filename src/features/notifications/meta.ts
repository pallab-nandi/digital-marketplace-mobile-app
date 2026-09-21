import { AlertCircle, Bell, Megaphone, Sparkles, TrendingUp, Users } from 'lucide-react-native';

import type { NotificationType } from '@/types';

export const NOTIFICATION_TYPE_META: Record<NotificationType, { Icon: typeof Bell; color: string }> = {
  campaign: { Icon: Megaphone, color: '#5B5CE2' },
  analytics: { Icon: TrendingUp, color: '#2563EB' },
  budget: { Icon: AlertCircle, color: '#D97706' },
  ai: { Icon: Sparkles, color: '#5B5CE2' },
  creator: { Icon: Users, color: '#16A34A' },
  system: { Icon: Bell, color: '#69707D' },
};

export function notificationTimeLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date('2026-09-18T00:00:00Z');
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}