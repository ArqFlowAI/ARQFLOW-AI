import Replicate from "replicate";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";
import { RenderStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import {
  REPLICATE_FLUX_MODEL,
  type RenderAspectRatio,
} from "@/lib/renders/constants";

function getReplicateClient() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new AppError(
      "REPLICATE_API_TOKEN não configurado. Adicione no .env",
      503,
      "REPLICATE_NOT_CONFIGURED"
    );
  }
  return new Replicate({ auth: token });
}

async function resolveOutputUrl(output: unknown): Promise<string> {
  if (!output) {
    throw new AppError("Replicate retornou saída vazia", 502, "REPLICATE_EMPTY");
  }

  if (typeof output === "string") {
    if (output.startsWith("http")) return output;
    throw new AppError("URL de imagem inválida", 502, "REPLICATE_INVALID_URL");
  }

  if (Array.isArray(output)) {
    return resolveOutputUrl(output[0]);
  }

  if (typeof output === "object" && output !== null) {
    const obj = output as Record<string, unknown>;

    if (typeof obj.url === "function") {
      const url = await (obj.url as () => Promise<string | URL>)();
      return String(url);
    }

    if (typeof obj.href === "string") return obj.href;
    if (typeof obj.uri === "string") return obj.uri;

    if (typeof obj.toString === "function") {
      const str = obj.toString();
      if (str.startsWith("http")) return str;
    }
  }

  throw new AppError(
    "Formato de resposta Replicate não suportado",
    502,
    "REPLICATE_OUTPUT_FORMAT"
  );
}

async function uploadToSupabase(
  imageUrl: string,
  path: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const supabase = await createServiceClient();
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      console.warn("[Render] Falha ao baixar imagem Replicate:", imageRes.status);
      return null;
    }

    const buffer = await imageRes.arrayBuffer();
    const contentType =
      imageRes.headers.get("content-type") ?? "image/webp";

    const { error } = await supabase.storage.from("renders").upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.warn("[Render] Upload Supabase:", error.message);
      return null;
    }

    const { data } = supabase.storage.from("renders").getPublicUrl(path);
    return { publicUrl: data.publicUrl, storagePath: path };
  } catch (err) {
    console.warn("[Render] Storage skip:", err);
    return null;
  }
}

export async function runFluxRender(params: {
  prompt: string;
  aspectRatio: RenderAspectRatio;
}): Promise<{ imageUrl: string; predictionId?: string }> {
  const replicate = getReplicateClient();
  const model =
    (process.env.REPLICATE_FLUX_MODEL as typeof REPLICATE_FLUX_MODEL) ??
    REPLICATE_FLUX_MODEL;

  try {
    const prediction = await replicate.predictions.create({
      model,
      input: {
        prompt: params.prompt,
        num_outputs: 1,
        aspect_ratio: params.aspectRatio,
        output_format: "webp",
        output_quality: 90,
        go_fast: true,
      },
    });

    const completed = await replicate.wait(prediction, {
      interval: 1500,
    });

    if (completed.status === "failed") {
      throw new AppError(
        typeof completed.error === "string"
          ? completed.error
          : "Geração falhou no Replicate",
        502,
        "REPLICATE_FAILED"
      );
    }

    const imageUrl = await resolveOutputUrl(completed.output);

    return {
      imageUrl,
      predictionId: completed.id,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    const msg = error instanceof Error ? error.message : "Erro Replicate";

    if (msg.includes("402") || msg.includes("insufficient credit")) {
      throw new AppError(
        "Créditos Replicate esgotados. Recarregue em replicate.com",
        402,
        "REPLICATE_BILLING"
      );
    }

    if (msg.includes("401") || msg.includes("authentication")) {
      throw new AppError("Token Replicate inválido", 503, "REPLICATE_AUTH");
    }

    console.error("[Replicate]", error);
    throw new AppError(
      "Falha ao gerar render. Tente novamente em instantes.",
      502,
      "REPLICATE_ERROR"
    );
  }
}

export async function generateRender(params: {
  renderId: string;
  organizationId: string;
  userId: string;
  fullPrompt: string;
  aspectRatio: RenderAspectRatio;
}) {
  await prisma.render.update({
    where: { id: params.renderId },
    data: { status: RenderStatus.PROCESSING },
  });

  try {
    const { imageUrl, predictionId } = await runFluxRender({
      prompt: params.fullPrompt,
      aspectRatio: params.aspectRatio,
    });

    const storagePath = `${params.organizationId}/${params.userId}/${params.renderId}.webp`;
    const uploaded = await uploadToSupabase(imageUrl, storagePath);
    const finalUrl = uploaded?.publicUrl ?? imageUrl;

    return prisma.render.update({
      where: { id: params.renderId },
      data: {
        status: RenderStatus.COMPLETED,
        imageUrl: finalUrl,
        storagePath: uploaded?.storagePath ?? null,
        externalId: predictionId,
        metadata: {
          aspectRatio: params.aspectRatio,
          originalUrl: imageUrl,
          storedInSupabase: !!uploaded,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Erro desconhecido";

    await prisma.render.update({
      where: { id: params.renderId },
      data: {
        status: RenderStatus.FAILED,
        metadata: { error: message },
      },
    });

    throw error;
  }
}
