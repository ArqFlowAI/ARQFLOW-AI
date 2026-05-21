"use server";

import { requireSession } from "@/lib/auth/session";
import {
  createBudgetProposal,
  estimateBudget,
  getBudget,
  listBudgets,
  parseBudgetCreate,
  parseBudgetEstimate,
  regenerateBudgetPdf,
} from "@/services/budget.service";
import { budgetRepository } from "@/repositories/budget.repository";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import type { BudgetItem } from "@/types";

function handleError(error: unknown) {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  console.error("[Budget Action]", error);
  return { error: "Erro ao processar orçamento" };
}

export async function estimateBudgetAction(data: {
  projectType: string;
  area: number;
  style: string;
  finishLevel: string;
}) {
  try {
    const parsed = parseBudgetEstimate(data);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message };
    }
    const result = estimateBudget(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function createBudgetAction(formData: FormData) {
  try {
    const session = await requireSession();

    const itemsRaw = formData.get("items");
    const items: BudgetItem[] = itemsRaw
      ? JSON.parse(itemsRaw as string)
      : [];

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true, brandColor: true },
    });

    const parsed = parseBudgetCreate({
      title: formData.get("title"),
      clientName: formData.get("clientName"),
      clientEmail: formData.get("clientEmail"),
      items,
      discount: formData.get("discount") || 0,
      tax: formData.get("tax") || 0,
      validUntil: formData.get("validUntil"),
      projectId: formData.get("projectId") || undefined,
      projectType: formData.get("projectType") || undefined,
      area: formData.get("area") || undefined,
      style: formData.get("style") || undefined,
      finishLevel: formData.get("finishLevel") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message };
    }

    const estimate =
      parsed.data.projectType &&
      parsed.data.area &&
      parsed.data.style &&
      parsed.data.finishLevel
        ? {
            projectType: parsed.data.projectType,
            area: parsed.data.area,
            style: parsed.data.style,
            finishLevel: parsed.data.finishLevel,
          }
        : undefined;

    const budget = await createBudgetProposal({
      organizationId: session.organizationId,
      userId: session.id,
      organizationName: org?.name ?? session.organizationName,
      brandColor: org?.brandColor,
      title: parsed.data.title,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail || undefined,
      items: parsed.data.items,
      discount: parsed.data.discount,
      tax: parsed.data.tax,
      validUntil: parsed.data.validUntil,
      projectId: parsed.data.projectId,
      estimate,
    });

    revalidatePath("/dashboard/orcamentos");
    return { success: true, data: budget };
  } catch (error) {
    return handleError(error);
  }
}

export async function getBudgetAction(budgetId: string) {
  try {
    const session = await requireSession();
    const budget = await getBudget(budgetId, session.organizationId);
    return { success: true, data: budget };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteBudgetAction(budgetId: string) {
  try {
    const session = await requireSession();
    await budgetRepository.delete(budgetId, session.organizationId);
    revalidatePath("/dashboard/orcamentos");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function listBudgetsAction(filterByUser?: boolean) {
  try {
    const session = await requireSession();
    const budgets = await listBudgets(
      session.organizationId,
      filterByUser ? session.id : undefined
    );
    return { success: true, data: budgets };
  } catch (error) {
    return handleError(error);
  }
}
