import { getSession } from "@/lib/auth/session";
import { checkPlanAccess } from "@/lib/billing/plan-access";
import { getFeatureForPath, getFeatureForApiPath } from "@/lib/billing/routes";
import { hasPlanAccess } from "@/config/plans";
import type { PlanFeature } from "@/config/plans";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("path") ?? "";
  const featureParam = searchParams.get("feature") as PlanFeature | null;

  if (!session) {
    return Response.json({ authenticated: false, allowed: false });
  }

  const feature =
    featureParam ??
    getFeatureForApiPath(pathname) ??
    getFeatureForPath(pathname);

  if (!feature) {
    return Response.json({
      authenticated: true,
      allowed: true,
      plan: session.plan,
      status: session.subscriptionStatus,
    });
  }

  const access = checkPlanAccess(
    session.plan,
    session.subscriptionStatus,
    feature
  );

  return Response.json({
    authenticated: true,
    allowed: access.allowed,
    plan: session.plan,
    status: session.subscriptionStatus,
    feature,
    requiredPlan: access.requiredPlan,
    requiredPlanName: access.requiredPlanName,
    features: {
      renders: hasPlanAccess(session.plan, "renders"),
      crm: hasPlanAccess(session.plan, "crm"),
      whatsapp: hasPlanAccess(session.plan, "whatsapp"),
      automations: hasPlanAccess(session.plan, "automations"),
      budgets: hasPlanAccess(session.plan, "budgets"),
    },
  });
}
