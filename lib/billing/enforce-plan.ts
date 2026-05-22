import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { checkPlanAccess } from "@/lib/billing/plan-access";
import type { PlanFeature } from "@/config/plans";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export async function enforcePlanFeature(
  feature: PlanFeature,
  returnPath?: string
): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect(AUTH_ROUTES.login);
  }

  const access = checkPlanAccess(
    session.plan,
    session.subscriptionStatus,
    feature
  );

  if (!access.allowed) {
    const params = new URLSearchParams({
      feature,
      plan: access.requiredPlan,
    });
    if (returnPath) params.set("from", returnPath);
    redirect(`/billing/upgrade?${params.toString()}`);
  }
}

export async function getPlanAccessForSession(feature: PlanFeature) {
  const session = await getSession();
  if (!session) return null;
  return checkPlanAccess(
    session.plan,
    session.subscriptionStatus,
    feature
  );
}
