import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { BillingPageClient } from "@/modules/billing/billing-page";
import { getBillingPageData } from "@/services/billing.service";

export default async function BillingPage() {
  const session = await getSession();
  const data = await getBillingPageData(session!.organizationId);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-light/20 bg-gradient-to-br from-brand-beige/50 via-brand-bg to-brand-light/15 p-8 dark:from-brand-dark/40 dark:via-brand-black dark:to-brand-dark/20">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-light/20 blur-3xl" />
        <PageHeader
          title="Billing"
          description="Planos, créditos IA, assinatura Stripe/Kiwify e histórico de pagamentos"
          className="relative border-0 p-0"
        />
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse h-96 rounded-2xl bg-brand-beige/20" />
        }
      >
        <BillingPageClient data={data} />
      </Suspense>
    </div>
  );
}
