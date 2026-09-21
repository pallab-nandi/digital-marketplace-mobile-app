import { notifications as seedNotifications } from '@/data';
import type { AppNotification } from '@/types';
import { uid } from '@/utils/mock';

export function getNotifications(userId: string): AppNotification[] {
  return [...seedNotifications]
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getUnreadCount(userId: string): number {
  return seedNotifications.filter((n) => n.userId === userId && !n.isRead).length;
}

/** Build a read-mutated notification record (does not persist). */
export function markNotificationRead(notification: AppNotification): AppNotification {
  return { ...notification, isRead: true };
}

/** Build a new notification record (does not persist). */
export function createNotification(
  input: Pick<AppNotification, 'userId' | 'type' | 'title' | 'message'> &
    Partial<Pick<AppNotification, 'relatedId'>>,
): AppNotification {
  return {
    id: uid('notif'),
    ...input,
    relatedId: input.relatedId ?? null,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}