"use client";

import { useMemo, useState, useCallback } from "react";
import { CrmKanban } from "@/modules/crm/crm-kanban";
import { CrmToolbar } from "@/modules/crm/crm-toolbar";
import { LeadDetailDrawer } from "@/modules/crm/lead-detail-drawer";
import { LeadFormDialog } from "@/modules/crm/lead-form-dialog";
import type { LeadWithRelations } from "@/types";
import type { LeadStage, LeadPriority } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type CrmBoardProps = {
  leads: LeadWithRelations[];
  stageCounts: { stage: LeadStage; _count: number }[];
  totalValue: number;
  orgTags?: string[];
};

export function CrmBoard({
  leads: initialLeads,
  stageCounts,
  totalValue,
  orgTags = [],
}: CrmBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "ALL">(
    "ALL"
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leads.filter((l) => {
      if (stageFilter !== "ALL" && l.stage !== stageFilter) return false;
      if (priorityFilter !== "ALL" && l.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.company?.toLowerCase().includes(q) ?? false) ||
        (l.email?.toLowerCase().includes(q) ?? false) ||
        (l.phone?.toLowerCase().includes(q) ?? false) ||
        (l.interest?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, search, stageFilter, priorityFilter]);

  const visibleIds = useMemo(
    () => new Set(filteredLeads.map((l) => l.id)),
    [filteredLeads]
  );

  const handleLeadUpdated = useCallback((updated: LeadWithRelations) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
    );
  }, []);

  const hasFilters =
    search.length > 0 ||
    stageFilter !== "ALL" ||
    priorityFilter !== "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-[#3D3229] hover:bg-[#1E1E1E] text-[#F7F3EE] shrink-0"
        >
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>
      </div>

      {hasFilters && (
        <p className="text-xs text-brand-dark/50">
          Exibindo {filteredLeads.length} de {leads.length} leads (filtros ativos)
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

      <LeadFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
