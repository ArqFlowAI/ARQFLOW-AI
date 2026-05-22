import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function RendersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="renders" returnPath="/dashboard/renders">
      {children}
    </PlanRouteGuard>
  );
}
