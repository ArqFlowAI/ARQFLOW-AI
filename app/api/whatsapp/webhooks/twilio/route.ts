import { prisma } from "@/lib/prisma";
import { messageRepository } from "@/repositories/message.repository";
import { mapWebhookStatus } from "@/services/whatsapp.service";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const messageSid = form.get("MessageSid")?.toString();
    const messageStatus = form.get("MessageStatus")?.toString() ?? "";
    const body = form.get("Body")?.toString();
    const from = form.get("From")?.toString()?.replace("whatsapp:", "");

    const mapped = mapWebhookStatus(messageStatus);

    if (messageSid && mapped) {
      await messageRepository.updateStatusByExternalId(messageSid, mapped);
    }

    if (body && from) {
      const phone = from.replace(/\D/g, "");
      const orgs = await prisma.organizationSettings.findMany({
        where: { twilioEnabled: true },
        take: 1,
      });
      const organizationId = orgs[0]?.organizationId;
      if (!organizationId) {
        return new Response("<Response></Response>", {
          headers: { "Content-Type": "text/xml" },
        });
      }

      const lead = await prisma.lead.findFirst({
        where: {
          organizationId,
          phone: { contains: phone.slice(-8) },
        },
      });

      await messageRepository.create({
        organizationId,
        leadId: lead?.id,
        direction: "INBOUND",
        content: body,
        phone,
        status: "DELIVERED",
        provider: "TWILIO",
        externalId: messageSid,
      });
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[Twilio Webhook]", error);
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
