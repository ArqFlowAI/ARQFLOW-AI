import { billingRepository } from "@/repositories/billing.repository";
import { PLANS } from "@/config/plans";
import type { BillingPageData } from "@/types/billing";
import type { SubscriptionPlan } from "@prisma/client";
import {
  cancelStripeSubscription,
  changeStripePlan,
  createCheckoutSession,
} from "@/services/stripe.service";

export async function getBillingPageData(
  organizationId: string
): Promise<BillingPageData> {
  const [sub, payments, usageByUser, usageByType] = await Promise.all([
    billingRepository.getSubscription(organizationId),
    billingRepository.getPayments(organizationId),
    billingRepository.getUsageByUser(organizationId),
    billingRepository.getUsageByType(organizationId),
  ]);

  const credits = sub?.credits ?? 50;
  const creditsUsed = sub?.creditsUsed ?? 0;

  return {
    subscription: {
      plan: sub?.plan ?? "FREE",
      status: sub?.status ?? "TRIALING",
      credits,
      creditsUsed,
      creditsRemaining: Math.max(0, credits - creditsUsed),
      currentPeriodStart: sub?.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
      canceledAt: sub?.canceledAt?.toISOString() ?? null,
      billingProvider: sub?.billingProvider ?? null,
      stripeCustomerId: sub?.stripeCustomerId ?? null,
      hasStripe: Boolean(sub?.stripeSubscriptionId),
    },
    payments: payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      externalId: p.externalId,
      createdAt: p.createdAt.toISOString(),
    })),
    usageByUser,
    usageByType,
  };
}

export async function startCheckout(params: {
  organizationId: string;
  email: string;
  plan: SubscriptionPlan;
  baseUrl: string;
}) {
  return createCheckoutSession({
    organizationId: params.organizationId,
    email: params.email,
    plan: params.plan,
    successUrl: `${params.baseUrl}/billing?success=true`,
    cancelUrl: `${params.baseUrl}/billing?canceled=true`,
  });
}

export async function changePlan(params: {
  organizationId: string;
  email: string;
  plan: SubscriptionPlan;
  baseUrl: string;
}) {
  const sub = await billingRepository.getSubscription(params.organizationId);
  if (!sub) throw new Error("Assinatura não encontrada");

  if (sub.stripeSubscriptionId && PLANS[params.plan].priceId) {
    await changeStripePlan({
      stripeSubscriptionId: sub.stripeSubscriptionId,
      plan: params.plan,
      organizationId: params.organizationId,
    });
    return { mode: "stripe_updated" as const };
  }

  await billingRepository.updateSubscription(params.organizationId, {
    plan: params.plan,
    credits: PLANS[params.plan].credits,
    creditsUsed: 0,
    status: "ACTIVE",
  });

  return { mode: "direct" as const };
}

export async function cancelSubscription(organizationId: string) {
  const sub = await billingRepository.getSubscription(organizationId);
  if (!sub) throw new Error("Assinatura não encontrada");

  if (sub.stripeSubscriptionId) {
    await cancelStripeSubscription(sub.stripeSubscriptionId);
  }

  await billingRepository.updateSubscription(organizationId, {
    cancelAtPeriodEnd: true,
    canceledAt: new Date(),
  });

  return { success: true };
}

export async function reactivateSubscription(organizationId: string) {
  const sub = await billingRepository.getSubscription(organizationId);
  if (!sub?.stripeSubscriptionId) {
    await billingRepository.updateSubscription(organizationId, {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      status: "ACTIVE",
    });
    return { success: true };
  }

  const { getStripe } = await import("@/services/stripe.service");
  await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await billingRepository.updateSubscription(organizationId, {
    cancelAtPeriodEnd: false,
    canceledAt: null,
  });

  return { success: true };
}
