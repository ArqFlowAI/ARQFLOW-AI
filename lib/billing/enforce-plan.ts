import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import type { PlanFeature } from "@/config/plans";

export async function enforcePlanFeature(
  feature: PlanFeature,
  returnPath?: string
): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect(AUTH_ROUTES.login);
  }
}

export async function getPlanAccessForSession(feature: PlanFeature) {
  const session = await getSession();
  if (!session) return null;
  return {
    allowed: true,
    feature,
    currentPlan: session.plan,
    requiredPlan: session.plan,
    requiredPlanName: session.plan,
  };
}
