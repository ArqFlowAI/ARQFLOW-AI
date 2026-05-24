import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export async function consumeCredits(
  organizationId: string,
  amount: number,
  type: string,
  userId?: string
) {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (sub && sub.credits !== -1) {
    await prisma.subscription.update({
      where: { organizationId },
      data: { creditsUsed: { increment: amount } },
    });
  }

  await prisma.usageRecord.create({
    data: { organizationId, userId, type, amount },
  });

  if (!sub) return -1;
  return sub.credits === -1 ? -1 : sub.credits - sub.creditsUsed - amount;
}

export async function resetMonthlyCredits(organizationId: string, credits: number) {
  return prisma.subscription.update({
    where: { organizationId },
    data: { credits, creditsUsed: 0 },
  });
}
