"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveLeadAction } from "@/actions/lead.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INTEREST_OPTIONS } from "@/lib/crm/constants";
import type { LeadDetail } from "@/types/crm";
import type { LeadWithRelations } from "@/types";
import type { LeadPriority } from "@prisma/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type LeadFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadWithRelations | LeadDetail | null;
};

export function LeadFormDialog({ open, onOpenChange, lead }: LeadFormDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!lead;

  useEffect(() => {
    if (!open) return;
  }, [open, lead]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const r = await saveLeadAction({
        id: lead?.id,
        name: fd.get("name") as string,
        email: (fd.get("email") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        company: (fd.get("company") as string) || undefined,
        interest: (fd.get("interest") as string) || undefined,
        value: fd.get("value") ? Number(fd.get("value")) : undefined,
        priority: (fd.get("priority") as LeadPriority) || "MEDIUM",
        notes: (fd.get("notes") as string) || undefined,
      });

      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success(isEdit ? "Lead atualizado" : "Lead criado");
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-[#E8DFD0] bg-[#FAF8F5]">
        <DialogHeader>
          <DialogTitle className="font-display text-[#1E1E1E]">
            {isEdit ? "Editar lead" : "Novo lead"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="lead-name" className="text-[#3D3229]">Nome *</Label>
            <Input
              id="lead-name"
              name="name"
              required
              defaultValue={lead?.name}
              className="mt-1 border-[#E8DFD0] bg-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lead-phone">Telefone</Label>
              <Input
                id="lead-phone"
                name="phone"
                type="tel"
                defaultValue={lead?.phone ?? ""}
                placeholder="(11) 99999-9999"
                className="mt-1 border-brand-light/25"
              />
            </div>
            <div>
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                name="email"
                type="email"
                defaultValue={lead?.email ?? ""}
                className="mt-1 border-brand-light/25"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lead-interest">Interesse</Label>
            <select
              id="lead-interest"
              name="interest"
              defaultValue={lead?.interest ?? ""}
              className="mt-1 flex h-11 w-full rounded-lg border border-brand-light/25 bg-white/80 px-3 text-sm dark:bg-brand-black/40"
            >
              <option value="">Selecione</option>
              {INTEREST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lead-company">Empresa</Label>
              <Input
                id="lead-company"
                name="company"
                defaultValue={lead?.company ?? ""}
                className="mt-1 border-brand-light/25"
              />
            </div>
            <div>
              <Label htmlFor="lead-value">Valor estimado (R$)</Label>
              <Input
                id="lead-value"
                name="value"
                type="number"
                min={0}
                step={100}
                defaultValue={lead?.value ?? ""}
                className="mt-1 border-brand-light/25"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lead-priority">Prioridade</Label>
            <select
              id="lead-priority"
              name="priority"
              defaultValue={lead?.priority ?? "MEDIUM"}
              className="mt-1 flex h-11 w-full rounded-lg border border-brand-light/25 bg-white/80 px-3 text-sm"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div>
            <Label htmlFor="lead-notes">Notas internas</Label>
            <textarea
              id="lead-notes"
              name="notes"
              rows={3}
              defaultValue={lead?.notes ?? ""}
              className="mt-1 w-full rounded-lg border border-brand-light/25 bg-white/80 px-3 py-2 text-sm dark:bg-brand-black/40"
              placeholder="Contexto da negociação..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[#3D3229] hover:bg-[#1E1E1E] text-[#F7F3EE]"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Salvar alterações"
              ) : (
                "Criar lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
