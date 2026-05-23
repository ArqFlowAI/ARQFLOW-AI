import {
  hasPlanAccess,
  getRequiredPlanForFeature,
  normalizePlanKey,
  PLANS,
  type PlanFeature,
} from "@/config/plans";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

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
  if (
    plan === "STARTER" ||
    plan === "FREE" ||
    plan === "BASIC" ||
    plan === "PRO" ||
    plan === "ENTERPRISE"
  ) {
    return "PREMIUM";
  }

  if (plan in PLANS) {
    return plan as SubscriptionPlan;
  }

  return "PREMIUM";
}

export function isSubscriptionActive(): boolean {
  return true;
}

export function checkPlanAccess(
  plan: string | SubscriptionPlan,
  status: SubscriptionStatus | string,
  feature: PlanFeature
): PlanAccessResult {
  const currentPlan = normalizeSubscriptionPlan(plan);
  const active = isSubscriptionActive(status);
  const allowed = active && hasPlanAccess(currentPlan, feature);
  const requiredPlan = getRequiredPlanForFeature(feature);

  return {
    allowed,
    feature,
    currentPlan,
    requiredPlan,
    requiredPlanName: PLANS[normalizePlanKey(requiredPlan)].name,
  };
}
