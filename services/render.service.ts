import { renderRepository } from "@/repositories/render.repository";
import { generateRender } from "@/services/replicate.service";
import { consumeCredits } from "@/services/credits.service";
import { assertPlanFeature, assertPlanLimit } from "@/lib/billing/plan-guard";
import { buildRenderPrompt } from "@/lib/renders/prompts";
import { RENDER_CREDIT_COST } from "@/lib/renders/constants";
import { renderSchema, type RenderInput } from "@/utils/validations";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { RenderAspectRatio } from "@/lib/renders/constants";

export function parseRenderInput(data: unknown) {
  return renderSchema.safeParse(data);
}

export async function listRenders(organizationId: string) {
  return renderRepository.findByOrg(organizationId);
}

export async function getRender(id: string, organizationId: string) {
  const render = await renderRepository.findById(id, organizationId);
  if (!render) throw new AppError("Render não encontrado", 404);
  return render;
}

export async function createAndQueueRender(params: {
  organizationId: string;
  userId: string;
  input: RenderInput;
}) {
  const fullPrompt = buildRenderPrompt(params.input);

  await assertPlanFeature(params.organizationId, "renders");
  await assertPlanLimit(params.organizationId, "renders", () =>
    prisma.render.count({ where: { organizationId: params.organizationId } })
  );

  await consumeCredits(
    params.organizationId,
    RENDER_CREDIT_COST,
    "render",
    params.userId
  );

  const render = await renderRepository.create({
    organizationId: params.organizationId,
    userId: params.userId,
    input: params.input,
    fullPrompt,
  });

  await prisma.analyticsEvent.create({
    data: {
      organizationId: params.organizationId,
      event: "render_queued",
      properties: {
        renderId: render.id,
        aspectRatio: params.input.aspectRatio,
        style: params.input.style,
      },
    },
  });

  processRenderJob({
    renderId: render.id,
    organizationId: params.organizationId,
    userId: params.userId,
    fullPrompt,
    aspectRatio: params.input.aspectRatio as RenderAspectRatio,
  }).catch((err) => {
    console.error("[Render Job]", render.id, err);
  });

  return render;
}

async function processRenderJob(params: {
  renderId: string;
  organizationId: string;
  userId: string;
  fullPrompt: string;
  aspectRatio: RenderAspectRatio;
}) {
  const completed = await generateRender(params);

  await prisma.analyticsEvent.create({
    data: {
      organizationId: params.organizationId,
      event: "render_completed",
      properties: { renderId: completed.id, status: completed.status },
    },
  });
}

export async function retryRender(
  renderId: string,
  organizationId: string,
  userId: string
) {
  const render = await getRender(renderId, organizationId);

  if (render.status !== "FAILED") {
    throw new AppError("Apenas renders com falha podem ser reprocessados", 400);
  }

  const meta = render.metadata as {
    aspectRatio?: RenderAspectRatio;
    fullPrompt?: string;
  } | null;

  const aspectRatio =
    meta?.aspectRatio ?? ("16:9" as RenderAspectRatio);
  const fullPrompt =
    meta?.fullPrompt ??
    buildRenderPrompt({
      prompt: render.prompt,
      negativePrompt: render.negativePrompt ?? undefined,
      aspectRatio,
      projectId: render.projectId ?? undefined,
    });

  await renderRepository.updateStatus(renderId, { status: "PENDING" });

  processRenderJob({
    renderId,
    organizationId,
    userId,
    fullPrompt,
    aspectRatio,
  }).catch(console.error);

  return renderRepository.findById(renderId, organizationId);
}
