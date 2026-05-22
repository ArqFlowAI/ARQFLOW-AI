import {
  hasPlanAccess,
  getRequiredPlanForFeature,
  normalizePlanKey,
  PLANS,
  type PlanFeature,
} from "@/config/plans";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

export type PlanAccessResult = {
  allowed: boolean;
  feature: PlanFeature;
  currentPlan: SubscriptionPlan;
  requiredPlan: SubscriptionPlan;
  requiredPlanName: string;
};

export function normalizeSubscriptionPlan(
  plan: string | SubscriptionPlan
): SubscriptionPlan {
  if (plan === "STARTER") return "BASIC";
  if (plan === "FREE" || plan === "BASIC" || plan === "PRO" || plan === "PREMIUM") {
    return plan;
  }
  return "FREE";
}

export function isSubscriptionActive(status: SubscriptionStatus | string): boolean {
  return ACTIVE_STATUSES.includes(status as SubscriptionStatus);
}

export function checkPlanAccess(
  plan: string | SubscriptionPlan,
  status: SubscriptionStatus | string,
  feature: PlanFeature
): PlanAccessResult {
  const currentPlan = normalizeSubscriptionPlan(plan);
  const active = isSubscriptionActive(status);
  const allowed =
    active && hasPlanAccess(currentPlan, feature);
  const requiredPlan = getRequiredPlanForFeature(feature);

  return {
    allowed,
    feature,
    currentPlan,
    requiredPlan,
    requiredPlanName: PLANS[normalizePlanKey(requiredPlan)].name,
  };
}
