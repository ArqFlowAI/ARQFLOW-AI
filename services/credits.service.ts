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

  if (!sub) throw new AppError("Assinatura não encontrada", 404);

  const remaining = sub.credits - sub.creditsUsed;
  if (remaining < amount) {
    throw new AppError(
      "Créditos insuficientes. Faça upgrade do seu plano.",
      402,
      "INSUFFICIENT_CREDITS"
    );
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { organizationId },
      data: { creditsUsed: { increment: amount } },
    }),
    prisma.usageRecord.create({
      data: { organizationId, userId, type, amount },
    }),
  ]);

  return remaining - amount;
}

export async function resetMonthlyCredits(organizationId: string, credits: number) {
  return prisma.subscription.update({
    where: { organizationId },
    data: { credits, creditsUsed: 0 },
  });
}
