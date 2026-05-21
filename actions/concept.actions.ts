"use server";

import { requireSession } from "@/lib/auth/session";
import {
  generateConcept,
  getConcept,
  listConcepts,
  parseConceptInput,
} from "@/services/concept.service";
import { conceptRepository } from "@/repositories/concept.repository";
import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";

function handleActionError(error: unknown) {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  console.error("[Concept Action]", error);
  return { error: "Erro ao processar conceito" };
}

export async function generateConceptAction(formData: FormData) {
  try {
    const session = await requireSession();

    const parsed = parseConceptInput({
      environment: formData.get("environment"),
      style: formData.get("style"),
      area: formData.get("area") || undefined,
      budget: formData.get("budget") || undefined,
      references: formData.get("references"),
      notes: formData.get("notes"),
      projectId: formData.get("projectId") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message };
    }

    const concept = await generateConcept({
      organizationId: session.organizationId,
      userId: session.id,
      input: parsed.data,
    });

    revalidatePath("/dashboard/conceitos");
    return { success: true, data: concept };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getConceptAction(conceptId: string) {
  try {
    const session = await requireSession();
    const concept = await getConcept(conceptId, session.organizationId);
    return { success: true, data: concept };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteConceptAction(conceptId: string) {
  try {
    const session = await requireSession();
    await conceptRepository.delete(conceptId, session.organizationId);
    revalidatePath("/dashboard/conceitos");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listConceptsAction() {
  try {
    const session = await requireSession();
    const concepts = await listConcepts(session.organizationId);
    return { success: true, data: concepts };
  } catch (error) {
    return handleActionError(error);
  }
}
