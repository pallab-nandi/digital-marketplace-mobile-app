export type CreatorAvailability = 'available' | 'busy' | 'limited';

export type Creator = {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
  coverImage?: string | null;
  bio: string;
  location: string;
  categories: string[];
  skills: string[];
  rating: number;
  reviewCount: number;
  completedProjects: number;
  audienceSize: number;
  engagementRate: number;
  startingPrice: number;
  currency: string;
  verified: boolean;
  availability: CreatorAvailability;
  creatorIndex: number;
  socialLinks: string[];
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video' | 'carousel';
  thumbnail?: string | null;
  media?: string | null;
  category: string;
  clientIndustry: string;
  publishedAt: string;
  metrics: Record<string, number>;
};

export type CreatorService = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currency: string;
  deliveryDays: number;
  revisions: number;
};

export type CreatorReview = {
  id: string;
  creatorId: string;
  reviewerName: string;
  reviewerCompany: string;
  rating: number;
  comment: string;
  projectType: string;
  createdAt: string;
};

export type CreatorPerformance = {
  id: string;
  creatorId: string;
  creativity: number;
  editingSkill: number;
  contentQuality: number;
  audienceReach: number;
  engagement: number;
  socialPresence: number;
  clientSatisfaction: number;
  completedProjects: number;
};

export type SavedCreator = {
  id: string;
  userId: string;
  creatorId: string;
  createdAt: string;
};

export type CollaborationStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export type CollaborationRequest = {
  id: string;
  creatorId: string;
  businessId: string;
  campaignId?: string | null;
  serviceId: string;
  message: string;
  budget: number;
  currency: string;
  status: CollaborationStatus;
  createdAt: string;
  updatedAt: string;
};