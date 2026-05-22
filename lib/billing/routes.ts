import type { PlanFeature } from "@/config/plans";

/** Rotas premium → recurso exigido (pathname normalizado, sem query) */
const ROUTE_FEATURES: { prefix: string; feature: PlanFeature }[] = [
  { prefix: "/dashboard/renders", feature: "renders" },
  { prefix: "/dashboard/orcamentos", feature: "budgets" },
  { prefix: "/dashboard/automacoes", feature: "automations" },
  { prefix: "/dashboard/whatsapp", feature: "whatsapp" },
  { prefix: "/dashboard/crm", feature: "crm" },
  { prefix: "/crm", feature: "crm" },
  { prefix: "/whatsapp", feature: "whatsapp" },
];

const API_ROUTE_FEATURES: { prefix: string; feature: PlanFeature }[] = [
  { prefix: "/api/renders", feature: "renders" },
  { prefix: "/api/budgets", feature: "budgets" },
  { prefix: "/api/whatsapp", feature: "whatsapp" },
];

export function getFeatureForPath(pathname: string): PlanFeature | null {
  const match = ROUTE_FEATURES.find((r) => pathname.startsWith(r.prefix));
  return match?.feature ?? null;
}

export function getFeatureForApiPath(pathname: string): PlanFeature | null {
  if (pathname.startsWith("/api/cron")) return null;
  const match = API_ROUTE_FEATURES.find((r) => pathname.startsWith(r.prefix));
  return match?.feature ?? null;
}

export function isAlwaysAllowedPath(pathname: string): boolean {
  if (pathname === "/billing/upgrade" || pathname.startsWith("/billing/upgrade")) {
    return true;
  }
  if (pathname === "/billing" || pathname.startsWith("/billing")) {
    return true;
  }
  if (pathname === "/dashboard/billing" || pathname.startsWith("/dashboard/billing")) {
    return true;
  }
  if (pathname === "/dashboard/configuracoes") return true;
  if (pathname === "/onboarding") return true;
  return false;
}
