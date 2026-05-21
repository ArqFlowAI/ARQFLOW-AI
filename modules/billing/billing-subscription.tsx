"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/billing/constants";
import { PLANS } from "@/config/plans";
import type { BillingSubscriptionDto } from "@/types/billing";
import { formatDate } from "@/lib/utils";
import {
  cancelSubscriptionAction,
  openBillingPortalAction,
  reactivateSubscriptionAction,
} from "@/actions/billing.actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { CreditCard, Shield } from "lucide-react";

export function BillingSubscription({
  subscription,
}: {
  subscription: BillingSubscriptionDto;
}) {
  const [pending, startTransition] = useTransition();
  const plan = PLANS[subscription.plan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-brand-light/25 bg-gradient-to-br from-brand-beige/40 via-white/80 to-brand-light/10 dark:from-brand-dark/40 dark:to-brand-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assinatura atual
            </CardTitle>
            <Badge
              variant={
                subscription.status === "ACTIVE" ? "success" : "secondary"
              }
            >
              {SUBSCRIPTION_STATUS_LABELS[subscription.status] ??
                subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-brand-dark/50">Plano</p>
              <p className="font-display text-2xl font-bold">{plan.name}</p>
              <p className="text-sm text-brand-dark/60">
                R${plan.price}/mês · {plan.credits} créditos
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-dark/50">Créditos</p>
              <p className="font-display text-2xl font-bold">
                {subscription.creditsRemaining}
              </p>
              <p className="text-sm text-brand-dark/60">
                {subscription.creditsUsed} de {subscription.credits} usados
              </p>
            </div>
            {subscription.currentPeriodEnd && (
              <div>
                <p className="text-xs text-brand-dark/50">Renova em</p>
                <p className="font-medium">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            )}
          </div>

          {subscription.cancelAtPeriodEnd && (
            <p className="rounded-lg bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
              Cancelamento agendado para o fim do período atual.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {subscription.hasStripe && (
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await openBillingPortalAction();
                    if (res.url) window.location.href = res.url;
                    else toast.error(res.error);
                  })
                }
              >
                <CreditCard className="h-4 w-4" />
                Portal Stripe
              </Button>
            )}
            {subscription.cancelAtPeriodEnd ? (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await reactivateSubscriptionAction();
                    if (res.success) toast.success("Assinatura reativada");
                    else toast.error(res.error);
                  })
                }
              >
                Reativar assinatura
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    if (
                      !confirm(
                        "Cancelar assinatura ao fim do período atual?"
                      )
                    )
                      return;
                    const res = await cancelSubscriptionAction();
                    if (res.success) toast.success("Cancelamento agendado");
                    else toast.error(res.error);
                  })
                }
              >
                Cancelar assinatura
              </Button>
            )}
          </div>

          <div className="flex gap-2 text-[10px] text-brand-dark/45">
            {subscription.billingProvider === "STRIPE" && (
              <span className="rounded-full bg-brand-beige/50 px-2 py-0.5">
                Stripe
              </span>
            )}
            {subscription.billingProvider === "KIWIFY" && (
              <span className="rounded-full bg-brand-beige/50 px-2 py-0.5">
                Kiwify
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
