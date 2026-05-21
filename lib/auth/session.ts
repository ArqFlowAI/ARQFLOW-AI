import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncUserFromSupabase } from "@/services/auth.service";
import type { SessionUser } from "@/types";
import { AppError } from "@/lib/errors";

export async function getSupabaseAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getSession(): Promise<SessionUser | null> {
  const authUser = await getSupabaseAuthUser();
  if (!authUser?.email) return null;

  let user = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: {
      memberships: {
        include: {
          organization: { include: { subscription: true } },
        },
        take: 1,
      },
    },
  });

  if (!user) {
    const synced = await syncUserFromSupabase({
      supabaseId: authUser.id,
      email: authUser.email,
      name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        authUser.user_metadata?.organization_name,
      avatarUrl: authUser.user_metadata?.avatar_url,
      organizationName: authUser.user_metadata?.organization_name,
    });

    user = await prisma.user.findUnique({
      where: { id: synced.id },
      include: {
        memberships: {
          include: {
            organization: { include: { subscription: true } },
          },
          take: 1,
        },
      },
    });
  }

  if (!user || user.memberships.length === 0) return null;

  const membership = user.memberships[0];
  const org = membership.organization;
  const sub = org.subscription;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    organizationId: org.id,
    organizationName: org.name,
    role: membership.role,
    plan: sub?.plan ?? "STARTER",
    credits: (sub?.credits ?? 50) - (sub?.creditsUsed ?? 0),
    onboardingDone: user.onboardingDone,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new AppError("Não autenticado", 401, "UNAUTHORIZED");
  }
  return session;
}
