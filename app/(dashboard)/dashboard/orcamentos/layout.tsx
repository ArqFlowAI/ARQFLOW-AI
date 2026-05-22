import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function OrcamentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="budgets" returnPath="/dashboard/orcamentos">
      {children}
    </PlanRouteGuard>
  );
}
