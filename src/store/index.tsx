import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

import {
  aiRecommendations as seedRecommendations,
  businesses as seedBusinesses,
  campaignPlatforms as seedCampaignPlatforms,
  campaigns as seedCampaigns,
  collaborationRequests as seedCollabs,
  notifications as seedNotifications,
  savedCreators as seedSavedCreators,
  users as seedUsers,
} from '@/data';
import {
  applyRecommendation,
  createCollaborationRequest,
  markNotificationRead,
} from '@/services';
import {
  DEFAULT_ONBOARDING_BUDGET,
  DEFAULT_ONBOARDING_PLATFORMS,
} from '@/constants/onboarding';
import type {
  AIRecommendation,
  AppNotification,
  Business,
  Campaign,
  CampaignPlatform,
  CollaborationRequest,
  NotificationType,
  OnboardingData,
  PlanMode,
  SavedCreator,
  Session,
  User,
} from '@/types';
import { uid } from '@/utils/mock';

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppearanceSettings = {
  theme: ThemePreference;
};

export type AppPreferences = {
  notifications: Record<NotificationType, boolean>;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Record<NotificationType, boolean> = {
  campaign: true,
  analytics: true,
  budget: true,
  ai: true,
  creator: true,
  system: true,
};

export type CampaignDraft = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'spent'> & {
  id?: string;
};

export type CollaborationInput = Pick<
  CollaborationRequest,
  'creatorId' | 'serviceId' | 'message' | 'budget'
> & {
  campaignId?: string | null;
};

export type AppState = {
  currentUser: User | null;
  session: Session | null;
  users: User[];
  businesses: Business[];
  campaigns: Campaign[];
  campaignPlatforms: CampaignPlatform[];
  notifications: AppNotification[];
  savedCreators: SavedCreator[];
  collaborationRequests: CollaborationRequest[];
  aiRecommendations: AIRecommendation[];
  onboardingCompleted: boolean;
  onboardingDraft: OnboardingData;
  appearance: AppearanceSettings;
  preferences: AppPreferences;
};

export type AppAction =
  | { type: 'LOGIN'; userId: string }
  | { type: 'SIGNUP'; name: string; email: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_ONBOARDING_DRAFT'; patch: Partial<OnboardingData> }
  | { type: 'COMPLETE_ONBOARDING'; data: OnboardingData }
  | { type: 'CREATE_CAMPAIGN'; draft: CampaignDraft }
  | { type: 'UPDATE_CAMPAIGN'; campaignId: string; patch: Partial<Campaign> }
  | { type: 'ADD_CAMPAIGN_PLATFORMS'; rows: CampaignPlatform[] }
  | { type: 'ADD_NOTIFICATION'; notification: AppNotification }
  | { type: 'LAUNCH_CAMPAIGN'; campaignId: string }
  | { type: 'PAUSE_CAMPAIGN'; campaignId: string }
  | { type: 'RESUME_CAMPAIGN'; campaignId: string }
  | { type: 'DUPLICATE_CAMPAIGN'; campaignId: string }
  | { type: 'ARCHIVE_CAMPAIGN'; campaignId: string }
  | { type: 'UNARCHIVE_CAMPAIGN'; campaignId: string }
  | { type: 'MARK_NOTIFICATION_READ'; notifId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SAVE_CREATOR'; creatorId: string }
  | { type: 'REMOVE_SAVED_CREATOR'; creatorId: string }
  | { type: 'SEND_COLLABORATION_REQUEST'; input: CollaborationInput }
  | { type: 'APPLY_AI_RECOMMENDATION'; recommendationId: string }
  | { type: 'SWITCH_PLAN'; mode: PlanMode }
  | { type: 'SET_APPEARANCE'; theme: ThemePreference }
  | { type: 'SET_NOTIFICATION_PREFERENCE'; notificationType: NotificationType; enabled: boolean }
  | { type: 'UPDATE_BUSINESS'; patch: Partial<Business> }
  | { type: 'UPDATE_PROFILE'; patch: Partial<User> }
  | { type: 'RESET_DEMO' }
  | { type: 'RESET_ONBOARDING' };

export const initialState: AppState = {
  currentUser: null,
  session: null,
  users: seedUsers,
  businesses: seedBusinesses,
  campaigns: seedCampaigns,
  campaignPlatforms: seedCampaignPlatforms,
  notifications: seedNotifications,
  savedCreators: seedSavedCreators,
  collaborationRequests: seedCollabs,
  aiRecommendations: seedRecommendations,
  onboardingCompleted: false,
  onboardingDraft: {
    name: '',
    businessName: '',
    industry: '',
    objective: 'sales',
    monthlyBudget: DEFAULT_ONBOARDING_BUDGET,
    platforms: DEFAULT_ONBOARDING_PLATFORMS,
    category: 'product',
    experienceLevel: 'intermediate',
  },
  appearance: { theme: 'system' },
  preferences: { notifications: DEFAULT_NOTIFICATION_PREFERENCES },
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN': {
      const user = state.users.find((u) => u.id === action.userId);
      if (!user) return state;
      return {
        ...state,
        currentUser: user,
        session: { userId: user.id, lastActiveAt: new Date().toISOString() },
        onboardingCompleted: user.onboardingCompleted,
        onboardingDraft: {
          ...state.onboardingDraft,
          name: user.name,
          businessName: state.businesses.find((b) => b.id === user.businessId)?.name ?? '',
          industry: user.industry,
        },
      };
    }

    case 'SIGNUP': {
      const now = new Date().toISOString();
      const userId = uid('user');
      const businessId = uid('business');
      const business: Business = {
        id: businessId,
        name: '',
        industry: '',
        description: '',
        website: '',
        logo: null,
        ownerId: userId,
        monthlyBudget: DEFAULT_ONBOARDING_BUDGET,
        currency: 'INR',
        location: '',
        createdAt: now,
      };
      const user: User = {
        id: userId,
        name: action.name,
        email: action.email,
        avatar: null,
        role: 'business_owner',
        businessId,
        mode: 'pro',
        plan: 'pro',
        industry: '',
        monthlyBudget: DEFAULT_ONBOARDING_BUDGET,
        currency: 'INR',
        onboardingCompleted: false,
        createdAt: now,
      };
      return {
        ...state,
        users: [...state.users, user],
        businesses: [...state.businesses, business],
        currentUser: user,
        session: { userId, lastActiveAt: now },
        onboardingCompleted: false,
        onboardingDraft: {
          name: action.name,
          businessName: '',
          industry: '',
          objective: 'sales',
          monthlyBudget: DEFAULT_ONBOARDING_BUDGET,
          platforms: DEFAULT_ONBOARDING_PLATFORMS,
          category: 'product',
          experienceLevel: 'intermediate',
        },
      };
    }

    case 'LOGOUT':
      return { ...state, currentUser: null, session: null, onboardingCompleted: false };

    case 'SET_ONBOARDING_DRAFT':
      return { ...state, onboardingDraft: { ...state.onboardingDraft, ...action.patch } };

    case 'COMPLETE_ONBOARDING': {
      const draft = state.onboardingDraft;
      const user = state.currentUser;
      if (!user) return state;
      const industry = draft.industry || user.industry;
      const businessName = draft.businessName || `${user.name}'s Business`;
      return {
        ...state,
        currentUser: {
          ...user,
          name: draft.name || user.name,
          industry,
          monthlyBudget: draft.monthlyBudget || user.monthlyBudget,
          onboardingCompleted: true,
        },
        users: state.users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                name: draft.name || u.name,
                industry,
                monthlyBudget: draft.monthlyBudget || u.monthlyBudget,
                onboardingCompleted: true,
              }
            : u,
        ),
        businesses: state.businesses.map((b) =>
          b.id === user.businessId ? { ...b, name: businessName, industry } : b,
        ),
        onboardingCompleted: true,
      };
    }

    case 'CREATE_CAMPAIGN': {
      const now = new Date().toISOString();
      const campaign: Campaign = {
        ...action.draft,
        id: action.draft.id ?? uid('campaign'),
        spent: 0,
        createdAt: now,
        updatedAt: now,
        status: action.draft.status ?? 'draft',
      };
      return { ...state, campaigns: [campaign, ...state.campaigns] };
    }

    case 'ADD_CAMPAIGN_PLATFORMS':
      return {
        ...state,
        campaignPlatforms: [...state.campaignPlatforms, ...action.rows],
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId
            ? { ...c, ...action.patch, updatedAt: new Date().toISOString() }
            : c,
        ),
      };

    case 'LAUNCH_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, status: 'active', updatedAt: new Date().toISOString() } : c,
        ),
      };

    case 'PAUSE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, status: 'paused', updatedAt: new Date().toISOString() } : c,
        ),
        campaignPlatforms: state.campaignPlatforms.map((cp) =>
          cp.campaignId === action.campaignId ? { ...cp, status: 'paused' } : cp,
        ),
      };

    case 'RESUME_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, status: 'active', updatedAt: new Date().toISOString() } : c,
        ),
        campaignPlatforms: state.campaignPlatforms.map((cp) =>
          cp.campaignId === action.campaignId ? { ...cp, status: 'active' } : cp,
        ),
      };

    case 'DUPLICATE_CAMPAIGN': {
      const source = state.campaigns.find((c) => c.id === action.campaignId);
      if (!source) return state;
      const now = new Date().toISOString();
      const newId = uid('campaign');
      const copy: Campaign = {
        ...source,
        id: newId,
        name: `${source.name} (Copy)`,
        status: 'draft',
        spent: 0,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      const platformCopies: CampaignPlatform[] = state.campaignPlatforms
        .filter((cp) => cp.campaignId === source.id)
        .map((cp) => ({
          ...cp,
          id: uid('cplatform'),
          campaignId: newId,
          status: 'scheduled' as const,
          spent: 0,
          impressions: 0,
          reach: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpa: 0,
          revenue: 0,
          roas: 0,
        }));
      return {
        ...state,
        campaigns: [copy, ...state.campaigns],
        campaignPlatforms: [...state.campaignPlatforms, ...platformCopies],
      };
    }

    case 'ARCHIVE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, isArchived: true, updatedAt: new Date().toISOString() } : c,
        ),
      };

    case 'UNARCHIVE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaignId ? { ...c, isArchived: false, updatedAt: new Date().toISOString() } : c,
        ),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notifId ? markNotificationRead(n) : n,
        ),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      };

    case 'SAVE_CREATOR': {
      if (!state.currentUser) return state;
      if (state.savedCreators.some((s) => s.creatorId === action.creatorId && s.userId === state.currentUser!.id)) {
        return state;
      }
      const record: SavedCreator = {
        id: uid('saved'),
        userId: state.currentUser.id,
        creatorId: action.creatorId,
        createdAt: new Date().toISOString(),
      };
      return { ...state, savedCreators: [...state.savedCreators, record] };
    }

    case 'REMOVE_SAVED_CREATOR':
      return {
        ...state,
        savedCreators: state.savedCreators.filter(
          (s) => !(s.creatorId === action.creatorId && s.userId === state.currentUser?.id),
        ),
      };

    case 'SEND_COLLABORATION_REQUEST': {
      if (!state.currentUser) return state;
      const request = createCollaborationRequest({
        ...action.input,
        businessId: state.currentUser.businessId,
        campaignId: action.input.campaignId ?? null,
        currency: state.currentUser.currency,
      });
      return { ...state, collaborationRequests: [...state.collaborationRequests, request] };
    }

    case 'APPLY_AI_RECOMMENDATION':
      return {
        ...state,
        aiRecommendations: state.aiRecommendations.map((r) =>
          r.id === action.recommendationId ? applyRecommendation(r) : r,
        ),
      };

    case 'SWITCH_PLAN': {
      const user = state.currentUser;
      if (!user) return state;
      return {
        ...state,
        currentUser: { ...user, mode: action.mode, plan: action.mode },
        users: state.users.map((u) => (u.id === user.id ? { ...u, mode: action.mode, plan: action.mode } : u)),
      };
    }

    case 'SET_APPEARANCE':
      return { ...state, appearance: { theme: action.theme } };

    case 'SET_NOTIFICATION_PREFERENCE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          notifications: {
            ...state.preferences.notifications,
            [action.notificationType]: action.enabled,
          },
        },
      };

    case 'UPDATE_BUSINESS': {
      const user = state.currentUser;
      if (!user) return state;
      return {
        ...state,
        businesses: state.businesses.map((b) =>
          b.id === user.businessId ? { ...b, ...action.patch } : b,
        ),
      };
    }

    case 'UPDATE_PROFILE': {
      const user = state.currentUser;
      if (!user) return state;
      return {
        ...state,
        currentUser: { ...user, ...action.patch },
        users: state.users.map((u) => (u.id === user.id ? { ...u, ...action.patch } : u)),
      };
    }

    case 'RESET_DEMO': {
      const keepUser = state.currentUser;
      if (!keepUser) return initialState;
      const restored = initialState.users.find((u) => u.id === keepUser.id) ?? keepUser;
      return {
        ...initialState,
        currentUser: restored,
        session: { userId: restored.id, lastActiveAt: new Date().toISOString() },
        onboardingCompleted: restored.onboardingCompleted,
        onboardingDraft: {
          ...initialState.onboardingDraft,
          name: restored.name,
          businessName: initialState.businesses.find((b) => b.id === restored.businessId)?.name ?? '',
          industry: restored.industry,
        },
      };
    }

    case 'RESET_ONBOARDING': {
      const user = state.currentUser;
      if (!user) return state;
      return {
        ...state,
        currentUser: { ...user, onboardingCompleted: false },
        users: state.users.map((u) => (u.id === user.id ? { ...u, onboardingCompleted: false } : u)),
        onboardingCompleted: false,
        onboardingDraft: {
          name: user.name,
          businessName: state.businesses.find((b) => b.id === user.businessId)?.name ?? '',
          industry: user.industry,
          objective: 'sales',
          monthlyBudget: user.monthlyBudget,
          platforms: DEFAULT_ONBOARDING_PLATFORMS,
          category: 'product',
          experienceLevel: 'intermediate',
        },
      };
    }

    default:
      return state;
  }
}

export type StoreContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}