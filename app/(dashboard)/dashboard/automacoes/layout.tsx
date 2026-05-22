import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function AutomacoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="automations" returnPath="/dashboard/automacoes">
      {children}
    </PlanRouteGuard>
  );
}
