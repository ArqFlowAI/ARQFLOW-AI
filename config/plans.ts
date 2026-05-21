import { SubscriptionPlan } from "@prisma/client";

export const PLANS = {
  STARTER: {
    id: "STARTER" as SubscriptionPlan,
    name: "Starter",
    price: 97,
    priceId: process.env.STRIPE_PRICE_STARTER,
    credits: 50,
    features: [
      "50 créditos IA/mês",
      "5 projetos ativos",
      "Conceitos arquitetônicos",
      "10 renders IA/mês",
      "CRM básico",
      "Suporte por email",
    ],
    limits: {
      projects: 5,
      renders: 10,
      concepts: 30,
      automations: 2,
      teamMembers: 1,
    },
  },
  PRO: {
    id: "PRO" as SubscriptionPlan,
    name: "Pro",
    price: 197,
    priceId: process.env.STRIPE_PRICE_PRO,
    credits: 200,
    features: [
      "200 créditos IA/mês",
      "Projetos ilimitados",
      "Renders IA ilimitados",
      "Orçamentos com PDF",
      "CRM completo + Kanban",
      "Automações WhatsApp",
      "5 membros na equipe",
    ],
    limits: {
      projects: -1,
      renders: -1,
      concepts: -1,
      automations: 10,
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
      "500 créditos IA/mês",
      "Tudo do Pro",
      "White-label",
      "API access",
      "Automações ilimitadas",
      "Prioridade no suporte",
      "Membros ilimitados",
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

export function getPlanLimits(plan: SubscriptionPlan) {
  return PLANS[plan].limits;
}

export function getPlanCredits(plan: SubscriptionPlan) {
  return PLANS[plan].credits;
}
