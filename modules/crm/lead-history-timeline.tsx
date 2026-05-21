"use client";

import { formatDate } from "@/lib/utils";
import {
  HISTORY_ACTION_LABELS,
  STAGE_LABELS,
  PRIORITY_CONFIG,
} from "@/lib/crm/constants";
import type { LeadHistory, LeadStage, User } from "@prisma/client";
import {
  ArrowRight,
  Tag,
  Flag,
  FileText,
  Plus,
  GripVertical,
  History,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HistoryEntry = LeadHistory & {
  user: Pick<User, "id" | "name"> | null;
};

function HistoryIcon({ action }: { action: string }) {
  const cls = "h-3.5 w-3.5";
  switch (action) {
    case "stage_changed":
      return <ArrowRight className={cls} />;
    case "priority_changed":
      return <Flag className={cls} />;
    case "interest_changed":
      return <Target className={cls} />;
    case "tags_updated":
      return <Tag className={cls} />;
    case "notes_updated":
    case "note_added":
      return <FileText className={cls} />;
    case "position_changed":
      return <GripVertical className={cls} />;
    case "created":
      return <Plus className={cls} />;
    default:
      return <History className={cls} />;
  }
}

function describeEntry(entry: HistoryEntry): string {
  const meta = entry.metadata as Record<string, unknown> | null;

  if (entry.action === "stage_changed" && entry.fromStage && entry.toStage) {
    return `${STAGE_LABELS[entry.fromStage as LeadStage]} → ${STAGE_LABELS[entry.toStage as LeadStage]}`;
  }

  if (entry.action === "interest_changed" && meta) {
    return `${meta.from ?? "—"} → ${meta.to ?? "—"}`;
  }

  if (entry.action === "priority_changed" && meta) {
    const from = meta.from as keyof typeof PRIORITY_CONFIG;
    const to = meta.to as keyof typeof PRIORITY_CONFIG;
    return `${PRIORITY_CONFIG[from]?.label ?? from} → ${PRIORITY_CONFIG[to]?.label ?? to}`;
  }

  if (entry.action === "tags_updated" && meta) {
    const to = (meta.to as string[])?.join(", ");
    return to ? `Tags: ${to}` : "Tags removidas";
  }

  if (entry.action === "note_added" && meta?.preview) {
    return `"${meta.preview as string}"`;
  }

  if (entry.action === "position_changed") {
    return "Reordenado no Kanban";
  }

  if (entry.action === "created" && meta?.name) {
    return `Lead "${meta.name as string}" adicionado`;
  }

  return HISTORY_ACTION_LABELS[entry.action] ?? entry.action;
}

export function LeadHistoryTimeline({
  history,
  loading,
}: {
  history: HistoryEntry[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-brand-beige/30" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-brand-dark/50">
        Nenhum histórico ainda
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-brand-light/30" />
      {history.map((entry, i) => (
        <div key={entry.id} className="relative flex gap-3 pb-4">
          <div
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-light/30 bg-white dark:bg-brand-black",
              i === 0 && "ring-2 ring-brand-beige"
            )}
          >
            <HistoryIcon action={entry.action} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {HISTORY_ACTION_LABELS[entry.action] ?? entry.action}
            </p>
            <p className="text-xs text-brand-dark/60 mt-0.5">
              {describeEntry(entry)}
            </p>
            <p className="text-[10px] text-brand-dark/40 mt-1">
              {entry.user?.name ?? "Sistema"} · {formatDate(entry.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
