"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getLeadDetailAction,
  addLeadNoteAction,
  deleteLeadAction,
  updateLeadStageAction,
} from "@/actions/lead.actions";
import { LeadHistoryTimeline } from "@/modules/crm/lead-history-timeline";
import { LeadFormDialog } from "@/modules/crm/lead-form-dialog";
import { CRM_STAGES } from "@/lib/crm/constants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/modules/crm/lead-priority-select";
import type { LeadDetail } from "@/types/crm";
import type { LeadStage } from "@prisma/client";
import {
  X,
  Mail,
  Phone,
  Building2,
  Target,
  Trash2,
  Pencil,
  MessageSquarePlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LeadDetailDrawer({
  leadId,
  onClose,
  onEdit,
}: {
  leadId: string | null;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"notas" | "historico">("notas");
  const [newNote, setNewNote] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function load() {
    if (!leadId) return;
    setLoading(true);
    getLeadDetailAction(leadId).then((r) => {
      if (r.success && r.data) setDetail(r.data as LeadDetail);
      else {
        toast.error(r.error ?? "Erro ao carregar");
        onClose();
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    if (leadId) {
      setTab("notas");
      load();
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (!leadId) return null;

  const stageInfo = detail
    ? CRM_STAGES.find((s) => s.id === detail.stage)
    : null;

  function changeStage(stage: LeadStage) {
    if (!detail) return;
    startTransition(async () => {
      const r = await updateLeadStageAction(detail.id, stage, 0);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Etapa atualizada");
        load();
        router.refresh();
      }
    });
  }

  function submitNote() {
    if (!detail || !newNote.trim()) return;
    startTransition(async () => {
      const r = await addLeadNoteAction(detail.id, newNote);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Nota adicionada");
        setNewNote("");
        setTab("historico");
        load();
      }
    });
  }

  function handleDelete() {
    if (!detail || !confirm("Excluir este lead permanentemente?")) return;
    startTransition(async () => {
      await deleteLeadAction(detail.id);
      toast.success("Lead removido");
      onClose();
      router.refresh();
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#1E1E1E]/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#FAF8F5] shadow-2xl dark:bg-[#141210] animate-in slide-in-from-right duration-200">
        {loading || !detail ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B4F3A]" />
          </div>
        ) : (
          <>
            <div
              className="px-5 py-5 border-b border-[#E8DFD0]"
              style={{
                backgroundColor: stageInfo?.color ?? "#D6C2A1",
                color: stageInfo?.headerText ?? "#1E1E1E",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                    {stageInfo?.label}
                  </p>
                  <h2 className="font-display text-xl font-semibold truncate mt-0.5">
                    {detail.name}
                  </h2>
                  <div className="mt-2">
                    <PriorityBadge priority={detail.priority} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 hover:bg-black/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5 border-b border-[#E8DFD0]/80">
                {detail.value != null && detail.value > 0 && (
                  <div className="rounded-xl bg-white/80 p-4 ring-1 ring-[#E8DFD0] dark:bg-[#1E1E1E]/50">
                    <p className="text-[10px] uppercase tracking-wider text-[#6B4F3A]/70">
                      Valor estimado
                    </p>
                    <p className="font-display text-2xl font-semibold text-[#1E1E1E] dark:text-[#F7F3EE]">
                      {formatCurrency(detail.value)}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 text-sm">
                  {detail.phone && (
                    <a
                      href={`tel:${detail.phone}`}
                      className="flex items-center gap-2.5 text-[#3D3229] hover:underline"
                    >
                      <Phone className="h-4 w-4 opacity-50" />
                      {detail.phone}
                    </a>
                  )}
                  {detail.email && (
                    <a
                      href={`mailto:${detail.email}`}
                      className="flex items-center gap-2.5 text-[#3D3229] hover:underline"
                    >
                      <Mail className="h-4 w-4 opacity-50" />
                      {detail.email}
                    </a>
                  )}
                  {detail.interest && (
                    <p className="flex items-center gap-2.5 text-[#3D3229]">
                      <Target className="h-4 w-4 opacity-50" />
                      {detail.interest}
                    </p>
                  )}
                  {detail.company && (
                    <p className="flex items-center gap-2.5 text-[#3D3229]">
                      <Building2 className="h-4 w-4 opacity-50" />
                      {detail.company}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B4F3A]/60 mb-2">
                    Mover etapa
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CRM_STAGES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={pending || detail.stage === s.id}
                        onClick={() => changeStage(s.id)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[10px] font-medium transition-opacity",
                          detail.stage === s.id && "ring-2 ring-[#1E1E1E] ring-offset-1"
                        )}
                        style={{
                          backgroundColor: s.color,
                          color: s.headerText,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex border-b border-[#E8DFD0]/80">
                {(["notas", "historico"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 py-3 text-xs font-medium transition-colors",
                      tab === t
                        ? "border-b-2 border-[#3D3229] text-[#1E1E1E]"
                        : "text-[#6B4F3A]/50"
                    )}
                  >
                    {t === "notas" ? "Notas" : "Histórico"}
                    {t === "historico" && detail._count.history > 0 && (
                      <span className="ml-1 opacity-60">
                        ({detail._count.history})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "notas" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={2}
                        placeholder="Nova nota interna..."
                        className="flex-1 rounded-xl border border-[#E8DFD0] bg-white px-3 py-2 text-sm"
                      />
                      <Button
                        size="sm"
                        disabled={pending || !newNote.trim()}
                        onClick={submitNote}
                        className="shrink-0 self-end bg-[#3D3229] hover:bg-[#1E1E1E]"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {detail.leadNotes.length === 0 ? (
                        <p className="text-center text-sm text-[#6B4F3A]/50 py-6">
                          Nenhuma nota ainda
                        </p>
                      ) : (
                        detail.leadNotes.map((n) => (
                          <div
                            key={n.id}
                            className="rounded-xl bg-white p-3 ring-1 ring-[#E8DFD0]/80"
                          >
                            <p className="text-sm text-[#3D3229]">{n.content}</p>
                            <p className="mt-1.5 text-[10px] text-[#6B4F3A]/50">
                              {n.user.name} ·{" "}
                              {new Date(n.createdAt).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {detail.notes && (
                      <div className="rounded-xl bg-[#F5F0E8] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#6B4F3A]/60 mb-1">
                          Resumo interno
                        </p>
                        <p className="text-sm text-[#3D3229] whitespace-pre-line">
                          {detail.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {tab === "historico" && (
                  <LeadHistoryTimeline history={detail.history} />
                )}
              </div>
            </div>

            <div className="border-t border-[#E8DFD0] p-4 flex gap-2 bg-white/50">
              <Button
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => {
                  setEditOpen(true);
                  onEdit?.();
                }}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                disabled={pending}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </aside>

      <LeadFormDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) load();
        }}
        lead={detail}
      />
    </>
  );
}
