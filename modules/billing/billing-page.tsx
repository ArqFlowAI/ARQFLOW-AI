"use client";

import { BillingSubscription } from "@/modules/billing/billing-subscription";
import { BillingPlans } from "@/modules/billing/billing-plans";
import { BillingCredits } from "@/modules/billing/billing-credits";
import type { BillingPageData } from "@/types/billing";

export function BillingPageClient({ data }: { data: BillingPageData }) {
  const { subscription } = data;

  return (
    <div className="space-y-10">
      <BillingSubscription subscription={subscription} />

      <BillingCredits
        creditsRemaining={subscription.creditsRemaining}
        creditsTotal={subscription.credits}
        creditsUsed={subscription.creditsUsed}
        usageByUser={data.usageByUser}
        usageByType={data.usageByType}
      />

      <BillingPlans />

      <div className="rounded-xl border border-brand-light/15 bg-brand-beige/15 px-4 py-3 text-sm text-brand-dark/70">
        O plano Premium é o único plano disponível no produto. Pagamento e gestão de assinatura são feitos fora do sistema.
      </div>
    </div>
  );
}
