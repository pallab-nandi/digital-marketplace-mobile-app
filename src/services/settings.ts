import { demoEvents, plans } from '@/data';
import type { DemoEvent, Plan, PlanMode } from '@/types';

export function getPlans(): Plan[] {
  return plans;
}

export function getPlanById(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function getDemoEvents(): DemoEvent[] {
  return demoEvents;
}

/** Validate a plan switch — Lite is always allowed (downgrade is side-effect free). */
export function canSwitchTo(mode: PlanMode): boolean {
  return mode === 'lite' || mode === 'pro';
}

export const PLAN_FEATURE_GATE: Record<string, string[]> = {
  lite: ['create-campaign', 'dashboard', 'notifications'],
  pro: [
    'create-campaign',
    'dashboard',
    'notifications',
    'ai-assistant',
    'analytics',
    'creator-marketplace',
    'multi-platform',
    'budget-insights',
  ],
};

export function hasFeature(mode: PlanMode, feature: string): boolean {
  return (PLAN_FEATURE_GATE[mode] ?? []).includes(feature);
}