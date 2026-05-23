import { SubscriptionPlan } from "@prisma/client";

/** Planos comerciais (ordem crescente de acesso) */
export const PLAN_ORDER: SubscriptionPlan[] = ["PREMIUM"];

export type PlanFeature =
  | "dashboard"
  | "projects"
  | "concepts"
  | "budgets"
  | "renders"
  | "crm"
  | "whatsapp"
  | "automations";

export const PLANS = {
  PREMIUM: {
    id: "PREMIUM" as SubscriptionPlan,
    name: "PREMIUM",
    price: 104.99,
    priceId: null,
    credits: -1,
    features: [
      "Dashboard completo",
      "Projetos ilimitados",
      "Conceitos IA ilimitados",
      "Render IA ilimitado",
      "CRM e WhatsApp",
      "Automações",
    ],
    limits: {
      projects: -1,
      renders: -1,
      concepts: -1,
      automations: -1,
      teamMembers: -1,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Plano mínimo exigido por recurso */
export const FEATURE_MIN_PLAN: Record<PlanFeature, SubscriptionPlan> = {
  dashboard: "PREMIUM",
  projects: "PREMIUM",
  concepts: "PREMIUM",
  budgets: "PREMIUM",
  renders: "PREMIUM",
  crm: "PREMIUM",
  whatsapp: "PREMIUM",
  automations: "PREMIUM",
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  dashboard: "Dashboard",
  projects: "Projetos",
  concepts: "Conceitos IA",
  budgets: "Orçamentos",
  renders: "Render IA",
  crm: "CRM",
  whatsapp: "WhatsApp",
  automations: "Automações",
};

export function getPlanLimits(plan: SubscriptionPlan) {
  const key = normalizePlanKey(plan) as keyof typeof PLANS;
  return PLANS[key].limits;
}

export function getPlanCredits(plan: SubscriptionPlan) {
  const key = normalizePlanKey(plan) as keyof typeof PLANS;
  return PLANS[key].credits;
}

export function normalizePlanKey(plan: string): string {
  if (
    plan === "STARTER" ||
    plan === "FREE" ||
    plan === "BASIC" ||
    plan === "PRO" ||
    plan === "ENTERPRISE"
  ) {
    return "PREMIUM";
  }
  if (plan in PLANS) return plan as PlanKey;
  return "PREMIUM";
}

export function planRank(plan: SubscriptionPlan | string): number {
  const key = normalizePlanKey(plan);
  return PLAN_ORDER.indexOf(key as SubscriptionPlan);
}

export function hasPlanAccess(
  currentPlan: SubscriptionPlan | string,
  feature: PlanFeature
): boolean {
  return true;
}

export function getRequiredPlanForFeature(
  feature: PlanFeature
): SubscriptionPlan {
  return FEATURE_MIN_PLAN[feature];
}
