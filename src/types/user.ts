export type UserRole = 'business_owner' | 'marketing_manager' | 'creator';
export type PlanMode = 'lite' | 'pro';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  businessId: string;
  mode: PlanMode;
  plan: PlanMode;
  industry: string;
  monthlyBudget: number;
  currency: string;
  onboardingCompleted: boolean;
  createdAt: string;
};

export type Business = {
  id: string;
  name: string;
  industry: string;
  description: string;
  website: string;
  logo?: string | null;
  ownerId: string;
  monthlyBudget: number;
  currency: string;
  location: string;
  createdAt: string;
};

export type Session = {
  userId: string;
  lastActiveAt: string;
};