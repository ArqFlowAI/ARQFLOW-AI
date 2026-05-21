"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo } from "react";
import {
  updateLeadStageAction,
  reorderLeadsAction,
} from "@/actions/lead.actions";
import { CRM_STAGES, PRIORITY_CONFIG } from "@/lib/crm/constants";
import type { LeadWithRelations } from "@/types";
import type { LeadStage } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import {
  GripVertical,
  Mail,
  Phone,
  Target,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/modules/crm/lead-priority-select";
import { toast } from "sonner";

function LeadCard({
  lead,
  onSelect,
}: {
  lead: LeadWithRelations;
  onSelect: (leadId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id, data: { type: "lead", stage: lead.stage } });

  const priorityCfg = PRIORITY_CONFIG[lead.priority];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      className="touch-manipulation"
    >
      <article
        role="button"
        tabIndex={0}
        onClick={() => onSelect(lead.id)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(lead.id)}
        className={cn(
          "group mb-2.5 cursor-pointer rounded-xl border border-[#E8DFD0]/90 bg-white p-0 shadow-sm transition-all",
          "hover:shadow-md hover:border-[#C4A882]/60 hover:-translate-y-px",
          priorityCfg.border,
          "border-l-[3px]",
          isDragging && "ring-2 ring-[#6B4F3A]/25 shadow-lg"
        )}
      >
        <div className="flex">
          <button
            type="button"
            className="flex shrink-0 cursor-grab items-center px-1.5 text-[#6B4F3A]/20 group-hover:text-[#6B4F3A]/45 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Arrastar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 py-3 pr-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-[13px] leading-snug text-[#1E1E1E] truncate">
                {lead.name}
              </h3>
              <PriorityBadge priority={lead.priority} />
            </div>

            <div className="mt-2 space-y-1">
              {lead.phone && (
                <p className="flex items-center gap-1.5 text-[11px] text-[#6B4F3A]/75 truncate">
                  <Phone className="h-3 w-3 shrink-0 opacity-60" />
                  {lead.phone}
                </p>
              )}
              {lead.email && (
                <p className="flex items-center gap-1.5 text-[11px] text-[#6B4F3A]/75 truncate">
                  <Mail className="h-3 w-3 shrink-0 opacity-60" />
                  {lead.email}
                </p>
              )}
              {lead.interest && (
                <p className="flex items-center gap-1.5 text-[11px] text-[#6B4F3A]/75 truncate">
                  <Target className="h-3 w-3 shrink-0 opacity-60" />
                  {lead.interest}
                </p>
              )}
            </div>

            {lead.value != null && lead.value > 0 && (
              <p className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#3D3229]">
                <DollarSign className="h-3 w-3 opacity-70" />
                {formatCurrency(lead.value)}
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function KanbanColumn({
  stageId,
  label,
  color,
  headerText,
  leads,
  visibleIds,
  onSelectLead,
}: {
  stageId: LeadStage;
  label: string;
  color: string;
  headerText: string;
  leads: LeadWithRelations[];
  visibleIds: Set<string> | null;
  onSelectLead: (leadId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
    data: { type: "column", stage: stageId },
  });

  const columnLeads = useMemo(() => {
    const sorted = [...leads].sort((a, b) => a.position - b.position);
    if (!visibleIds) return sorted;
    return sorted.filter((l) => visibleIds.has(l.id));
  }, [leads, visibleIds]);

  const columnValue = columnLeads.reduce((s, l) => s + (l.value ?? 0), 0);

  return (
    <div className="w-[min(300px,88vw)] shrink-0 snap-center sm:min-w-[272px] sm:w-[272px]">
      <header
        className="rounded-t-xl px-3.5 py-3 shadow-sm"
        style={{ backgroundColor: color, color: headerText }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold tracking-tight">{label}</span>
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums"
            style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
          >
            {columnLeads.length}
          </span>
        </div>
        {columnValue > 0 && (
          <p className="text-[10px] mt-1 opacity-85 tabular-nums">
            {formatCurrency(columnValue)}
          </p>
        )}
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[calc(100vh-280px)] max-h-[calc(100vh-280px)] overflow-y-auto rounded-b-xl border border-t-0 border-[#E8DFD0]/80 p-2 transition-colors scrollbar-thin",
          isOver ? "bg-[#F0E8DC] ring-1 ring-[#6B4F3A]/15" : "bg-[#F7F3EE]/60"
        )}
      >
        <SortableContext
          items={columnLeads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {columnLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
          ))}
        </SortableContext>
        {columnLeads.length === 0 && (
          <p className="py-16 text-center text-[11px] text-[#6B4F3A]/40">
            Solte leads aqui
          </p>
        )}
      </div>
    </div>
  );
}

export function CrmKanban({
  leads,
  visibleIds,
  onLeadsChange,
  onSelectLead,
}: {
  leads: LeadWithRelations[];
  visibleIds?: Set<string> | null;
  onLeadsChange: (leads: LeadWithRelations[]) => void;
  onSelectLead: (leadId: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const leadsByStage = useMemo(() => {
    const map = {} as Record<LeadStage, LeadWithRelations[]>;
    for (const s of CRM_STAGES) {
      map[s.id] = leads.filter((l) => l.stage === s.id);
    }
    return map;
  }, [leads]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead) return;

    const overId = over.id as string;
    const overData = over.data.current;

    let targetStage: LeadStage = activeLead.stage;
    if (overData?.type === "column") {
      targetStage = overData.stage as LeadStage;
    } else if (CRM_STAGES.some((s) => s.id === overId)) {
      targetStage = overId as LeadStage;
    } else {
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) targetStage = overLead.stage;
    }

    const overLead = leads.find((l) => l.id === overId);
    const sameStageReorder =
      activeLead.stage === targetStage &&
      overLead &&
      overLead.id !== leadId;

    if (sameStageReorder) {
      const currentInStage = leads
        .filter((l) => l.stage === targetStage)
        .sort((a, b) => a.position - b.position);
      const oldIndex = currentInStage.findIndex((l) => l.id === leadId);
      const newIndex = currentInStage.findIndex((l) => l.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(currentInStage, oldIndex, newIndex);
      const orderedIds = reordered.map((l) => l.id);

      onLeadsChange(
        leads.map((l) => {
          if (l.stage !== targetStage) return l;
          const idx = orderedIds.indexOf(l.id);
          return idx >= 0 ? { ...l, position: idx } : l;
        })
      );

      await reorderLeadsAction(targetStage, orderedIds);
      return;
    }

    let newPosition = leads.filter(
      (l) => l.stage === targetStage && l.id !== leadId
    ).length;

    if (overLead && overLead.stage === targetStage) {
      const stageLeads = leads
        .filter((l) => l.stage === targetStage && l.id !== leadId)
        .sort((a, b) => a.position - b.position);
      const idx = stageLeads.findIndex((l) => l.id === overId);
      newPosition = idx >= 0 ? idx : stageLeads.length;
    }

    if (activeLead.stage === targetStage && activeLead.position === newPosition) {
      return;
    }

    const snapshot = leads;
    onLeadsChange(
      leads.map((l) =>
        l.id === leadId
          ? { ...l, stage: targetStage, position: newPosition }
          : l
      )
    );

    const r = await updateLeadStageAction(leadId, targetStage, newPosition);
    if ("error" in r && r.error) {
      toast.error(r.error);
      onLeadsChange(snapshot);
    }
  }

  const activeLead = leads.find((l) => l.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin -mx-1 px-1">
        {CRM_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stageId={stage.id}
            label={stage.label}
            color={stage.color}
            headerText={stage.headerText}
            leads={leadsByStage[stage.id] ?? []}
            visibleIds={visibleIds ?? null}
            onSelectLead={onSelectLead}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2,0,0,1)" }}>
        {activeLead ? (
          <article
            className={cn(
              "w-[260px] rotate-[1.5deg] rounded-xl border border-[#E8DFD0] bg-white p-4 shadow-xl",
              PRIORITY_CONFIG[activeLead.priority].border,
              "border-l-[3px]"
            )}
          >
            <p className="font-medium text-sm">{activeLead.name}</p>
            {activeLead.interest && (
              <p className="text-xs text-[#6B4F3A]/70 mt-1">{activeLead.interest}</p>
            )}
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
