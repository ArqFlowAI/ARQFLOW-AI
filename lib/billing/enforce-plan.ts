import { getSession } from "@/lib/auth/session";

// No-op enforcement: authenticated users have access to all features.
export async function enforcePlanFeature(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function getPlanAccessForSession(feature: string) {
  const session = await getSession();
  if (!session) return null;
  return {
    allowed: true,
    feature,
    currentPlan: null,
    requiredPlan: null,
    requiredPlanName: null,
  };
}
