import { prisma } from "@/lib/prisma";
import { WHATSAPP_AUTOMATION_DEFS } from "@/lib/whatsapp/constants";
import type {
  AutomationStatus,
  WhatsAppAutomationType,
  WhatsAppConnectionStatus,
  WhatsAppProvider,
} from "@prisma/client";

export const whatsappRepository = {
  async getConnection(organizationId: string) {
    return prisma.whatsAppConnection.findUnique({
      where: { organizationId },
    });
  },

  async upsertConnection(
    organizationId: string,
    data: {
      provider?: WhatsAppProvider;
      status?: WhatsAppConnectionStatus;
      phoneNumber?: string | null;
      displayName?: string | null;
      qrCode?: string | null;
      qrExpiresAt?: Date | null;
      zapiInstanceId?: string | null;
      lastConnectedAt?: Date | null;
      metadata?: Record<string, unknown>;
    }
  ) {
    return prisma.whatsAppConnection.upsert({
      where: { organizationId },
      create: {
        organizationId,
        provider: data.provider ?? "ZAPI",
        status: data.status ?? "DISCONNECTED",
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        qrCode: data.qrCode,
        qrExpiresAt: data.qrExpiresAt,
        zapiInstanceId: data.zapiInstanceId,
        lastConnectedAt: data.lastConnectedAt,
        metadata: data.metadata as object | undefined,
      },
      update: {
        provider: data.provider,
        status: data.status,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        qrCode: data.qrCode,
        qrExpiresAt: data.qrExpiresAt,
        zapiInstanceId: data.zapiInstanceId,
        lastConnectedAt: data.lastConnectedAt,
        metadata: data.metadata as object | undefined,
      },
    });
  },

  async getSettings(organizationId: string) {
    return prisma.organizationSettings.findUnique({
      where: { organizationId },
    });
  },

  async ensureAutomations(organizationId: string) {
    const existing = await prisma.whatsAppAutomation.findMany({
      where: { organizationId },
    });
    if (existing.length >= WHATSAPP_AUTOMATION_DEFS.length) return existing;

    const existingTypes = new Set(existing.map((a) => a.type));
    const toCreate = WHATSAPP_AUTOMATION_DEFS.filter(
      (d) => !existingTypes.has(d.type)
    );

    if (toCreate.length > 0) {
      await prisma.whatsAppAutomation.createMany({
        data: toCreate.map((d) => ({
          organizationId,
          type: d.type,
          name: d.name,
          description: d.description,
          template: d.template,
          trigger: d.trigger as object,
          delayMinutes: d.delayMinutes,
          status: "DRAFT",
        })),
      });
    }

    return prisma.whatsAppAutomation.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  },

  findAutomations(organizationId: string) {
    return prisma.whatsAppAutomation.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  },

  updateAutomation(
    id: string,
    organizationId: string,
    data: {
      status?: AutomationStatus;
      template?: string;
      delayMinutes?: number;
    }
  ) {
    return prisma.whatsAppAutomation.updateMany({
      where: { id, organizationId },
      data,
    });
  },

  findAutomationByType(organizationId: string, type: WhatsAppAutomationType) {
    return prisma.whatsAppAutomation.findUnique({
      where: { organizationId_type: { organizationId, type } },
    });
  },

  incrementAutomationRun(id: string) {
    return prisma.whatsAppAutomation.update({
      where: { id },
      data: {
        runsCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    });
  },
};
