import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { UpgradeGatePage } from "@/components/billing/upgrade-gate-page";
import {
  getRequiredPlanForFeature,
  type PlanFeature,
} from "@/config/plans";
import type { SubscriptionPlan } from "@prisma/client";
import { hasPlanAccess } from "@/config/plans";

const VALID_FEATURES: PlanFeature[] = [
  "renders",
  "crm",
  "whatsapp",
  "automations",
  "budgets",
  "concepts",
  "projects",
];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{
    feature?: string;
    plan?: string;
    from?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const feature = (
    VALID_FEATURES.includes(params.feature as PlanFeature)
      ? params.feature
      : "renders"
  ) as PlanFeature;

  const requiredPlan = (
    params.plan &&
    ["FREE", "BASIC", "PRO", "PREMIUM"].includes(params.plan)
      ? params.plan
      : getRequiredPlanForFeature(feature)
  ) as SubscriptionPlan;

  if (hasPlanAccess(session.plan, feature)) {
    redirect(params.from?.startsWith("/") ? params.from : "/dashboard");
  }

  return (
    <UpgradeGatePage
      feature={feature}
      requiredPlan={requiredPlan}
      currentPlan={session.plan}
      fromPath={params.from}
    />
  );
}
