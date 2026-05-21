import { prisma } from "@/lib/prisma";
import type {
  MessageDirection,
  MessageStatus,
  WhatsAppProvider,
} from "@prisma/client";

export const messageRepository = {
  findByOrg(
    organizationId: string,
    options?: { limit?: number; leadId?: string }
  ) {
    return prisma.message.findMany({
      where: {
        organizationId,
        channel: "whatsapp",
        ...(options?.leadId ? { leadId: options.leadId } : {}),
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        automation: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });
  },

  create(data: {
    organizationId: string;
    leadId?: string;
    automationId?: string;
    direction: MessageDirection;
    content: string;
    phone?: string;
    status?: MessageStatus;
    provider?: WhatsAppProvider;
    externalId?: string;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
  }) {
    const now = new Date();
    const status = data.status ?? "PENDING";

    return prisma.message.create({
      data: {
        organizationId: data.organizationId,
        leadId: data.leadId,
        automationId: data.automationId,
        channel: "whatsapp",
        direction: data.direction,
        content: data.content,
        phone: data.phone,
        status,
        provider: data.provider,
        externalId: data.externalId,
        metadata: data.metadata as object | undefined,
        errorMessage: data.errorMessage,
        sentAt: status === "SENT" ? now : undefined,
        deliveredAt: status === "DELIVERED" ? now : undefined,
        readAt: status === "READ" ? now : undefined,
      },
    });
  },

  updateStatus(
    id: string,
    organizationId: string,
    status: MessageStatus,
    extra?: { externalId?: string; errorMessage?: string }
  ) {
    const now = new Date();
    return prisma.message.updateMany({
      where: { id, organizationId },
      data: {
        status,
        externalId: extra?.externalId,
        errorMessage: extra?.errorMessage,
        ...(status === "SENT" ? { sentAt: now } : {}),
        ...(status === "DELIVERED" ? { deliveredAt: now } : {}),
        ...(status === "READ" ? { readAt: now } : {}),
      },
    });
  },

  updateStatusByExternalId(
    externalId: string,
    status: MessageStatus,
    organizationId?: string
  ) {
    const now = new Date();
    return prisma.message.updateMany({
      where: {
        externalId,
        ...(organizationId ? { organizationId } : {}),
      },
      data: {
        status,
        ...(status === "DELIVERED" ? { deliveredAt: now } : {}),
        ...(status === "READ" ? { readAt: now } : {}),
        ...(status === "SENT" ? { sentAt: now } : {}),
        ...(status === "ERROR"
          ? { errorMessage: "Falha reportada pelo provedor" }
          : {}),
      },
    });
  },

  countByStatus(organizationId: string) {
    return prisma.message.groupBy({
      by: ["status"],
      where: { organizationId, channel: "whatsapp" },
      _count: { id: true },
    });
  },
};
