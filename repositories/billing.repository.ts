import { prisma } from "@/lib/prisma";
import type {
  PaymentProvider,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { getPlanCredits } from "@/config/plans";

export const billingRepository = {
  getSubscription(organizationId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId },
    });
  },

  getPayments(organizationId: string, limit = 30) {
    return prisma.payment.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  createPayment(data: {
    organizationId: string;
    provider: PaymentProvider;
    externalId: string;
    amount: number;
    currency?: string;
    status: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.payment.create({
      data: {
        organizationId: data.organizationId,
        provider: data.provider,
        externalId: data.externalId,
        amount: data.amount,
        currency: data.currency ?? "BRL",
        status: data.status,
        metadata: data.metadata as object | undefined,
      },
    });
  },

  updateSubscription(
    organizationId: string,
    data: {
      plan?: SubscriptionPlan;
      status?: SubscriptionStatus;
      credits?: number;
      creditsUsed?: number;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      kiwifyOrderId?: string;
      billingProvider?: PaymentProvider;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
      canceledAt?: Date | null;
    }
  ) {
    return prisma.subscription.update({
      where: { organizationId },
      data,
    });
  },

  upsertSubscription(
    organizationId: string,
    data: {
      plan: SubscriptionPlan;
      status?: SubscriptionStatus;
      credits?: number;
      billingProvider?: PaymentProvider;
      stripeCustomerId?: string;
    }
  ) {
    const credits = data.credits ?? getPlanCredits(data.plan);
    return prisma.subscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        plan: data.plan,
        status: data.status ?? "INCOMPLETE",
        credits,
        billingProvider: data.billingProvider,
        stripeCustomerId: data.stripeCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        plan: data.plan,
        credits,
        ...(data.status && { status: data.status }),
        ...(data.billingProvider && { billingProvider: data.billingProvider }),
        ...(data.stripeCustomerId && { stripeCustomerId: data.stripeCustomerId }),
      },
    });
  },

  async getUsageByUser(organizationId: string) {
    const records = await prisma.usageRecord.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const map = new Map<
      string,
      {
        userId: string | null;
        userName: string;
        total: number;
        breakdown: Map<string, number>;
      }
    >();

    for (const r of records) {
      const key = r.userId ?? "system";
      const entry = map.get(key) ?? {
        userId: r.userId,
        userName: r.user?.name ?? r.user?.email ?? "Sistema",
        total: 0,
        breakdown: new Map(),
      };
      entry.total += r.amount;
      entry.breakdown.set(r.type, (entry.breakdown.get(r.type) ?? 0) + r.amount);
      map.set(key, entry);
    }

    return Array.from(map.values()).map((e) => ({
      userId: e.userId,
      userName: e.userName,
      totalCredits: e.total,
      breakdown: Array.from(e.breakdown.entries()).map(([type, amount]) => ({
        type,
        amount,
      })),
    }));
  },

  async getUsageByType(organizationId: string) {
    const grouped = await prisma.usageRecord.groupBy({
      by: ["type"],
      where: { organizationId },
      _sum: { amount: true },
    });
    return grouped.map((g) => ({
      type: g.type,
      amount: g._sum.amount ?? 0,
    }));
  },
};
