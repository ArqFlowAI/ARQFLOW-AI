"use client";

import { motion } from "framer-motion";
import { PLANS } from "@/config/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function BillingPlans() {
  const plan = PLANS.PREMIUM;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Plano Premium</h2>
        <p className="text-sm text-brand-dark/60">
          Plano único no produto: Premium por R$104,99/mês.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative h-full border-brand-dark shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                <Badge>Plano único</Badge>
              </div>
              <p className="font-display text-3xl font-bold mt-2">
                R${plan.price}
                <span className="text-sm font-normal text-brand-dark/50">/mês</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-brand-dark" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="rounded-lg border border-brand-light/20 bg-brand-beige/10 px-4 py-3 text-sm text-brand-dark/70">
                Pagamento e faturamento são gerenciados fora do produto.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
