import { prisma } from "@/lib/prisma";
import { messageRepository } from "@/repositories/message.repository";
import { mapWebhookStatus } from "@/services/whatsapp.service";
import type { MessageDirection, MessageStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const instanceId =
      payload.instanceId ??
      payload.instance ??
      process.env.ZAPI_INSTANCE_ID;

    const settings = instanceId
      ? await prisma.organizationSettings.findFirst({
          where: { zapiInstanceId: instanceId },
        })
      : null;

    const organizationId = settings?.organizationId;
    if (!organizationId) {
      return Response.json({ received: true });
    }

    const externalId =
      payload.messageId ?? payload.id ?? payload.zaapId ?? undefined;
    const statusRaw =
      payload.status ?? payload.ack ?? payload.messageStatus ?? "";
    const mapped = mapWebhookStatus(String(statusRaw));

    if (externalId && mapped) {
      await messageRepository.updateStatusByExternalId(
        externalId,
        mapped,
        organizationId
      );
    }

    const isInbound =
      payload.fromMe === false ||
      payload.direction === "inbound" ||
      payload.type === "ReceivedCallback";

    if (isInbound && payload.text?.message) {
      const phone = String(payload.phone ?? payload.from ?? "").replace(
        /\D/g,
        ""
      );
      const lead = phone
        ? await prisma.lead.findFirst({
            where: {
              organizationId,
              phone: { contains: phone.slice(-8) },
            },
          })
        : null;

      await messageRepository.create({
        organizationId,
        leadId: lead?.id,
        direction: "INBOUND" as MessageDirection,
        content: payload.text.message ?? payload.body ?? "",
        phone,
        status: "DELIVERED" as MessageStatus,
        provider: "ZAPI",
        externalId,
        metadata: payload as Record<string, unknown>,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Z-API Webhook]", error);
    return Response.json({ received: true });
  }
}
