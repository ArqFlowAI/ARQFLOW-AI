// Billing constants neutralized — billing handled externally.
export const CREDIT_COSTS = { concept: 0, render: 0, budget: 0 } as const;

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {};
export const PAYMENT_STATUS_LABELS: Record<string, string> = {};

export function comparePlans() {
  return "same";
}
