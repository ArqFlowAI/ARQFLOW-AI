import { prisma } from "@/lib/prisma";
import type { RenderInput } from "@/utils/validations";
import type { RenderStatus } from "@prisma/client";

export const renderRepository = {
  findByOrg(organizationId: string, limit = 24) {
    return prisma.render.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.render.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  create(params: {
    organizationId: string;
    userId: string;
    input: RenderInput;
    fullPrompt: string;
  }) {
    const { input, fullPrompt } = params;
    return prisma.render.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        projectId: input.projectId,
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        status: "PENDING",
        provider: "replicate",
        metadata: {
          aspectRatio: input.aspectRatio,
          style: input.style,
          fullPrompt,
        },
      },
    });
  },

  updateStatus(
    id: string,
    data: {
      status: RenderStatus;
      imageUrl?: string;
      storagePath?: string;
      externalId?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    return prisma.render.update({
      where: { id },
      data: {
        status: data.status,
        imageUrl: data.imageUrl,
        storagePath: data.storagePath,
        externalId: data.externalId,
        metadata: data.metadata as object | undefined,
      },
    });
  },

  delete(id: string, organizationId: string) {
    return prisma.render.deleteMany({ where: { id, organizationId } });
  },

  countByOrg(organizationId: string, status?: RenderStatus) {
    return prisma.render.count({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
    });
  },
};
