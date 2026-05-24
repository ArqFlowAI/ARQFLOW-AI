import { prisma } from "@/lib/prisma";
import type { PlanFeature } from "@/config/plans";
import type { Subscription, SubscriptionStatus } from "@prisma/client";

export async function getOrgSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
  });
}

export async function assertActiveSubscription(organizationId: string) {
  const sub = await getOrgSubscription(organizationId);
  if (!sub) {
    return {
      organizationId,
      plan: "PREMIUM",
      status: "ACTIVE" as SubscriptionStatus,
      credits: -1,
      creditsUsed: 0,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      billingProvider: null,
      stripeCustomerId: null,
    } as Subscription;
  }

  return sub;
}

export async function assertPlanFeature(
  organizationId: string,
  feature: PlanFeature
) {
  return assertActiveSubscription(organizationId);
}

/** @deprecated Use assertPlanFeature */
export async function assertFeature(
  organizationId: string,
  feature: "whatsapp" | "automations" | "team" | "crm" | "renders" | "budgets"
) {
  const map: Record<string, PlanFeature> = {
    whatsapp: "whatsapp",
    automations: "automations",
    team: "projects",
    crm: "crm",
    renders: "renders",
    budgets: "budgets",
  };
  return assertPlanFeature(organizationId, map[feature] ?? "dashboard");
}

export async function assertPlanLimit(
  organizationId: string,
  resource: string,
  getCurrentCount: () => Promise<number>
) {
  return assertActiveSubscription(organizationId);
}

export function canAccessPlan(
  currentPlan: string,
  requiredPlan: string
) {
  return true;
}
