"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  cancelSubscription,
  changePlan,
  reactivateSubscription,
  startCheckout,
} from "@/services/billing.service";
import { createBillingPortalSession } from "@/services/stripe.service";
import { billingRepository } from "@/repositories/billing.repository";
import type { SubscriptionPlan } from "@prisma/client";

const BILLING_PATHS = ["/billing", "/dashboard/billing", "/dashboard"];

function revalidateBilling() {
  BILLING_PATHS.forEach((p) => revalidatePath(p));
}

export async function checkoutPlanAction(plan: SubscriptionPlan) {
  const session = await requireSession();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const checkout = await startCheckout({
      organizationId: session.organizationId,
      email: session.email,
      plan,
      baseUrl,
    });
    return { success: true, url: checkout.url };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao iniciar checkout",
    };
  }
}

export async function changePlanAction(plan: SubscriptionPlan) {
  const session = await requireSession();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    await changePlan({
      organizationId: session.organizationId,
      email: session.email,
      plan,
      baseUrl,
    });
    revalidateBilling();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao alterar plano",
    };
  }
}

export async function cancelSubscriptionAction() {
  const session = await requireSession();
  try {
    await cancelSubscription(session.organizationId);
    revalidateBilling();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao cancelar",
    };
  }
}

export async function reactivateSubscriptionAction() {
  const session = await requireSession();
  try {
    await reactivateSubscription(session.organizationId);
    revalidateBilling();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao reativar",
    };
  }
}

export async function openBillingPortalAction() {
  const session = await requireSession();
  const sub = await billingRepository.getSubscription(session.organizationId);

  if (!sub?.stripeCustomerId) {
    return { error: "Nenhuma assinatura Stripe vinculada" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await createBillingPortalSession(
    sub.stripeCustomerId,
    `${baseUrl}/billing`
  );

  return { success: true, url: portal.url };
}
