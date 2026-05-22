import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function DashboardWhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="whatsapp" returnPath="/dashboard/whatsapp">
      {children}
    </PlanRouteGuard>
  );
}
