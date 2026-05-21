export const BUDGET_CREDIT_COST = 1;

export const PROJECT_TYPES = [
  {
    id: "residencial_novo",
    label: "Residencial — obra nova",
    basePerSqm: 195,
    description: "Casa ou apartamento em construção do zero",
  },
  {
    id: "residencial_reforma",
    label: "Residencial — reforma",
    basePerSqm: 165,
    description: "Renovação, ampliação ou retrofit",
  },
  {
    id: "interiores",
    label: "Design de interiores",
    basePerSqm: 145,
    description: "Projeto de ambientes e especificação",
  },
  {
    id: "comercial",
    label: "Comercial / loja",
    basePerSqm: 220,
    description: "Varejo, showroom, clínica, restaurante",
  },
  {
    id: "escritorio",
    label: "Escritório corporativo",
    basePerSqm: 185,
    description: "Workspaces, salas, recepção",
  },
  {
    id: "marcenaria",
    label: "Marcenaria planejada",
    basePerSqm: 125,
    description: "Móveis sob medida e painéis",
  },
] as const;

export const DESIGN_STYLES = [
  { id: "minimalista", label: "Minimalista", multiplier: 0.95 },
  { id: "contemporaneo", label: "Contemporâneo", multiplier: 1 },
  { id: "classico", label: "Clássico", multiplier: 1.08 },
  { id: "industrial", label: "Industrial", multiplier: 1.02 },
  { id: "escandinavo", label: "Escandinavo", multiplier: 1.05 },
  { id: "luxo", label: "Alto padrão / Luxo", multiplier: 1.22 },
] as const;

export const FINISH_LEVELS = [
  {
    id: "economico",
    label: "Econômico",
    multiplier: 0.82,
    description: "Materiais entry-level, soluções funcionais",
  },
  {
    id: "padrao",
    label: "Padrão",
    multiplier: 1,
    description: "Equilíbrio custo-benefício",
  },
  {
    id: "premium",
    label: "Premium",
    multiplier: 1.32,
    description: "Acabamentos superiores e marcenaria refinada",
  },
  {
    id: "luxo",
    label: "Luxo",
    multiplier: 1.68,
    description: "Materiais importados, detalhamento exclusivo",
  },
] as const;

export const LINE_ITEM_SPLITS = [
  { key: "briefing", label: "Briefing, levantamento e estudo preliminar", pct: 0.08 },
  { key: "arch", label: "Projeto arquitetônico / layout executivo", pct: 0.3 },
  { key: "interior", label: "Projeto de interiores e especificação", pct: 0.26 },
  { key: "carpentry", label: "Projeto de marcenaria sob medida", pct: 0.2 },
  { key: "management", label: "Acompanhamento de obra e compatibilização", pct: 0.1 },
  { key: "presentation", label: "Apresentação, renders conceituais e entregáveis", pct: 0.06 },
] as const;

export type ProjectTypeId = (typeof PROJECT_TYPES)[number]["id"];
export type DesignStyleId = (typeof DESIGN_STYLES)[number]["id"];
export type FinishLevelId = (typeof FINISH_LEVELS)[number]["id"];
