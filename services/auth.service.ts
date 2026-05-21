import { prisma } from "@/lib/prisma";
import { generateOrgSlug } from "@/lib/utils";
import { getPlanCredits } from "@/config/plans";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export type SyncUserParams = {
  supabaseId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  organizationName?: string;
};

export async function syncUserFromSupabase(params: SyncUserParams) {
  const email = params.email.toLowerCase().trim();

  const bySupabase = await prisma.user.findUnique({
    where: { supabaseId: params.supabaseId },
    include: { memberships: { take: 1 } },
  });

  if (bySupabase) {
    return prisma.user.update({
      where: { id: bySupabase.id },
      data: {
        email,
        name: params.name ?? bySupabase.name,
        avatarUrl: params.avatarUrl ?? bySupabase.avatarUrl,
      },
      include: { memberships: { take: 1 } },
    });
  }

  const byEmail = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { take: 1 } },
  });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        supabaseId: params.supabaseId,
        name: params.name ?? byEmail.name,
        avatarUrl: params.avatarUrl ?? byEmail.avatarUrl,
      },
      include: { memberships: { take: 1 } },
    });
  }

  const orgName =
    params.organizationName ?? `${params.name ?? "Meu"} Escritório`;
  const slug = generateOrgSlug(orgName);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: params.name,
        avatarUrl: params.avatarUrl,
        supabaseId: params.supabaseId,
      },
    });

    await tx.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
        subscription: {
          create: {
            plan: SubscriptionPlan.STARTER,
            status: SubscriptionStatus.TRIALING,
            credits: getPlanCredits(SubscriptionPlan.STARTER),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        settings: { create: {} },
      },
    });

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { memberships: { take: 1 } },
    });
  });
}

export async function completeOnboarding(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { onboardingDone: true },
  });
}

export async function getPostAuthRedirect(supabaseId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: { onboardingDone: true },
  });

  if (!user) return "/onboarding";
  return user.onboardingDone ? "/dashboard" : "/onboarding";
}
