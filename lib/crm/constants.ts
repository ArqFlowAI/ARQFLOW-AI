import type { LeadPriority, LeadStage } from "@prisma/client";

export const CRM_STAGES = [
  { id: "NOVO_LEAD" as const, label: "Novo Lead", color: "#D6C2A1", headerText: "#1E1E1E" },
  { id: "CONTATO" as const, label: "Contato", color: "#C4A882", headerText: "#1E1E1E" },
  { id: "ORCAMENTO" as const, label: "Orçamento Enviado", color: "#A67C52", headerText: "#F7F3EE" },
  { id: "REUNIAO" as const, label: "Reunião", color: "#8B6548", headerText: "#F7F3EE" },
  { id: "FECHADO" as const, label: "Fechado", color: "#3D3229", headerText: "#F7F3EE" },
  { id: "PERDIDO" as const, label: "Perdido", color: "#9CA3AF", headerText: "#1E1E1E" },
] as const;

export const STAGE_LABELS: Record<LeadStage, string> = Object.fromEntries(
  CRM_STAGES.map((s) => [s.id, s.label])
) as Record<LeadStage, string>;

export const PRIORITY_CONFIG: Record<
  LeadPriority,
  { label: string; color: string; border: string; badge: string }
> = {
  LOW: {
    label: "Baixa",
    color: "#94a3b8",
    border: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  MEDIUM: {
    label: "Média",
    color: "#d97706",
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  },
  HIGH: {
    label: "Alta",
    color: "#ea580c",
    border: "border-l-orange-500",
    badge: "bg-orange-50 text-orange-900 ring-1 ring-orange-200/80",
  },
  URGENT: {
    label: "Urgente",
    color: "#dc2626",
    border: "border-l-red-500",
    badge: "bg-red-50 text-red-900 ring-1 ring-red-200/80",
  },
};

export const SUGGESTED_TAGS = [
  "Quente",
  "Frio",
  "Indicação",
  "Instagram",
  "Google",
  "Retorno",
  "VIP",
  "Orçamento enviado",
] as const;

export const INTEREST_OPTIONS = [
  "Residencial",
  "Design de interiores",
  "Marcenaria",
  "Comercial",
  "Reforma",
  "Obra nova",
  "Consultoria",
  "Outro",
] as const;

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  created: "Lead criado",
  stage_changed: "Etapa alterada",
  priority_changed: "Prioridade alterada",
  interest_changed: "Interesse atualizado",
  tags_updated: "Tags atualizadas",
  notes_updated: "Notas atualizadas",
  note_added: "Nota adicionada",
  position_changed: "Posição no Kanban",
  updated: "Lead atualizado",
};

export const ACTIVE_PIPELINE_STAGES: LeadStage[] = [
  "NOVO_LEAD",
  "CONTATO",
  "ORCAMENTO",
  "REUNIAO",
];
