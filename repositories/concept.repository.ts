import { prisma } from "@/lib/prisma";
import type { ParsedConceptContent } from "@/lib/concepts/schema";
import type { ConceptInput } from "@/utils/validations";

export const conceptRepository = {
  findByOrg(organizationId: string, limit = 24) {
    return prisma.concept.findMany({
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
    return prisma.concept.findFirst({
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
    input: ConceptInput;
    content: ParsedConceptContent;
  }) {
    const { input, content } = params;
    return prisma.concept.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        projectId: input.projectId,
        environment: input.environment,
        style: input.style,
        area: input.area,
        budget: input.budget,
        references: input.references,
        notes: input.notes,
        title: content.title,
        content: content as object,
        palette: content.palette as object,
      },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  delete(id: string, organizationId: string) {
    return prisma.concept.deleteMany({ where: { id, organizationId } });
  },

  countByOrg(organizationId: string, since?: Date) {
    return prisma.concept.count({
      where: {
        organizationId,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
    });
  },
};
