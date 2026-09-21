import {
  collaborationRequests as seedCollabs,
  creatorPerformance,
  creatorPortfolio,
  creatorReviews,
  creators,
  creatorServices,
  savedCreators,
} from '@/data';
import type {
  CollaborationRequest,
  CollaborationStatus,
  Creator,
  CreatorPerformance,
  CreatorReview,
  CreatorService,
  PortfolioItem,
  SavedCreator,
} from '@/types';
import { uid } from '@/utils/mock';

export type CreatorFilters = {
  search?: string;
  category?: string;
  location?: string;
  availability?: string;
  minRating?: number;
  maxPrice?: number;
  minEngagement?: number;
  verified?: boolean;
};

export function getCreators(filters: CreatorFilters = {}): Creator[] {
  let list = creators;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }
  if (filters.category) list = list.filter((c) => c.categories.includes(filters.category!));
  if (filters.location) list = list.filter((c) => c.location === filters.location);
  if (filters.availability) list = list.filter((c) => c.availability === filters.availability);
  if (filters.minRating != null) list = list.filter((c) => c.rating >= filters.minRating!);
  if (filters.maxPrice != null) list = list.filter((c) => c.startingPrice <= filters.maxPrice!);
  if (filters.minEngagement != null) list = list.filter((c) => c.engagementRate >= filters.minEngagement!);
  if (filters.verified) list = list.filter((c) => c.verified);
  return [...list].sort((a, b) => b.creatorIndex - a.creatorIndex);
}

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

/** Resolve a list of creator ids in the given order (missing ids are skipped). */
export function findCreatorsByIds(ids: string[]): Creator[] {
  return ids.map((id) => creators.find((c) => c.id === id)).filter((c): c is Creator => !!c);
}

export function getCreatorPortfolio(creatorId: string): PortfolioItem[] {
  return creatorPortfolio.filter((p) => p.creatorId === creatorId);
}

export function getCreatorServices(creatorId: string): CreatorService[] {
  return creatorServices.filter((s) => s.creatorId === creatorId);
}

export function getCreatorReviews(creatorId: string): CreatorReview[] {
  return creatorReviews.filter((r) => r.creatorId === creatorId);
}

export function getCreatorPerformance(creatorId: string): CreatorPerformance | undefined {
  return creatorPerformance.find((p) => p.creatorId === creatorId);
}

export function getSavedCreatorsForUser(userId: string): SavedCreator[] {
  return savedCreators.filter((s) => s.userId === userId);
}

export function isCreatorSaved(userId: string, creatorId: string): boolean {
  return savedCreators.some((s) => s.userId === userId && s.creatorId === creatorId);
}

export function getCreatorCategories(): string[] {
  const set = new Set<string>();
  creators.forEach((c) => c.categories.forEach((cat) => set.add(cat)));
  return [...set].sort();
}

export function getCreatorLocations(): string[] {
  return [...new Set(creators.map((c) => c.location))].sort();
}

export function getCollaborationRequests(businessId: string): CollaborationRequest[] {
  return seedCollabs.filter((r) => r.businessId === businessId);
}

/** Build a new collaboration request record (does not persist). */
export function createCollaborationRequest(
  input: Pick<CollaborationRequest, 'creatorId' | 'businessId' | 'campaignId' | 'serviceId' | 'message' | 'budget' | 'currency'>,
): CollaborationRequest {
  const now = new Date().toISOString();
  return {
    id: uid('col'),
    ...input,
    status: 'pending' as CollaborationStatus,
    createdAt: now,
    updatedAt: now,
  };
}

export { seedCollabs as collaborationRequests, savedCreators };