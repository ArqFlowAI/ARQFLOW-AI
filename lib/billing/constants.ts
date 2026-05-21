export const CREDIT_COSTS = {
  concept: 2,
  render: 5,
  budget: 1,
} as const;

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativa",
  TRIALING: "Trial",
  PAST_DUE: "Pagamento pendente",
  CANCELED: "Cancelada",
  INCOMPLETE: "Incompleta",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  succeeded: "Pago",
  pending: "Pendente",
  failed: "Falhou",
  canceled: "Cancelado",
};

export const PLAN_ORDER = ["STARTER", "PRO", "PREMIUM"] as const;

export function comparePlans(current: string, target: string) {
  const order = PLAN_ORDER as readonly string[];
  const a = order.indexOf(current);
  const b = order.indexOf(target);
  if (a === b) return "same";
  return b > a ? "upgrade" : "downgrade";
}
