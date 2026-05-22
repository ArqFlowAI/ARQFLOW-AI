import { budgetRepository } from "@/repositories/budget.repository";
import { calculateBudgetEstimate } from "@/lib/budgets/calculator";
import { generateBudgetProposalText } from "@/services/openai.service";
import { generateBudgetPDF } from "@/services/budget-pdf.service";
import { consumeCredits } from "@/services/credits.service";
import {
  assertActiveSubscription,
  assertPlanFeature,
} from "@/lib/billing/plan-guard";
import { BUDGET_CREDIT_COST } from "@/lib/budgets/constants";
import {
  budgetSchema,
  budgetEstimateSchema,
  type BudgetEstimateInput,
} from "@/utils/validations";
import { createServiceClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { BudgetItem } from "@/types";
import type { BudgetBranding } from "@/types/budget";
import { AppError } from "@/lib/errors";

export function parseBudgetEstimate(data: unknown) {
  return budgetEstimateSchema.safeParse(data);
}

export function parseBudgetCreate(data: unknown) {
  return budgetSchema.safeParse(data);
}

export function estimateBudget(input: BudgetEstimateInput) {
  return calculateBudgetEstimate(input);
}

export async function listBudgets(organizationId: string, userId?: string) {
  if (userId) {
    return budgetRepository.findByUser(organizationId, userId);
  }
  return budgetRepository.findByOrg(organizationId);
}

export async function getBudget(id: string, organizationId: string) {
  const budget = await budgetRepository.findById(id, organizationId);
  if (!budget) throw new AppError("Orçamento não encontrado", 404);
  return budget;
}

function splitProposalText(text: string): {
  introText: string;
  conclusionText: string;
} {
  const parts = text.split(/\n\n+/).filter(Boolean);
  if (parts.length <= 1) {
    return { introText: text, conclusionText: "" };
  }
  const mid = Math.ceil(parts.length / 2);
  return {
    introText: parts.slice(0, mid).join("\n\n"),
    conclusionText: parts.slice(mid).join("\n\n"),
  };
}

export async function createBudgetProposal(params: {
  organizationId: string;
  userId: string;
  organizationName: string;
  brandColor?: string | null;
  title: string;
  clientName?: string;
  clientEmail?: string;
  items: BudgetItem[];
  discount: number;
  tax: number;
  validUntil?: string;
  projectId?: string;
  estimate?: BudgetEstimateInput;
}) {
  const subtotal = params.items.reduce((s, i) => s + i.total, 0);
  const total = Math.max(0, subtotal - params.discount + params.tax);

  await assertPlanFeature(params.organizationId, "budgets");
  await consumeCredits(
    params.organizationId,
    BUDGET_CREDIT_COST,
    "budget",
    params.userId
  );

  let estimateResult = null;
  let branding: BudgetBranding = {};

  if (params.estimate) {
    estimateResult = calculateBudgetEstimate(params.estimate);
    branding = {
      ...estimateResult.meta,
      projectType: estimateResult.meta.projectType,
      projectLabel: estimateResult.meta.projectLabel,
      styleLabel: estimateResult.meta.styleLabel,
      finishLabel: estimateResult.meta.finishLabel,
      area: estimateResult.meta.area,
      pricePerSqm: estimateResult.pricePerSqm,
      estimateMeta: estimateResult.meta,
    };
  }

  const rawProposal = await generateBudgetProposalText({
    title: params.title,
    clientName: params.clientName,
    items: params.items,
    total,
  });

  const { introText, conclusionText } = splitProposalText(rawProposal);
  branding.introText = introText;
  branding.conclusionText = conclusionText;

  const validUntilDate = params.validUntil
    ? new Date(params.validUntil)
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  const budget = await budgetRepository.create({
    organizationId: params.organizationId,
    userId: params.userId,
    title: params.title,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    items: params.items,
    subtotal,
    discount: params.discount,
    tax: params.tax,
    total,
    validUntil: validUntilDate,
    projectId: params.projectId,
    branding,
  });

  const projectSummary = estimateResult
    ? `${estimateResult.meta.projectLabel} · ${estimateResult.meta.area} m² · ${estimateResult.meta.styleLabel} · Acabamento ${estimateResult.meta.finishLabel}`
    : undefined;

  const pdfBuffer = generateBudgetPDF({
    title: params.title,
    clientName: params.clientName,
    clientEmail: params.clientEmail,
    organizationName: params.organizationName,
    brandColor: params.brandColor ?? undefined,
    items: params.items,
    subtotal,
    discount: params.discount,
    tax: params.tax,
    total,
    introText,
    conclusionText,
    validUntil: validUntilDate.toLocaleDateString("pt-BR"),
    projectSummary,
  });

  const supabase = await createServiceClient();
  const path = `${params.organizationId}/${budget.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("budgets")
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  let pdfUrl: string | null = null;
  if (!uploadError) {
    const { data } = supabase.storage.from("budgets").getPublicUrl(path);
    pdfUrl = data.publicUrl;
    await budgetRepository.updatePdf(budget.id, pdfUrl);
  }

  await prisma.analyticsEvent.create({
    data: {
      organizationId: params.organizationId,
      event: "budget_created",
      properties: { budgetId: budget.id, total },
    },
  });

  return {
    ...budget,
    pdfUrl,
    branding,
    introText,
    conclusionText,
  };
}

export async function regenerateBudgetPdf(
  budgetId: string,
  organizationId: string
) {
  const budget = await getBudget(budgetId, organizationId);
  const branding = (budget.branding as BudgetBranding) ?? {};
  const items = budget.items as BudgetItem[];

  const projectSummary =
    branding.projectLabel && branding.area
      ? `${branding.projectLabel} · ${branding.area} m² · ${branding.styleLabel ?? ""} · ${branding.finishLabel ?? ""}`
      : undefined;

  const pdfBuffer = generateBudgetPDF({
    title: budget.title,
    clientName: budget.clientName ?? undefined,
    clientEmail: budget.clientEmail ?? undefined,
    organizationName: budget.organization.name,
    brandColor: budget.organization.brandColor ?? undefined,
    items,
    subtotal: budget.subtotal,
    discount: budget.discount,
    tax: budget.tax,
    total: budget.total,
    introText: branding.introText,
    conclusionText: branding.conclusionText,
    validUntil: budget.validUntil?.toLocaleDateString("pt-BR"),
    projectSummary,
  });

  const supabase = await createServiceClient();
  const path = `${organizationId}/${budget.id}.pdf`;
  await supabase.storage.from("budgets").upload(path, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });
  const { data } = supabase.storage.from("budgets").getPublicUrl(path);
  await budgetRepository.updatePdf(budget.id, data.publicUrl);
  return data.publicUrl;
}
