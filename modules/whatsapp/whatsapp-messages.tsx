"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MESSAGE_STATUS_LABELS } from "@/lib/whatsapp/constants";
import type { WhatsAppMessageDto } from "@/types/whatsapp";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  string,
  "default" | "secondary" | "success" | "warning"
> = {
  PENDING: "secondary",
  SENT: "default",
  DELIVERED: "success",
  READ: "success",
  ERROR: "warning",
};

export function WhatsAppMessages({
  messages,
}: {
  messages: WhatsAppMessageDto[];
}) {
  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 dark:bg-brand-black/30">
      <div className="border-b border-brand-light/15 px-6 py-4">
        <h3 className="font-display text-lg font-semibold">
          Mensagens recentes
        </h3>
        <p className="text-xs text-brand-dark/50 mt-0.5">
          Histórico salvo no Supabase por organização
        </p>
      </div>
      <div className="max-h-[420px] overflow-y-auto divide-y divide-brand-light/10">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-brand-dark/50">
            Nenhuma mensagem ainda. Envie a primeira pelo composer.
          </p>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="px-6 py-4 hover:bg-brand-beige/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        msg.direction === "OUTBOUND"
                          ? "text-brand-dark"
                          : "text-emerald-700"
                      )}
                    >
                      {msg.direction === "OUTBOUND" ? "Enviada" : "Recebida"}
                    </span>
                    {msg.leadName && (
                      <span className="text-xs text-brand-dark/50">
                        · {msg.leadName}
                      </span>
                    )}
                    {msg.automationName && (
                      <span className="text-xs text-brand-light">
                        · {msg.automationName}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm line-clamp-2">{msg.content}</p>
                  <p className="mt-1 text-[10px] text-brand-dark/40 font-mono">
                    {msg.phone ?? "—"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant={statusVariant[msg.status] ?? "secondary"}>
                    {MESSAGE_STATUS_LABELS[msg.status] ?? msg.status}
                  </Badge>
                  <p className="mt-1 text-[10px] text-brand-dark/40">
                    {formatDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
