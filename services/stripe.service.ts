import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PLANS, getPlanCredits } from "@/config/plans";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    stripeClient = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripeClient;
}

export async function createCheckoutSession(params: {
  organizationId: string;
  email: string;
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
}) {
  const planConfig = PLANS[params.plan];
  if (!planConfig.priceId) throw new Error("Price ID não configurado");

  const sub = await prisma.subscription.findUnique({
    where: { organizationId: params.organizationId },
  });

  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: params.email,
      metadata: { organizationId: params.organizationId },
    });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where: { organizationId: params.organizationId },
      create: {
        organizationId: params.organizationId,
        stripeCustomerId: customerId,
        plan: params.plan,
        credits: getPlanCredits(params.plan),
        billingProvider: "STRIPE",
      },
      update: { stripeCustomerId: customerId, billingProvider: "STRIPE" },
    });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId!, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      organizationId: params.organizationId,
      plan: params.plan,
    },
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
        plan: params.plan,
      },
    },
  });

  return session;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const organizationId = subscription.metadata.organizationId;
  const plan = (subscription.metadata.plan as SubscriptionPlan) ?? "BASIC";

  if (!organizationId) return;

  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    trialing: SubscriptionStatus.TRIALING,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    incomplete: SubscriptionStatus.INCOMPLETE,
  };

  await prisma.subscription.update({
    where: { organizationId },
    data: {
      plan,
      status: statusMap[subscription.status] ?? SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: subscription.id,
      billingProvider: "STRIPE",
      credits: getPlanCredits(plan),
      creditsUsed: 0,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });
}

export async function changeStripePlan(params: {
  stripeSubscriptionId: string;
  plan: SubscriptionPlan;
  organizationId: string;
}) {
  const planConfig = PLANS[params.plan];
  if (!planConfig.priceId) {
    throw new Error("Price ID não configurado para o plano");
  }

  const subscription = await getStripe().subscriptions.retrieve(
    params.stripeSubscriptionId
  );
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Item de assinatura não encontrado");

  const updated = await getStripe().subscriptions.update(params.stripeSubscriptionId, {
    items: [{ id: itemId, price: planConfig.priceId }],
    proration_behavior: "create_prorations",
    metadata: {
      organizationId: params.organizationId,
      plan: params.plan,
    },
  });

  await handleSubscriptionUpdated(updated);
  return updated;
}

export async function cancelStripeSubscription(stripeSubscriptionId: string) {
  return getStripe().subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function recordStripePayment(params: {
  organizationId: string;
  invoiceId: string;
  amountPaid: number;
  currency: string;
  status: string;
  metadata?: Record<string, unknown>;
}) {
  const { billingRepository } = await import("@/repositories/billing.repository");
  const existing = await prisma.payment.findFirst({
    where: { externalId: params.invoiceId },
  });
  if (existing) return existing;

  return billingRepository.createPayment({
    organizationId: params.organizationId,
    provider: "STRIPE",
    externalId: params.invoiceId,
    amount: params.amountPaid / 100,
    currency: params.currency.toUpperCase(),
    status: params.status,
    metadata: params.metadata,
  });
}
