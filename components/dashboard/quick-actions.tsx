"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Image,
  FileText,
  Users,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

const actions = [
  {
    title: "Conceito IA",
    description: "Paleta, materiais e storytelling",
    href: "/dashboard/conceitos",
    icon: Lightbulb,
  },
  {
    title: "Render IA",
    description: "Imagem fotorealista do ambiente",
    href: "/dashboard/renders",
    icon: Image,
  },
  {
    title: "Orçamento",
    description: "Proposta com PDF automático",
    href: "/dashboard/orcamentos",
    icon: FileText,
  },
  {
    title: "Novo lead",
    description: "Adicionar ao pipeline CRM",
    href: "/crm",
    icon: Users,
  },
  {
    title: "WhatsApp",
    description: "Disparar automação",
    href: "/whatsapp",
    icon: MessageCircle,
  },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <h3 className="font-display text-lg font-semibold">Ações rápidas</h3>
      <p className="text-xs text-brand-dark/60 mt-1">Comece em um clique</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={action.href}
              className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition-all hover:border-brand-beige/50 hover:bg-brand-beige/20 dark:hover:bg-brand-dark/30"
            >
              <div className="rounded-lg bg-brand-dark p-2.5 text-brand-bg transition-transform group-hover:scale-105">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="truncate text-xs text-brand-dark/50">
                  {action.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-brand-dark/30 group-hover:text-brand-dark" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
