"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BillingSubscription } from "@/modules/billing/billing-subscription";
import { BillingPlans } from "@/modules/billing/billing-plans";
import { BillingCredits } from "@/modules/billing/billing-credits";
import { BillingPayments } from "@/modules/billing/billing-payments";
import type { BillingPageData } from "@/types/billing";

export function BillingPageClient({ data }: { data: BillingPageData }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) toast.success("Assinatura atualizada!");
    if (searchParams.get("canceled")) toast.info("Checkout cancelado");
  }, [searchParams]);

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

      <BillingPlans
        currentPlan={subscription.plan}
        hasStripe={subscription.hasStripe}
      />

      <BillingPayments payments={data.payments} />

      <div className="rounded-xl border border-brand-light/15 bg-brand-beige/15 px-4 py-3 text-xs text-brand-dark/60">
        <strong>Integrações:</strong> Stripe (checkout, portal, webhooks em{" "}
        <code className="bg-white/50 px-1 rounded">/api/webhooks/stripe</code>
        ) · Kiwify (webhook em{" "}
        <code className="bg-white/50 px-1 rounded">/api/webhooks/kiwify</code>
        ). Limites de plano aplicados em conceitos, renders e recursos Pro+.
      </div>
    </div>
  );
}
