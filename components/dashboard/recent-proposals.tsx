import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText } from "lucide-react";
import type { Budget } from "@prisma/client";

export function RecentProposals({ proposals }: { proposals: Budget[] }) {
  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Propostas</h3>
        <Link
          href="/dashboard/orcamentos"
          className="flex items-center gap-1 text-xs font-medium text-brand-dark hover:underline"
        >
          Orçamentos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {proposals.length === 0 ? (
          <p className="py-6 text-center text-sm text-brand-dark/50">
            Nenhuma proposta criada
          </p>
        ) : (
          proposals.map((p) => (
            <Link
              key={p.id}
              href="/dashboard/orcamentos"
              className="flex items-center gap-4 rounded-xl border border-brand-light/10 p-3 transition-colors hover:bg-brand-beige/15"
            >
              <div className="rounded-lg bg-brand-beige/40 p-2">
                <FileText className="h-4 w-4 text-brand-dark" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="text-xs text-brand-dark/50">
                  {p.clientName ?? "Sem cliente"} · {formatDate(p.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(p.total)}</p>
                <Badge variant="secondary" className="mt-0.5">
                  {p.status}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
