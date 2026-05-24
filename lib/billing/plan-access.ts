// Billing access is neutralized: all features allowed for authenticated users.
export type PlanAccessResult = {
  allowed: boolean;
  feature: string;
  currentPlan: string | null;
  requiredPlan: string | null;
  requiredPlanName?: string | null;
};

export function checkPlanAccess(
  _plan: string | null,
  _status: string | null,
  feature: string
): PlanAccessResult {
  return {
    allowed: true,
    feature,
    currentPlan: null,
    requiredPlan: null,
    requiredPlanName: null,
  };
}
