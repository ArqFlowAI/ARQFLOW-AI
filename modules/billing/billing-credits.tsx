"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDIT_COSTS } from "@/lib/billing/constants";
import type { BillingUsageByUserDto } from "@/types/billing";
import { Zap, Users } from "lucide-react";

export function BillingCredits({
  creditsRemaining,
  creditsTotal,
  creditsUsed,
  usageByUser,
  usageByType,
}: {
  creditsRemaining: number;
  creditsTotal: number;
  creditsUsed: number;
  usageByUser: BillingUsageByUserDto[];
  usageByType: { type: string; amount: number }[];
}) {
  const unlimited = creditsTotal <= 0;
  const pct = unlimited ? 0 : Math.round((creditsUsed / creditsTotal) * 100);
  const creditsLabel = unlimited ? "Ilimitado" : creditsRemaining;
  const usageLabel = unlimited ? "Ilimitado" : `${creditsUsed} de ${creditsTotal}`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-brand-light/20 overflow-hidden">
          <div className="bg-gradient-to-br from-brand-dark to-brand-black p-6 text-brand-bg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-beige" />
              <span className="text-sm text-brand-beige/80">Créditos IA</span>
            </div>
            <p className="mt-3 font-display text-4xl font-bold">{creditsLabel}</p>
            <p className="text-sm text-brand-beige/70">disponíveis</p>
            <div className="mt-4 h-2 rounded-full bg-brand-black/40 overflow-hidden">
              <div
                className="h-full bg-brand-beige transition-all"
                style={{ width: `${unlimited ? 100 : 100 - pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-brand-beige/60">
              {usageLabel} usados no período
            </p>
          </div>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-brand-light/10">
              <span>Conceito</span>
              <span className="font-medium">{CREDIT_COSTS.concept} créditos</span>
            </div>
            <div className="flex justify-between py-2 border-b border-brand-light/10">
              <span>Render IA</span>
              <span className="font-medium">{CREDIT_COSTS.render} créditos</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Orçamento + PDF</span>
              <span className="font-medium">{CREDIT_COSTS.budget} crédito</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-brand-light/20 h-full">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Uso por membro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageByUser.length === 0 ? (
              <p className="text-sm text-brand-dark/50 py-6 text-center">
                Nenhum consumo registrado ainda
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {usageByUser.map((u) => (
                  <div
                    key={u.userId ?? "system"}
                    className="rounded-xl border border-brand-light/15 px-3 py-2"
                  >
                    <div className="flex justify-between text-sm font-medium">
                      <span>{u.userName}</span>
                      <span>{u.totalCredits} cr.</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {u.breakdown.map((b) => (
                        <span
                          key={b.type}
                          className="text-[10px] text-brand-dark/45 bg-brand-beige/30 px-1.5 py-0.5 rounded"
                        >
                          {b.type}: {b.amount}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {usageByType.length > 0 && (
              <div className="mt-4 pt-4 border-t border-brand-light/10">
                <p className="text-xs text-brand-dark/50 mb-2">Por recurso</p>
                <div className="flex flex-wrap gap-2">
                  {usageByType.map((t) => (
                    <span
                      key={t.type}
                      className="text-xs rounded-full bg-brand-beige/40 px-2 py-1"
                    >
                      {t.type}: {t.amount}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
