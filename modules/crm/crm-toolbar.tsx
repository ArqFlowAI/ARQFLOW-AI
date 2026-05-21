"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CRM_STAGES, PRIORITY_CONFIG } from "@/lib/crm/constants";
import type { LeadStage, LeadPriority } from "@prisma/client";

type CrmToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  stageFilter: LeadStage | "ALL";
  onStageFilterChange: (v: LeadStage | "ALL") => void;
  priorityFilter: LeadPriority | "ALL";
  onPriorityFilterChange: (v: LeadPriority | "ALL") => void;
  totalCount: number;
  filteredCount: number;
};

const priorities: LeadPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function CrmToolbar({
  search,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  totalCount,
  filteredCount,
}: CrmToolbarProps) {
  return (
    <div className="rounded-2xl border border-[#E8DFD0]/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:bg-[#1A1816]/60 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B4F3A]/40" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar nome, telefone, email ou interesse..."
            className="h-10 border-[#E8DFD0] bg-[#FAF8F5] pl-10 text-sm placeholder:text-[#6B4F3A]/40"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B4F3A]/60 tabular-nums shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filteredCount === totalCount
            ? `${totalCount} leads`
            : `${filteredCount} / ${totalCount}`}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#6B4F3A]/45 mr-1">
            Status
          </span>
          <FilterChip
            active={stageFilter === "ALL"}
            onClick={() => onStageFilterChange("ALL")}
            label="Todos"
          />
          {CRM_STAGES.map((s) => (
            <FilterChip
              key={s.id}
              active={stageFilter === s.id}
              onClick={() => onStageFilterChange(s.id)}
              label={s.label}
              color={stageFilter === s.id ? s.color : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#6B4F3A]/45 mr-1">
          Prioridade
        </span>
        <FilterChip
          active={priorityFilter === "ALL"}
          onClick={() => onPriorityFilterChange("ALL")}
          label="Todas"
        />
        {priorities.map((p) => (
          <FilterChip
            key={p}
            active={priorityFilter === p}
            onClick={() => onPriorityFilterChange(p)}
            label={PRIORITY_CONFIG[p].label}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all",
        active
          ? color
            ? "text-white shadow-sm"
            : "bg-[#3D3229] text-[#F7F3EE]"
          : "bg-[#F5F0E8] text-[#6B4F3A]/70 hover:bg-[#EDE6DA]"
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  );
}
