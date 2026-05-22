import { prisma } from "@/lib/prisma";
import { getPlanLimits, PLANS, normalizePlanKey } from "@/config/plans";
import { AppError } from "@/lib/errors";
import {
  checkPlanAccess,
  isSubscriptionActive,
  normalizeSubscriptionPlan,
} from "@/lib/billing/plan-access";
import type { PlanFeature } from "@/config/plans";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export async function getOrgSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
  });
}

export async function assertActiveSubscription(organizationId: string) {
  const sub = await getOrgSubscription(organizationId);
  if (!sub) {
    throw new AppError("Assinatura não encontrada", 402, "NO_SUBSCRIPTION");
  }
  if (!isSubscriptionActive(sub.status)) {
    throw new AppError(
      "Assinatura inativa. Atualize seu plano em Billing.",
      402,
      "SUBSCRIPTION_INACTIVE"
    );
  }
  return sub;
}

export async function assertPlanFeature(
  organizationId: string,
  feature: PlanFeature
) {
  const sub = await assertActiveSubscription(organizationId);
  const access = checkPlanAccess(sub.plan, sub.status, feature);

  if (!access.allowed) {
    throw new AppError(
      `${access.requiredPlanName} necessário para acessar este recurso. Faça upgrade do plano.`,
      403,
      "PLAN_FEATURE_LOCKED"
    );
  }

  return sub;
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
  resource: keyof (typeof PLANS)["FREE"]["limits"],
  getCurrentCount: () => Promise<number>
) {
  const sub = await assertActiveSubscription(organizationId);
  const limits = getPlanLimits(normalizeSubscriptionPlan(sub.plan));
  const max = limits[resource];

  if (max === 0) {
    throw new AppError(
      `Recurso não disponível no plano ${sub.plan}. Faça upgrade.`,
      403,
      "PLAN_FEATURE_LOCKED"
    );
  }

  if (max === -1) return sub;

  const current = await getCurrentCount();
  if (current >= max) {
    throw new AppError(
      `Limite do plano ${sub.plan} atingido. Faça upgrade.`,
      402,
      "PLAN_LIMIT_REACHED"
    );
  }

  return sub;
}

export function canAccessPlan(
  currentPlan: SubscriptionPlan | string,
  requiredPlan: SubscriptionPlan
) {
  const order = ["FREE", "BASIC", "PRO", "PREMIUM"] as SubscriptionPlan[];
  const current = normalizeSubscriptionPlan(currentPlan);
  return order.indexOf(current) >= order.indexOf(requiredPlan);
}
