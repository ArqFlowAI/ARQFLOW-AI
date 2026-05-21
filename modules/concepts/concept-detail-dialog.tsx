"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { ConceptResult } from "@/modules/concepts/concept-result";
import { deleteConceptAction } from "@/actions/concept.actions";
import type { ConceptContent } from "@/types";
import type { Concept } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ConceptWithUser = Concept & {
  user: { name: string | null };
  project?: { id: string; name: string } | null;
};

export function ConceptDetailDialog({
  concept,
  onClose,
}: {
  concept: ConceptWithUser | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!concept) return null;

  const content = concept.content as ConceptContent;

  async function handleDelete() {
    if (!confirm("Excluir este conceito?")) return;
    setDeleting(true);
    const r = await deleteConceptAction(concept!.id);
    if ("error" in r && r.error) toast.error(r.error);
    else {
      toast.success("Conceito removido");
      onClose();
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-brand-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-brand-black",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-light/15 px-6 py-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-1">
              <Badge>{concept.environment}</Badge>
              <Badge variant="secondary">{concept.style}</Badge>
            </div>
            <p className="text-xs text-brand-dark/50">
              {concept.user.name ?? "Equipe"} · {formatDate(concept.createdAt)}
              {concept.area ? ` · ${concept.area} m²` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-brand-beige/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ConceptResult content={content} />
        </div>

        <div className="border-t border-brand-light/15 p-4">
          <Button
            variant="outline"
            className="w-full text-red-600"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Excluir conceito
          </Button>
        </div>
      </div>
    </>
  );
}
