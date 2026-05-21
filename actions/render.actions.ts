"use server";

import { requireSession } from "@/lib/auth/session";
import {
  createAndQueueRender,
  getRender,
  listRenders,
  parseRenderInput,
  retryRender,
} from "@/services/render.service";
import { renderRepository } from "@/repositories/render.repository";
import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";

function handleActionError(error: unknown) {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  console.error("[Render Action]", error);
  return { error: "Erro ao processar render" };
}

export async function generateRenderAction(formData: FormData) {
  try {
    const session = await requireSession();

    const parsed = parseRenderInput({
      prompt: formData.get("prompt"),
      negativePrompt: formData.get("negativePrompt") || undefined,
      projectId: formData.get("projectId") || undefined,
      aspectRatio: formData.get("aspectRatio") || "16:9",
      style: formData.get("style") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message };
    }

    const render = await createAndQueueRender({
      organizationId: session.organizationId,
      userId: session.id,
      input: parsed.data,
    });

    revalidatePath("/dashboard/renders");
    return { success: true, data: render };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getRenderAction(renderId: string) {
  try {
    const session = await requireSession();
    const render = await getRender(renderId, session.organizationId);
    return { success: true, data: render };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function retryRenderAction(renderId: string) {
  try {
    const session = await requireSession();
    const render = await retryRender(
      renderId,
      session.organizationId,
      session.id
    );
    revalidatePath("/dashboard/renders");
    return { success: true, data: render };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleRenderFavoriteAction(renderId: string) {
  try {
    const session = await requireSession();
    const render = await renderRepository.findById(
      renderId,
      session.organizationId
    );
    if (!render) return { error: "Render não encontrado" };

    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.render.update({
      where: { id: renderId },
      data: { isFavorite: !render.isFavorite },
    });

    revalidatePath("/dashboard/renders");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteRenderAction(renderId: string) {
  try {
    const session = await requireSession();
    await renderRepository.delete(renderId, session.organizationId);
    revalidatePath("/dashboard/renders");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function listRendersAction() {
  try {
    const session = await requireSession();
    const renders = await listRenders(session.organizationId);
    return { success: true, data: renders };
  } catch (error) {
    return handleActionError(error);
  }
}
