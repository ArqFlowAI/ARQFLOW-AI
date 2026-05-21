"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { whatsappRepository } from "@/repositories/whatsapp.repository";
import {
  refreshWhatsAppConnection,
  sendWhatsAppMessage,
} from "@/services/whatsapp.service";
import type { AutomationStatus, WhatsAppProvider } from "@prisma/client";

const WHATSAPP_PATHS = ["/whatsapp", "/dashboard/whatsapp"];

function revalidateWhatsApp() {
  WHATSAPP_PATHS.forEach((p) => revalidatePath(p));
}

export async function refreshConnectionAction() {
  const session = await requireSession();
  const connection = await refreshWhatsAppConnection(session.organizationId);
  revalidateWhatsApp();
  return {
    success: true,
    status: connection.status,
    qrCode: connection.qrCode,
  };
}

export async function setProviderAction(provider: WhatsAppProvider) {
  const session = await requireSession();
  await whatsappRepository.upsertConnection(session.organizationId, {
    provider,
    status: provider === "TWILIO" ? "CONNECTED" : "DISCONNECTED",
    qrCode: null,
  });
  await prisma.organizationSettings.upsert({
    where: { organizationId: session.organizationId },
    create: {
      organizationId: session.organizationId,
      whatsappProvider: provider,
      twilioEnabled: provider === "TWILIO",
    },
    update: {
      whatsappProvider: provider,
      ...(provider === "TWILIO" ? { twilioEnabled: true } : {}),
    },
  });
  revalidateWhatsApp();
  return { success: true };
}

const sendSchema = z.object({
  phone: z.string().min(10),
  message: z.string().min(1),
  leadId: z.string().optional(),
});

export async function sendWhatsAppAction(input: z.infer<typeof sendSchema>) {
  const session = await requireSession();
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  try {
    const result = await sendWhatsAppMessage({
      organizationId: session.organizationId,
      phone: parsed.data.phone,
      message: parsed.data.message,
      leadId: parsed.data.leadId,
    });
    revalidateWhatsApp();
    return { success: true, data: result };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao enviar mensagem",
    };
  }
}

export async function toggleAutomationAction(
  automationId: string,
  status: AutomationStatus
) {
  const session = await requireSession();
  await whatsappRepository.updateAutomation(
    automationId,
    session.organizationId,
    { status }
  );
  revalidateWhatsApp();
  return { success: true };
}

export async function updateAutomationTemplateAction(
  automationId: string,
  template: string
) {
  const session = await requireSession();
  if (!template.trim()) return { error: "Template não pode ser vazio" };
  await whatsappRepository.updateAutomation(
    automationId,
    session.organizationId,
    { template: template.trim() }
  );
  revalidateWhatsApp();
  return { success: true };
}
