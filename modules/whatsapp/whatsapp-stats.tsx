"use client";

import { motion } from "framer-motion";
import type { WhatsAppDashboardStats } from "@/types/whatsapp";

const cards: {
  key: keyof WhatsAppDashboardStats;
  label: string;
  suffix?: string;
}[] = [
  { key: "totalMessages", label: "Mensagens" },
  { key: "responseRate", label: "Taxa de resposta", suffix: "%" },
  { key: "conversionRate", label: "Conversão", suffix: "%" },
  { key: "activeLeads", label: "Leads ativos" },
  { key: "deliveredCount", label: "Entregues" },
  { key: "readCount", label: "Lidas" },
  { key: "errorCount", label: "Erros" },
  { key: "activeAutomations", label: "Automações ativas" },
];

export function WhatsAppStats({ stats }: { stats: WhatsAppDashboardStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04 }}
          className="rounded-2xl border border-brand-light/20 bg-gradient-to-br from-brand-beige/40 via-white/70 to-brand-light/10 p-5 shadow-sm dark:from-brand-dark/30 dark:via-brand-black/40 dark:to-brand-black/20"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-dark/55">
            {card.label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-brand-black dark:text-brand-bg">
            {stats[card.key]}
            {card.suffix ?? ""}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
