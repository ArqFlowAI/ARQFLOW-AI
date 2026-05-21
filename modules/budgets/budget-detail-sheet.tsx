"use client";

import { X, FileDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BudgetBranding } from "@/types/budget";
import type { BudgetItem } from "@/types";
import type { Budget } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BudgetRow = Budget & {
  user?: { name: string | null };
};

export function BudgetDetailSheet({
  budget,
  onClose,
}: {
  budget: BudgetRow | null;
  onClose: () => void;
}) {
  if (!budget) return null;

  const branding = budget.branding as BudgetBranding | null;
  const items = budget.items as BudgetItem[];
  const intro = branding?.introText;
  const conclusion = branding?.conclusionText;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-brand-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-brand-black",
          "animate-in slide-in-from-right"
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold">{budget.title}</h2>
            <p className="text-sm text-brand-dark/50">
              {budget.clientName ?? "—"} · {formatDate(budget.createdAt)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {branding?.projectLabel && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{branding.projectLabel}</Badge>
              {branding.area && <Badge>{branding.area} m²</Badge>}
              {branding.styleLabel && (
                <Badge variant="outline">{branding.styleLabel}</Badge>
              )}
              {branding.finishLabel && (
                <Badge variant="outline">{branding.finishLabel}</Badge>
              )}
            </div>
          )}

          {intro && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40 mb-2">
                Introdução comercial
              </h3>
              <p className="text-sm leading-relaxed text-brand-dark/80 whitespace-pre-line">
                {intro}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40 mb-3">
              Itens
            </h3>
            <div className="divide-y rounded-xl border border-brand-light/15">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <span className="text-brand-dark/80 pr-4">
                    {item.description}
                  </span>
                  <span className="font-medium tabular-nums shrink-0">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-brand-beige/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(budget.subtotal)}</span>
            </div>
            {budget.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto</span>
                <span>-{formatCurrency(budget.discount)}</span>
              </div>
            )}
            {budget.tax > 0 && (
              <div className="flex justify-between">
                <span>Taxas</span>
                <span>{formatCurrency(budget.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-display text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(budget.total)}</span>
            </div>
          </div>

          {conclusion && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40 mb-2">
                Conclusão
              </h3>
              <p className="text-sm leading-relaxed text-brand-dark/80 whitespace-pre-line">
                {conclusion}
              </p>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex gap-2">
          {budget.pdfUrl && (
            <Button className="flex-1 gap-2" asChild>
              <Link href={budget.pdfUrl} target="_blank">
                <FileDown className="h-4 w-4" />
                Baixar PDF
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
