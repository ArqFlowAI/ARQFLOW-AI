"use client";

import { formatCurrency } from "@/lib/utils";
import type { BudgetEstimateResult } from "@/types/budget";
import { Calculator, TrendingUp } from "lucide-react";

export function BudgetEstimatePreview({
  estimate,
}: {
  estimate: BudgetEstimateResult | null;
}) {
  if (!estimate) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand-light/30 bg-brand-beige/5 p-8 text-center">
        <Calculator className="h-10 w-10 text-brand-light/50" />
        <p className="mt-4 text-sm text-brand-dark/50 max-w-xs">
          Preencha os parâmetros e clique em calcular para ver a estimativa
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/60 shadow-sm dark:bg-brand-black/30">
      <div className="border-b border-brand-light/15 px-5 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-dark" />
          <h3 className="font-display font-semibold">Estimativa automática</h3>
        </div>
        <p className="mt-1 text-xs text-brand-dark/50">
          {estimate.meta.projectLabel} · {estimate.meta.area} m² ·{" "}
          {estimate.meta.styleLabel} · {estimate.meta.finishLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 border-b border-brand-light/10">
        <div className="rounded-xl bg-brand-beige/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-brand-dark/45">
            R$/m²
          </p>
          <p className="font-display text-lg font-bold">
            {formatCurrency(estimate.pricePerSqm)}
          </p>
        </div>
        <div className="rounded-xl bg-brand-dark/5 p-3 dark:bg-brand-dark/30">
          <p className="text-[10px] uppercase tracking-wider text-brand-dark/45">
            Subtotal
          </p>
          <p className="font-display text-lg font-bold">
            {formatCurrency(estimate.subtotal)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-brand-light/10 max-h-[280px] overflow-y-auto">
        {estimate.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <span className="text-brand-dark/80 pr-4">{item.description}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {formatCurrency(item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
