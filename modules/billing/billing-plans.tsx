"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { PLANS, type PlanKey } from "@/config/plans";
import { comparePlans } from "@/lib/billing/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  changePlanAction,
  checkoutPlanAction,
} from "@/actions/billing.actions";
import type { SubscriptionPlan } from "@prisma/client";

export function BillingPlans({
  currentPlan,
  hasStripe,
}: {
  currentPlan: SubscriptionPlan;
  hasStripe: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handlePlan(key: PlanKey) {
    startTransition(async () => {
      const action = comparePlans(currentPlan, key);

      if (action === "same") return;

      if (hasStripe) {
        const res = await changePlanAction(key);
        if (res.success) {
          toast.success(
            action === "upgrade" ? "Upgrade realizado!" : "Plano alterado"
          );
        } else toast.error(res.error);
        return;
      }

      const res = await checkoutPlanAction(key);
      if (res.url) window.location.href = res.url;
      else toast.error(res.error ?? "Configure STRIPE_PRICE_* no .env");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Planos</h2>
        <p className="text-sm text-brand-dark/60">
          Free, Basic, Pro e Premium — upgrade, downgrade ou nova assinatura
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {(["FREE", "BASIC", "PRO", "PREMIUM"] as const).map((key, i) => {
          const plan = PLANS[key];
          const currentPlanKey = String(currentPlan);
          const normalizedCurrent = currentPlanKey === "STARTER" ? "BASIC" : currentPlanKey;
          const isCurrent = normalizedCurrent === key;
          const isPopular = key === "PRO";
          const action = comparePlans(currentPlanKey, key);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                className={`relative h-full ${
                  isPopular
                    ? "border-brand-dark shadow-lg ring-1 ring-brand-dark/10"
                    : "border-brand-light/20"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-dark px-3 py-1 text-[10px] font-semibold text-brand-bg">
                    Recomendado
                  </span>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-xl">
                      {plan.name}
                    </CardTitle>
                    {isCurrent && <Badge>Atual</Badge>}
                  </div>
                  <p className="font-display text-3xl font-bold mt-2">
                    R${plan.price}
                    <span className="text-sm font-normal text-brand-dark/50">
                      /mês
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-brand-dark" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={pending || isCurrent}
                    onClick={() => handlePlan(key)}
                  >
                    {isCurrent
                      ? "Plano atual"
                      : action === "upgrade"
                        ? `Upgrade para ${plan.name}`
                        : action === "downgrade"
                          ? `Downgrade para ${plan.name}`
                          : `Assinar ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
