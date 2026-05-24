import { billingRepository } from "@/repositories/billing.repository";
import { PLANS } from "@/config/plans";
import type { BillingPageData } from "@/types/billing";

export async function getBillingPageData(
  organizationId: string
): Promise<BillingPageData> {
  const [sub, payments, usageByUser, usageByType] = await Promise.all([
    billingRepository.getSubscription(organizationId),
    billingRepository.getPayments(organizationId),
    billingRepository.getUsageByUser(organizationId),
    billingRepository.getUsageByType(organizationId),
  ]);

  const credits = sub?.credits ?? -1;
  const creditsUsed = sub?.creditsUsed ?? 0;

  return {
    subscription: {
      plan: sub?.plan ?? "PREMIUM",
      status: sub?.status ?? "ACTIVE",
      credits,
      creditsUsed,
      creditsRemaining: credits === -1 ? -1 : Math.max(0, credits - creditsUsed),
      currentPeriodStart: sub?.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      canceledAt: sub?.canceledAt?.toISOString() ?? null,
      billingProvider: null,
      stripeCustomerId: null,
      hasStripe: false,
    },
    payments: [],
    usageByUser,
    usageByType,
  };
}
