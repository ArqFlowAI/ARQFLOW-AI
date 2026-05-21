"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CrmKanban } from "@/modules/crm/crm-kanban";
import { CrmToolbar } from "@/modules/crm/crm-toolbar";
import { LeadDetailDrawer } from "@/modules/crm/lead-detail-drawer";
import { LeadFormDialog } from "@/modules/crm/lead-form-dialog";
import type { LeadWithRelations } from "@/types";
import type { LeadStage, LeadPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
type CrmPageProps = {
  leads: LeadWithRelations[];
  stats: {
    total: number;
    pipeline: number;
    closed: number;
    lost: number;
    totalValue: number;
    conversion: number;
  };
};

export function CrmPage({ leads: initialLeads, stats }: CrmPageProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "ALL">(
    "ALL"
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((l) => {
      if (stageFilter !== "ALL" && l.stage !== stageFilter) return false;
      if (priorityFilter !== "ALL" && l.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.phone?.toLowerCase().includes(q) ?? false) ||
        (l.email?.toLowerCase().includes(q) ?? false) ||
        (l.interest?.toLowerCase().includes(q) ?? false) ||
        (l.company?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, search, stageFilter, priorityFilter]);

  const visibleIds = useMemo(
    () => new Set(filteredLeads.map((l) => l.id)),
    [filteredLeads]
  );

  const hasFilters =
    search.length > 0 || stageFilter !== "ALL" || priorityFilter !== "ALL";

  return (
    <div className="space-y-5 -mx-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1E1E1E] dark:text-[#F7F3EE]">
            CRM
          </h1>
          <p className="mt-1 text-sm text-[#6B4F3A]/70 max-w-xl">
            Pipeline comercial · arraste entre etapas · dados salvos no Supabase
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-[#3D3229] hover:bg-[#1E1E1E] text-[#F7F3EE] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 px-1">
        <StatCard
          icon={Users}
          label="Total leads"
          value={String(stats.total)}
        />
        <StatCard
          icon={Target}
          label="No pipeline"
          value={String(stats.pipeline)}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversão"
          value={`${stats.conversion}%`}
        />
        <StatCard
          icon={DollarSign}
          label="Valor ativo"
          value={formatCurrency(stats.totalValue)}
        />
      </div>

      <div className="px-1">
        <CrmToolbar
          search={search}
          onSearchChange={setSearch}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          totalCount={leads.length}
          filteredCount={filteredLeads.length}
        />
      </div>

      {hasFilters && (
        <p className="text-xs text-[#6B4F3A]/50 px-1">
          Exibindo {filteredLeads.length} de {leads.length} leads com filtros
          ativos
        </p>
      )}

      <CrmKanban
        leads={leads}
        visibleIds={hasFilters ? visibleIds : null}
        onLeadsChange={setLeads}
        onSelectLead={setSelectedLeadId}
      />

      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />

      <LeadFormDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) router.refresh();
        }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8DFD0]/70 bg-white/80 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[#6B4F3A]/50">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 font-display text-lg font-semibold tabular-nums text-[#1E1E1E] truncate">
        {value}
      </p>
    </div>
  );
}
