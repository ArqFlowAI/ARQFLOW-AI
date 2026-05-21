import { prisma } from "@/lib/prisma";
import { getPlanLimits, PLANS } from "@/config/plans";
import { AppError } from "@/lib/errors";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

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
  if (!ACTIVE_STATUSES.includes(sub.status)) {
    throw new AppError(
      "Assinatura inativa. Atualize seu plano em Billing.",
      402,
      "SUBSCRIPTION_INACTIVE"
    );
  }
  return sub;
}

export async function assertPlanLimit(
  organizationId: string,
  resource: keyof (typeof PLANS)["STARTER"]["limits"],
  getCurrentCount: () => Promise<number>
) {
  const sub = await assertActiveSubscription(organizationId);
  const limits = getPlanLimits(sub.plan);
  const max = limits[resource];

  if (max === -1) return sub;

  const current = await getCurrentCount();
  if (current >= max) {
    throw new AppError(
      `Limite do plano ${sub.plan} atingido para ${resource}. Faça upgrade.`,
      402,
      "PLAN_LIMIT_REACHED"
    );
  }

  return sub;
}

export async function assertFeature(
  organizationId: string,
  feature: "whatsapp" | "automations" | "team"
) {
  const sub = await assertActiveSubscription(organizationId);
  const limits = getPlanLimits(sub.plan);

  if (feature === "whatsapp" && sub.plan === "STARTER") {
    throw new AppError(
      "Automações WhatsApp disponíveis no plano Pro ou superior.",
      402,
      "PLAN_FEATURE_LOCKED"
    );
  }

  if (feature === "automations" && limits.automations <= 0) {
    throw new AppError("Automações não disponíveis no seu plano.", 402);
  }

  return sub;
}

export function canAccessPlan(
  currentPlan: SubscriptionPlan,
  requiredPlan: SubscriptionPlan
) {
  const order = ["STARTER", "PRO", "PREMIUM"] as SubscriptionPlan[];
  return order.indexOf(currentPlan) >= order.indexOf(requiredPlan);
}
