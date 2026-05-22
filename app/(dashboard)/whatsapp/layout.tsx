import { PlanRouteGuard } from "@/components/billing/plan-route-guard";

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanRouteGuard feature="whatsapp" returnPath="/whatsapp">
      {children}
    </PlanRouteGuard>
  );
}
