import { SubscriptionPlan } from "@prisma/client";

/** Planos comerciais (ordem crescente de acesso) */
export const PLAN_ORDER: SubscriptionPlan[] = [
  "FREE",
  "BASIC",
  "PRO",
  "PREMIUM",
];

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
  FREE: {
    id: "FREE" as SubscriptionPlan,
    name: "Free",
    price: 0,
    priceId: undefined,
    credits: 10,
    features: [
      "Dashboard e projetos",
      "Conceitos IA (limite)",
      "Sem Render IA",
      "Sem CRM / WhatsApp",
    ],
    limits: {
      projects: 2,
      renders: 0,
      concepts: 5,
      automations: 0,
      teamMembers: 1,
    },
  },
  BASIC: {
    id: "BASIC" as SubscriptionPlan,
    name: "Basic",
    price: 97,
    priceId: process.env.STRIPE_PRICE_BASIC ?? process.env.STRIPE_PRICE_STARTER,
    credits: 50,
    features: [
      "Tudo do Free",
      "Orçamentos e PDF",
      "Mais conceitos e projetos",
      "Sem Render IA / CRM",
    ],
    limits: {
      projects: 10,
      renders: 0,
      concepts: 30,
      automations: 0,
      teamMembers: 2,
    },
  },
  PRO: {
    id: "PRO" as SubscriptionPlan,
    name: "Pro",
    price: 197,
    priceId: process.env.STRIPE_PRICE_PRO,
    credits: 200,
    features: [
      "Render IA ilimitado*",
      "CRM Kanban completo",
      "Orçamentos premium",
      "200 créditos/mês",
    ],
    limits: {
      projects: -1,
      renders: -1,
      concepts: -1,
      automations: 0,
      teamMembers: 5,
    },
  },
  PREMIUM: {
    id: "PREMIUM" as SubscriptionPlan,
    name: "Premium",
    price: 397,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    credits: 500,
    features: [
      "Tudo do Pro",
      "WhatsApp + automações",
      "500 créditos/mês",
      "Suporte prioritário",
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
  dashboard: "FREE",
  projects: "FREE",
  concepts: "FREE",
  budgets: "BASIC",
  renders: "PRO",
  crm: "PRO",
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
  const key = normalizePlanKey(plan);
  return PLANS[key].limits;
}

export function getPlanCredits(plan: SubscriptionPlan) {
  const key = normalizePlanKey(plan);
  return PLANS[key].credits;
}

export function normalizePlanKey(plan: string): PlanKey {
  if (plan === "STARTER") return "BASIC";
  if (plan in PLANS) return plan as PlanKey;
  return "FREE";
}

export function planRank(plan: SubscriptionPlan | string): number {
  const key = normalizePlanKey(plan);
  return PLAN_ORDER.indexOf(key);
}

export function hasPlanAccess(
  currentPlan: SubscriptionPlan | string,
  feature: PlanFeature
): boolean {
  const required = FEATURE_MIN_PLAN[feature];
  return planRank(currentPlan) >= planRank(required);
}

export function getRequiredPlanForFeature(
  feature: PlanFeature
): SubscriptionPlan {
  return FEATURE_MIN_PLAN[feature];
}
