"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS } from "@/lib/billing/constants";
import type { BillingPaymentDto } from "@/types/billing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Receipt } from "lucide-react";

export function BillingPayments({
  payments,
}: {
  payments: BillingPaymentDto[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Histórico de pagamentos
        </h2>
        <p className="text-sm text-brand-dark/60 mt-0.5">
          Stripe e Kiwify sincronizados no Supabase
        </p>
      </div>
      <div className="rounded-2xl border border-brand-light/20 bg-white/50 overflow-hidden dark:bg-brand-black/30">
        {payments.length === 0 ? (
          <p className="py-12 text-center text-sm text-brand-dark/50">
            Nenhum pagamento registrado ainda
          </p>
        ) : (
          <div className="divide-y divide-brand-light/10">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-brand-beige/10"
              >
                <div>
                  <p className="font-medium text-sm">
                    {formatCurrency(p.amount, "pt-BR")}
                    <span className="text-brand-dark/40 font-normal ml-1">
                      {p.currency}
                    </span>
                  </p>
                  <p className="text-[10px] font-mono text-brand-dark/40 mt-0.5">
                    {p.externalId.slice(0, 24)}…
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{p.provider}</Badge>
                  <Badge
                    variant={
                      p.status === "paid" || p.status === "succeeded"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                  </Badge>
                  <span className="text-xs text-brand-dark/45">
                    {formatDate(p.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
