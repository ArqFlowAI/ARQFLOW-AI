"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteBudgetAction } from "@/actions/budget.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BudgetBranding } from "@/types/budget";
import type { Budget } from "@prisma/client";
import {
  FileDown,
  FileText,
  Trash2,
  Eye,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BudgetDetailSheet } from "@/modules/budgets/budget-detail-sheet";
import { cn } from "@/lib/utils";

type BudgetRow = Budget & {
  user: { id: string; name: string | null; email?: string };
};

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-50 text-blue-800",
  signed: "bg-emerald-50 text-emerald-800",
};

export function BudgetHistoryList({
  budgets,
  currentUserId,
}: {
  budgets: BudgetRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = budgets.find((b) => b.id === selectedId) ?? null;

  if (budgets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-light/30 py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-brand-light/50" />
        <p className="mt-4 text-brand-dark/50">Nenhuma proposta criada ainda</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {budgets.map((b) => {
          const branding = b.branding as BudgetBranding | null;
          const isMine = b.userId === currentUserId;

          return (
            <div
              key={b.id}
              className="group flex flex-col gap-4 rounded-2xl border border-brand-light/15 bg-white/50 p-5 transition-all hover:border-brand-light/40 hover:shadow-md dark:bg-brand-black/20 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-semibold truncate">{b.title}</p>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      statusStyles[b.status] ?? "bg-brand-beige/50"
                    )}
                  >
                    {b.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-brand-dark/60">
                  {b.clientName ?? "Sem cliente"} · {formatDate(b.createdAt)}
                </p>
                {branding?.projectLabel && (
                  <p className="mt-1 text-xs text-brand-dark/45">
                    {branding.projectLabel}
                    {branding.area ? ` · ${branding.area} m²` : ""}
                    {branding.finishLabel
                      ? ` · ${branding.finishLabel}`
                      : ""}
                  </p>
                )}
                <p className="mt-2 flex items-center gap-1 text-[10px] text-brand-dark/40">
                  <User className="h-3 w-3" />
                  {b.user.name ?? "Usuário"}
                  {isMine && " (você)"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular-nums">
                    {formatCurrency(b.total)}
                  </p>
                  {b.discount > 0 && (
                    <p className="text-[10px] text-brand-dark/40">
                      desc. {formatCurrency(b.discount)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setSelectedId(b.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </Button>
                  {b.pdfUrl && (
                    <Button size="sm" className="gap-1" asChild>
                      <Link href={b.pdfUrl} target="_blank" rel="noopener">
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={async () => {
                      if (!confirm("Excluir proposta?")) return;
                      const r = await deleteBudgetAction(b.id);
                      if ("error" in r && r.error) toast.error(r.error);
                      else {
                        toast.success("Removido");
                        router.refresh();
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BudgetDetailSheet
        budget={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
