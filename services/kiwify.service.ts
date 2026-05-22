import { prisma } from "@/lib/prisma";
import { generateOrgSlug } from "@/lib/utils";
import { getPlanCredits } from "@/config/plans";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentProvider,
} from "@prisma/client";
import { sendWelcomeEmail } from "@/emails/send";
import { triggerN8nWebhook } from "@/services/n8n.service";

const PLAN_MAP: Record<string, SubscriptionPlan> = {
  free: SubscriptionPlan.FREE,
  starter: SubscriptionPlan.BASIC,
  basic: SubscriptionPlan.BASIC,
  pro: SubscriptionPlan.PRO,
  premium: SubscriptionPlan.PREMIUM,
};

export async function handleKiwifyPurchase(payload: {
  order_id: string;
  Customer: { email: string; full_name?: string };
  Product: { product_name: string };
  order_status: string;
}) {
  if (payload.order_status !== "paid") return { skipped: true };

  const email = payload.Customer.email.toLowerCase();
  const planKey = payload.Product.product_name.toLowerCase();
  const plan =
    Object.entries(PLAN_MAP).find(([k]) => planKey.includes(k))?.[1] ??
    SubscriptionPlan.PRO;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const orgName = `${payload.Customer.full_name ?? "Cliente"} - Escritório`;
    user = await prisma.user.create({
      data: {
        email,
        name: payload.Customer.full_name,
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: orgName,
                slug: generateOrgSlug(orgName),
                subscription: {
                  create: {
                    plan,
                    status: SubscriptionStatus.ACTIVE,
                    billingProvider: PaymentProvider.KIWIFY,
                    kiwifyOrderId: payload.order_id,
                    credits: getPlanCredits(plan),
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                  },
                },
                settings: { create: {} },
              },
            },
          },
        },
      },
    });
  } else {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });
    if (membership) {
      await prisma.subscription.update({
        where: { organizationId: membership.organizationId },
        data: {
          plan,
          status: SubscriptionStatus.ACTIVE,
          billingProvider: PaymentProvider.KIWIFY,
          kiwifyOrderId: payload.order_id,
          credits: getPlanCredits(plan),
          creditsUsed: 0,
        },
      });
    }
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (membership) {
    await prisma.payment.create({
      data: {
        organizationId: membership.organizationId,
        provider: PaymentProvider.KIWIFY,
        externalId: payload.order_id,
        amount: 0,
        status: "paid",
        metadata: payload as object,
      },
    });

    await sendWelcomeEmail({
      to: email,
      name: user.name ?? "Cliente",
    });

    await triggerN8nWebhook("kiwify-purchase", {
      email,
      plan,
      orderId: payload.order_id,
    });
  }

  return { success: true, userId: user.id };
}

export async function handleKiwifyCancellation(payload: {
  order_id: string;
  Customer: { email: string };
}) {
  const sub = await prisma.subscription.findFirst({
    where: { kiwifyOrderId: payload.order_id },
  });

  if (!sub) return { skipped: true };

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: SubscriptionStatus.CANCELED },
  });

  return { success: true };
}
