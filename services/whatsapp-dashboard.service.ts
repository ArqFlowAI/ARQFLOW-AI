import { prisma } from "@/lib/prisma";
import { messageRepository } from "@/repositories/message.repository";
import { whatsappRepository } from "@/repositories/whatsapp.repository";
import { AUTOMATION_TYPE_ICONS } from "@/lib/whatsapp/constants";
import type {
  WhatsAppAutomationDto,
  WhatsAppConnectionDto,
  WhatsAppDashboardStats,
  WhatsAppMessageDto,
} from "@/types/whatsapp";

export async function getWhatsAppPageData(organizationId: string) {
  const [
    statusCounts,
    totalMessages,
    activeLeads,
    closedFromWhatsApp,
    connection,
    settings,
    automations,
    messages,
  ] = await Promise.all([
    messageRepository.countByStatus(organizationId),
    prisma.message.count({
      where: { organizationId, channel: "whatsapp" },
    }),
    prisma.lead.count({
      where: {
        organizationId,
        phone: { not: null },
        stage: { notIn: ["FECHADO", "PERDIDO"] },
      },
    }),
    prisma.lead.count({
      where: {
        organizationId,
        stage: "FECHADO",
        messages: { some: { channel: "whatsapp" } },
      },
    }),
    whatsappRepository.getConnection(organizationId),
    whatsappRepository.getSettings(organizationId),
    whatsappRepository.ensureAutomations(organizationId),
    messageRepository.findByOrg(organizationId, { limit: 20 }),
  ]);

  const countMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );

  const sentCount =
    (countMap.SENT ?? 0) +
    (countMap.DELIVERED ?? 0) +
    (countMap.READ ?? 0);
  const deliveredCount =
    (countMap.DELIVERED ?? 0) + (countMap.READ ?? 0);
  const readCount = countMap.READ ?? 0;
  const inboundCount = await prisma.message.count({
    where: {
      organizationId,
      channel: "whatsapp",
      direction: "INBOUND",
    },
  });

  const responseRate =
    sentCount > 0
      ? Math.round((inboundCount / Math.max(sentCount, 1)) * 100)
      : 0;

  const conversionRate =
    sentCount > 0
      ? Math.round((closedFromWhatsApp / Math.max(activeLeads + closedFromWhatsApp, 1)) * 100)
      : 0;

  const activeAutomations = automations.filter((a) => a.status === "ACTIVE").length;

  const stats: WhatsAppDashboardStats = {
    totalMessages,
    sentCount,
    deliveredCount,
    readCount,
    errorCount: countMap.ERROR ?? 0,
    responseRate: Math.min(responseRate, 100),
    conversionRate: Math.min(conversionRate, 100),
    activeLeads,
    activeAutomations,
  };

  const connectionDto: WhatsAppConnectionDto = {
    provider: connection?.provider ?? settings?.whatsappProvider ?? "ZAPI",
    status: connection?.status ?? "DISCONNECTED",
    phoneNumber: connection?.phoneNumber ?? null,
    displayName: connection?.displayName ?? null,
    qrCode: connection?.qrCode ?? null,
    qrExpiresAt: connection?.qrExpiresAt?.toISOString() ?? null,
    zapiInstanceId:
      connection?.zapiInstanceId ?? settings?.zapiInstanceId ?? null,
    whatsappEnabled: settings?.whatsappEnabled ?? false,
    twilioEnabled: settings?.twilioEnabled ?? false,
  };

  const automationDtos: WhatsAppAutomationDto[] = automations.map((a) => ({
    id: a.id,
    type: a.type,
    name: a.name,
    description: a.description,
    status: a.status,
    template: a.template,
    trigger: a.trigger as Record<string, unknown>,
    delayMinutes: a.delayMinutes,
    runsCount: a.runsCount,
    lastRunAt: a.lastRunAt?.toISOString() ?? null,
    icon: AUTOMATION_TYPE_ICONS[a.type],
  }));

  const messageDtos: WhatsAppMessageDto[] = messages.map((m) => ({
    id: m.id,
    content: m.content,
    phone: m.phone ?? m.lead?.phone ?? null,
    direction: m.direction,
    status: m.status,
    leadName: m.lead?.name ?? null,
    automationName: m.automation?.name ?? null,
    createdAt: m.createdAt.toISOString(),
    deliveredAt: m.deliveredAt?.toISOString() ?? null,
    readAt: m.readAt?.toISOString() ?? null,
  }));

  return { stats, connection: connectionDto, automations: automationDtos, messages: messageDtos };
}
