import { businesses, users } from '@/data';
import type { Business, Session, User } from '@/types';

export function getUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getBusinessById(id: string): Business | undefined {
  return businesses.find((b) => b.id === id);
}

export function getBusinessByUser(userId: string): Business | undefined {
  const user = getUserById(userId);
  return user ? getBusinessById(user.businessId) : undefined;
}

/** Demo "login" — resolves a user by email (case-insensitive). */
export function login(email: string): Session | null {
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;
  return { userId: user.id, lastActiveAt: new Date().toISOString() };
}

export { businesses, users };