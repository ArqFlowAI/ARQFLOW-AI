"use client";

import { useState, useTransition, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  Building2,
  Trash2,
  History,
  StickyNote,
  User,
} from "lucide-react";
import {
  getLeadDetailAction,
  updateLeadAction,
  updateLeadStageAction,
  deleteLeadAction,
  addLeadNoteAction,
} from "@/actions/lead.actions";
import { crmStages } from "@/config/site";
import { SUGGESTED_TAGS } from "@/lib/crm/constants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadWithRelations } from "@/types";
import type { LeadDetail } from "@/types/crm";
import type { LeadPriority, LeadStage } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LeadTagsInput } from "@/modules/crm/lead-tags-input";
import {
  LeadPrioritySelect,
  PriorityBadge,
} from "@/modules/crm/lead-priority-select";
import { LeadHistoryTimeline } from "@/modules/crm/lead-history-timeline";

type Tab = "detalhes" | "historico" | "notas";

export function LeadDetailPanel({
  leadId,
  onClose,
  onLeadUpdated,
}: {
  leadId: string | null;
  onClose: () => void;
  onLeadUpdated?: (lead: LeadWithRelations) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("detalhes");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<LeadPriority>("MEDIUM");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!leadId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    setTab("detalhes");
    getLeadDetailAction(leadId).then((r) => {
      if (r.success && r.data) {
        const d = r.data as LeadDetail;
        setDetail(d);
        setNotes(d.notes ?? "");
        setTags(d.tags);
        setPriority(d.priority);
      } else {
        toast.error(r.error ?? "Erro ao carregar lead");
        onClose();
      }
      setLoading(false);
    });
  }, [leadId, onClose]);

  if (!leadId) return null;

  const stageInfo = detail
    ? crmStages.find((s) => s.id === detail.stage)
    : null;

  function refreshDetail() {
    if (!leadId) return;
    getLeadDetailAction(leadId).then((r) => {
      if (r.success && r.data) {
        const d = r.data as LeadDetail;
        setDetail(d);
        onLeadUpdated?.(d);
      }
    });
    router.refresh();
  }

  function changeStage(stage: LeadStage) {
    if (!detail) return;
    startTransition(async () => {
      const r = await updateLeadStageAction(detail.id, stage, 0);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Etapa atualizada");
        refreshDetail();
      }
    });
  }

  function savePriority(p: LeadPriority) {
    setPriority(p);
    startTransition(async () => {
      const r = await updateLeadAction(detail!.id, { priority: p });
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Prioridade atualizada");
        refreshDetail();
      }
    });
  }

  function saveTags(newTags: string[]) {
    setTags(newTags);
    startTransition(async () => {
      const r = await updateLeadAction(detail!.id, { tags: newTags });
      if ("error" in r && r.error) toast.error(r.error);
      else refreshDetail();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      const r = await updateLeadAction(detail!.id, { notes });
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Notas salvas");
        refreshDetail();
      }
    });
  }

  function submitNote() {
    if (!newNote.trim()) return;
    startTransition(async () => {
      const r = await addLeadNoteAction(detail!.id, newNote);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Nota adicionada");
        setNewNote("");
        setTab("historico");
        refreshDetail();
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir este lead permanentemente?")) return;
    startTransition(async () => {
      await deleteLeadAction(detail!.id);
      toast.success("Lead removido");
      onClose();
      router.refresh();
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-brand-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-brand-light/20 bg-white shadow-2xl dark:bg-brand-black",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {loading || !detail ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
          </div>
        ) : (
          <>
            <div
              className="flex items-center justify-between px-5 py-4 text-brand-bg"
              style={{ backgroundColor: stageInfo?.color ?? "#6B4F3A" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={detail.priority} />
                  <p className="text-xs opacity-80">{stageInfo?.label}</p>
                </div>
                <h2 className="truncate font-display text-xl font-bold mt-1">
                  {detail.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-black/10 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-brand-light/15">
              {(
                [
                  { id: "detalhes" as Tab, label: "Detalhes", icon: User },
                  { id: "historico" as Tab, label: "Histórico", icon: History },
                  { id: "notas" as Tab, label: "Notas", icon: StickyNote },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors",
                    tab === t.id
                      ? "border-b-2 border-brand-dark text-brand-dark"
                      : "text-brand-dark/50 hover:text-brand-dark"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                  {t.id === "historico" && detail._count.history > 0 && (
                    <span className="rounded-full bg-brand-beige px-1.5 text-[10px]">
                      {detail._count.history}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "detalhes" && (
                <div className="space-y-6">
                  {detail.value != null && detail.value > 0 && (
                    <div className="rounded-xl bg-brand-beige/30 p-4">
                      <p className="text-xs text-brand-dark/50">Valor estimado</p>
                      <p className="font-display text-2xl font-bold">
                        {formatCurrency(detail.value)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {detail.email && (
                      <a
                        href={`mailto:${detail.email}`}
                        className="flex items-center gap-3 text-sm hover:underline"
                      >
                        <Mail className="h-4 w-4 text-brand-dark/50" />
                        {detail.email}
                      </a>
                    )}
                    {detail.phone && (
                      <a
                        href={`tel:${detail.phone}`}
                        className="flex items-center gap-3 text-sm hover:underline"
                      >
                        <Phone className="h-4 w-4 text-brand-dark/50" />
                        {detail.phone}
                      </a>
                    )}
                    {detail.company && (
                      <p className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-brand-dark/50" />
                        {detail.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                      Prioridade
                    </p>
                    <LeadPrioritySelect
                      value={priority}
                      onChange={savePriority}
                      disabled={pending}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                      Tags
                    </p>
                    <LeadTagsInput
                      tags={tags}
                      onChange={saveTags}
                      suggestions={[...SUGGESTED_TAGS]}
                      disabled={pending}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                      Mover para etapa
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {crmStages.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          disabled={pending || detail.stage === s.id}
                          onClick={() => changeStage(s.id as LeadStage)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium",
                            detail.stage === s.id && "ring-2 ring-brand-dark ring-offset-2"
                          )}
                          style={{
                            backgroundColor: s.color,
                            color: s.id === "FECHADO" ? "#F7F3EE" : "#1E1E1E",
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-dark/40">
                      Notas internas
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-brand-light/20 bg-brand-bg/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:bg-brand-black/30"
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={pending}
                      onClick={saveNotes}
                    >
                      Salvar notas
                    </Button>
                  </div>
                </div>
              )}

              {tab === "historico" && (
                <LeadHistoryTimeline history={detail.history} />
              )}

              {tab === "notas" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      placeholder="Adicionar nota à timeline..."
                      className="flex-1 rounded-xl border border-brand-light/20 p-3 text-sm"
                    />
                    <Button
                      disabled={pending || !newNote.trim()}
                      onClick={submitNote}
                      className="shrink-0 self-end"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="divide-y divide-brand-light/15">
                    {detail.leadNotes.length === 0 ? (
                      <p className="py-6 text-center text-sm text-brand-dark/50">
                        Nenhuma nota ainda
                      </p>
                    ) : (
                      detail.leadNotes.map((n) => (
                        <div key={n.id} className="py-3">
                          <p className="text-sm">{n.content}</p>
                          <p className="text-[10px] text-brand-dark/40 mt-1">
                            {n.user.name ?? "Usuário"} ·{" "}
                            {new Date(n.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-brand-light/15 p-4">
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50"
                disabled={pending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Excluir lead
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
