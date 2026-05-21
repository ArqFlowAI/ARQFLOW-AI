import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Lead } from "@prisma/client";

import { STAGE_LABELS } from "@/lib/crm/constants";

export function RecentLeads({
  leads,
}: {
  leads: (Lead & { assignee: { name: string | null } | null })[];
}) {
  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Leads recentes</h3>
        <Link
          href="/crm"
          className="flex items-center gap-1 text-xs font-medium text-brand-dark hover:underline"
        >
          CRM <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-4 divide-y divide-brand-light/15">
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-dark/50">
            Nenhum lead ainda
          </p>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href="/crm"
              className="flex items-center justify-between py-3 transition-colors hover:bg-brand-beige/10 -mx-2 px-2 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium">{lead.name}</p>
                <p className="text-xs text-brand-dark/50">
                  {lead.company ?? lead.email ?? "—"} · {formatDate(lead.updatedAt)}
                </p>
              </div>
              <Badge variant="secondary">
                {STAGE_LABELS[lead.stage] ?? lead.stage}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
