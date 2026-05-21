import { prisma } from "@/lib/prisma";
import type { BudgetItem } from "@/types";
import type { BudgetBranding } from "@/types/budget";

export const budgetRepository = {
  findByOrg(organizationId: string, limit = 30) {
    return prisma.budget.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  },

  findByUser(organizationId: string, userId: string, limit = 30) {
    return prisma.budget.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.budget.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        organization: { select: { name: true, brandColor: true, logoUrl: true } },
      },
    });
  },

  create(data: {
    organizationId: string;
    userId: string;
    title: string;
    clientName?: string;
    clientEmail?: string;
    items: BudgetItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    validUntil?: Date;
    projectId?: string;
    branding?: BudgetBranding;
    status?: string;
  }) {
    return prisma.budget.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        projectId: data.projectId,
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        items: data.items as object,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        validUntil: data.validUntil,
        branding: data.branding as object,
        status: data.status ?? "sent",
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  },

  updatePdf(id: string, pdfUrl: string) {
    return prisma.budget.update({
      where: { id },
      data: { pdfUrl, status: "sent" },
    });
  },

  delete(id: string, organizationId: string) {
    return prisma.budget.deleteMany({ where: { id, organizationId } });
  },

  aggregateTotal(organizationId: string) {
    return prisma.budget.aggregate({
      where: { organizationId },
      _sum: { total: true },
      _count: true,
    });
  },
};
