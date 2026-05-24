// Billing guards neutralized: always return an active, unlimited subscription-like object.
export async function getOrgSubscription(_organizationId: string) {
  return null;
}

export async function assertActiveSubscription(organizationId: string) {
  return {
    organizationId,
    plan: null,
    status: "ACTIVE",
    credits: -1,
    creditsUsed: 0,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    billingProvider: null,
    stripeCustomerId: null,
  } as unknown;
}

export async function assertPlanFeature(_organizationId: string, _feature: string) {
  return assertActiveSubscription(_organizationId);
}

export async function assertFeature(_organizationId: string, _feature: string) {
  return assertPlanFeature(_organizationId, "dashboard");
}

export async function assertPlanLimit(_organizationId: string) {
  return assertActiveSubscription(_organizationId);
}

export function canAccessPlan() {
  return true;
}
