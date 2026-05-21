"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  MessageCircle,
  Heart,
  CreditCard,
  Calendar,
  Bot,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  toggleAutomationAction,
  updateAutomationTemplateAction,
} from "@/actions/whatsapp.actions";
import type { WhatsAppAutomationDto } from "@/types/whatsapp";

const iconMap: Record<string, LucideIcon> = {
  "refresh-cw": RefreshCw,
  "message-circle": MessageCircle,
  heart: Heart,
  "credit-card": CreditCard,
  calendar: Calendar,
  bot: Bot,
  "git-branch": GitBranch,
};

export function WhatsAppAutomations({
  automations: initial,
}: {
  automations: WhatsAppAutomationDto[];
}) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function toggle(id: string, active: boolean) {
    const status = active ? "ACTIVE" : "PAUSED";
    startTransition(async () => {
      const res = await toggleAutomationAction(id, status);
      if (res.success) {
        setItems((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        toast.success(active ? "Automação ativada" : "Automação pausada");
      }
    });
  }

  function saveTemplate(id: string) {
    startTransition(async () => {
      const res = await updateAutomationTemplateAction(id, draft);
      if (res.error) toast.error(res.error);
      else {
        setItems((prev) =>
          prev.map((a) => (a.id === id ? { ...a, template: draft } : a))
        );
        setEditingId(null);
        toast.success("Template salvo");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Automações</h2>
        <p className="text-sm text-brand-dark/60 mt-0.5">
          Recuperação, follow-up, pós-venda, cobrança, agendamento e funil
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((flow, i) => {
          const Icon = iconMap[flow.icon] ?? MessageCircle;
          const isActive = flow.status === "ACTIVE";

          return (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-brand-light/20 bg-white/60 transition-shadow hover:shadow-md dark:bg-brand-black/30">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <div className="rounded-xl bg-gradient-to-br from-brand-beige/60 to-brand-light/30 p-3">
                    <Icon className="h-5 w-5 text-brand-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-display text-base leading-tight">
                        {flow.name}
                      </CardTitle>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(v) => toggle(flow.id, v)}
                        disabled={pending}
                      />
                    </div>
                    <p className="text-sm text-brand-dark/65 mt-1 line-clamp-2">
                      {flow.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={isActive ? "success" : "secondary"}>
                        {isActive ? "Ativa" : flow.status === "PAUSED" ? "Pausada" : "Rascunho"}
                      </Badge>
                      <span className="text-[10px] font-mono text-brand-dark/40">
                        {flow.runsCount} execuções
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editingId === flow.id ? (
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-brand-light/30 bg-white/80 px-3 py-2 text-xs"
                    />
                  ) : (
                    <p className="text-xs text-brand-dark/55 bg-brand-beige/15 rounded-lg px-3 py-2 line-clamp-3 font-mono">
                      {flow.template}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {editingId === flow.id ? (
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={pending}
                          onClick={() => saveTemplate(flow.id)}
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setEditingId(flow.id);
                          setDraft(flow.template);
                        }}
                      >
                        Editar mensagem
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
