import { enforcePlanFeature } from "@/lib/billing/enforce-plan";
import type { PlanFeature } from "@/config/plans";

/**
 * Server guard — coloque no layout.tsx de rotas premium.
 */
export async function PlanRouteGuard({
  feature,
  returnPath,
  children,
}: {
  feature: PlanFeature;
  returnPath: string;
  children: React.ReactNode;
}) {
  await enforcePlanFeature(feature, returnPath);
  return <>{children}</>;
}
