import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="crm" returnPath="/crm">
      {children}
    </PlanRouteGuard>
  );
}
