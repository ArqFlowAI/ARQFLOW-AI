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
  if (!params.email) {
    throw new Error("Missing email from Supabase user metadata");
  }
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

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: params.name,
        avatarUrl: params.avatarUrl,
        supabaseId: params.supabaseId,
      },
    });

    let slug = generateOrgSlug(orgName);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await tx.organization.create({
          data: {
            name: orgName,
            slug,
            members: {
              create: { userId: user.id, role: "OWNER" },
            },
            subscription: {
              create: {
                plan: SubscriptionPlan.PREMIUM,
                status: SubscriptionStatus.ACTIVE,
                credits: getPlanCredits(SubscriptionPlan.PREMIUM),
                creditsUsed: 0,
                currentPeriodStart: new Date(),
                currentPeriodEnd: null,
              },
            },
            settings: { create: {} },
          },
        });
        break;
      } catch (err) {
        const isSlugConflict =
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: string }).code === "P2002";
        if (!isSlugConflict || attempt === 4) throw err;
        slug = generateOrgSlug(orgName);
      }
    }

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
