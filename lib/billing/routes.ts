import type { PlanFeature } from "@/config/plans";

/** Rotas premium → recurso exigido (pathname normalizado, sem query) */
// Billing route mapping neutralized — features are unrestricted.
export function getFeatureForPath() {
  return null;
}

export function getFeatureForApiPath() {
  return null;
}

export function isAlwaysAllowedPath() {
  return true;
}
