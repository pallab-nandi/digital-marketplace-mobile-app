export type NotificationType = 'campaign' | 'analytics' | 'budget' | 'ai' | 'creator' | 'system';

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string | null;
  isRead: boolean;
  createdAt: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
};

export type OnboardingData = {
  name: string;
  businessName: string;
  industry: string;
  objective: string;
  monthlyBudget: number;
  platforms: string[];
  category: string;
  experienceLevel: string;
};

export type DemoEvent = {
  id: string;
  name: string;
  type: string;
  description: string;
  result: string;
};