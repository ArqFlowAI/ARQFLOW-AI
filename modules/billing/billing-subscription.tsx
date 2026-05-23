"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingSubscriptionDto } from "@/types/billing";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

export function BillingSubscription({
  subscription,
}: {
  subscription: BillingSubscriptionDto;
}) {
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
              Plano Premium
            </CardTitle>
            <Badge variant={subscription.status === "ACTIVE" ? "success" : "secondary"}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-brand-dark/50">Plano</p>
              <p className="font-display text-2xl font-bold">PREMIUM</p>
              <p className="text-sm text-brand-dark/60">R$104,99/mês · Créditos ilimitados</p>
            </div>
            <div>
              <p className="text-xs text-brand-dark/50">Créditos</p>
              <p className="font-display text-2xl font-bold">
                {subscription.creditsRemaining < 0 ? "Ilimitado" : subscription.creditsRemaining}
              </p>
              <p className="text-sm text-brand-dark/60">
                {subscription.creditsUsed < 0 ? "Uso ilimitado" : `${subscription.creditsUsed} usados`}
              </p>
            </div>
            {subscription.currentPeriodEnd && (
              <div>
                <p className="text-xs text-brand-dark/50">Renova em</p>
                <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-brand-light/20 bg-brand-beige/10 px-4 py-3 text-sm text-brand-dark/70">
            Todos os recursos estão disponíveis no plano Premium. O pagamento é gerenciado fora do produto.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
