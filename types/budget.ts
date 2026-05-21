import type { BudgetItem } from "@/types";
import type { BudgetEstimateInput } from "@/utils/validations";

export type { BudgetEstimateInput };

export type BudgetEstimateMeta = {
  projectType: string;
  projectLabel: string;
  style: string;
  styleLabel: string;
  finishLevel: string;
  finishLabel: string;
  area: number;
  multipliers: { style: number; finish: number };
};

export type BudgetEstimateResult = {
  items: BudgetItem[];
  subtotal: number;
  pricePerSqm: number;
  baseTotal: number;
  meta: BudgetEstimateMeta;
};

export type BudgetBranding = {
  projectType?: string;
  projectLabel?: string;
  style?: string;
  styleLabel?: string;
  finishLevel?: string;
  finishLabel?: string;
  area?: number;
  pricePerSqm?: number;
  introText?: string;
  conclusionText?: string;
  estimateMeta?: BudgetEstimateMeta;
};

export type BudgetWithUser = {
  id: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  items: unknown;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  pdfUrl: string | null;
  validUntil: Date | null;
  branding: BudgetBranding | null;
  createdAt: Date;
  user: { id: string; name: string | null };
};
