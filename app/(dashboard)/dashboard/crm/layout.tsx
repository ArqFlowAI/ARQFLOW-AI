import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function DashboardCrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="crm" returnPath="/dashboard/crm">
      {children}
    </PlanRouteGuard>
  );
}
