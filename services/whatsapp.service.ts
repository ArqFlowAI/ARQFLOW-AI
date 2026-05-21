import { prisma } from "@/lib/prisma";
import { messageRepository } from "@/repositories/message.repository";
import { whatsappRepository } from "@/repositories/whatsapp.repository";
import type { MessageStatus, WhatsAppProvider } from "@prisma/client";

type SendParams = {
  organizationId: string;
  phone: string;
  message: string;
  leadId?: string;
  automationId?: string;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function applyTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function getOrgWhatsAppConfig(organizationId: string) {
  const [settings, connection] = await Promise.all([
    whatsappRepository.getSettings(organizationId),
    whatsappRepository.getConnection(organizationId),
  ]);

  const provider =
    settings?.whatsappProvider ?? connection?.provider ?? "ZAPI";

  return {
    settings,
    connection,
    provider: provider as WhatsAppProvider,
    zapiInstanceId:
      connection?.zapiInstanceId ??
      settings?.zapiInstanceId ??
      process.env.ZAPI_INSTANCE_ID,
    zapiToken: process.env.ZAPI_TOKEN,
    twilioEnabled: settings?.twilioEnabled ?? false,
    whatsappEnabled: settings?.whatsappEnabled ?? false,
  };
}

export async function sendZApiMessage(params: {
  instanceId: string;
  token: string;
  phone: string;
  message: string;
}) {
  const phone = normalizePhone(params.phone);
  const res = await fetch(
    `https://api.z-api.io/instances/${params.instanceId}/token/${params.token}/send-text`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message: params.message }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Z-API: ${err}`);
  }

  return res.json() as Promise<{ messageId?: string; zaapId?: string }>;
}

export async function sendTwilioWhatsApp(params: {
  to: string;
  body: string;
}) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    throw new Error("Twilio não configurado");
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const to = params.to.startsWith("whatsapp:")
    ? params.to
    : `whatsapp:+${normalizePhone(params.to)}`;

  const body = new URLSearchParams({ From: from, To: to, Body: params.body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    throw new Error(`Twilio: ${await res.text()}`);
  }

  return res.json() as Promise<{ sid?: string }>;
}

export async function fetchZApiQrCode(instanceId: string, token: string) {
  const res = await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code/image`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QR Z-API: ${text}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("image")) {
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  }

  const json = (await res.json()) as { value?: string; qrcode?: string };
  return json.value ?? json.qrcode ?? null;
}

export async function fetchZApiStatus(instanceId: string, token: string) {
  const res = await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
    { cache: "no-store" }
  );
  if (!res.ok) return { connected: false };
  const data = (await res.json()) as {
    connected?: boolean;
    smartphoneConnected?: boolean;
  };
  return {
    connected: Boolean(data.connected ?? data.smartphoneConnected),
  };
}

export async function sendWhatsAppMessage(params: SendParams) {
  const config = await getOrgWhatsAppConfig(params.organizationId);

  if (!config.whatsappEnabled) {
    throw new Error("WhatsApp não está ativo nas configurações");
  }

  const phone = normalizePhone(params.phone);
  const provider = config.provider;

  const record = await messageRepository.create({
    organizationId: params.organizationId,
    leadId: params.leadId,
    automationId: params.automationId,
    direction: "OUTBOUND",
    content: params.message,
    phone,
    status: "PENDING",
    provider,
  });

  try {
    let externalId: string | undefined;
    let metadata: Record<string, unknown> = {};

    if (provider === "TWILIO" && config.twilioEnabled) {
      const result = await sendTwilioWhatsApp({
        to: phone,
        body: params.message,
      });
      externalId = result.sid;
      metadata = result as Record<string, unknown>;
    } else {
      const instanceId = config.zapiInstanceId;
      const token = config.zapiToken;
      if (!instanceId || !token) {
        throw new Error("Z-API não configurado (instance/token)");
      }
      const result = await sendZApiMessage({
        instanceId,
        token,
        phone,
        message: params.message,
      });
      externalId = result.messageId ?? result.zaapId;
      metadata = result as Record<string, unknown>;
    }

    await prisma.message.update({
      where: { id: record.id },
      data: {
        status: "SENT",
        externalId,
        metadata: metadata as object,
        sentAt: new Date(),
      },
    });

    await prisma.usageRecord.create({
      data: {
        organizationId: params.organizationId,
        type: "whatsapp_send",
        metadata: { messageId: record.id, provider },
      },
    });

    return { messageId: record.id, externalId, status: "SENT" as MessageStatus };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao enviar";
    await prisma.message.update({
      where: { id: record.id },
      data: { status: "ERROR", errorMessage: msg },
    });
    throw error;
  }
}

export async function refreshWhatsAppConnection(organizationId: string) {
  const config = await getOrgWhatsAppConfig(organizationId);
  const instanceId = config.zapiInstanceId;
  const token = config.zapiToken;

  if (config.provider === "TWILIO" && config.twilioEnabled) {
    return whatsappRepository.upsertConnection(organizationId, {
      provider: "TWILIO",
      status: "CONNECTED",
      qrCode: null,
      qrExpiresAt: null,
      lastConnectedAt: new Date(),
      displayName: "Twilio WhatsApp Business",
    });
  }

  if (!instanceId || !token) {
    const demoQr = generateDemoQrPlaceholder(organizationId);
    return whatsappRepository.upsertConnection(organizationId, {
      provider: "ZAPI",
      status: "QR_PENDING",
      qrCode: demoQr,
      qrExpiresAt: new Date(Date.now() + 60_000),
      zapiInstanceId: instanceId ?? null,
    });
  }

  const status = await fetchZApiStatus(instanceId, token);

  if (status.connected) {
    return whatsappRepository.upsertConnection(organizationId, {
      provider: "ZAPI",
      status: "CONNECTED",
      qrCode: null,
      qrExpiresAt: null,
      zapiInstanceId: instanceId,
      lastConnectedAt: new Date(),
    });
  }

  const qrCode = await fetchZApiQrCode(instanceId, token);
  return whatsappRepository.upsertConnection(organizationId, {
    provider: "ZAPI",
    status: "QR_PENDING",
    qrCode,
    qrExpiresAt: new Date(Date.now() + 60_000),
    zapiInstanceId: instanceId,
  });
}

function generateDemoQrPlaceholder(organizationId: string) {
  const label = encodeURIComponent(`ARQFLOW-${organizationId.slice(0, 8)}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${label}&bgcolor=D6C2A1&color=3D3429`;
}

export function renderMessageTemplate(
  template: string,
  lead?: { name?: string | null; company?: string | null }
) {
  return applyTemplate(template, {
    nome: lead?.name?.split(" ")[0] ?? "cliente",
    empresa: lead?.company ?? "seu projeto",
  });
}

export function mapWebhookStatus(
  raw: string
): MessageStatus | null {
  const s = raw.toLowerCase();
  if (["sent", "enviado", "sended"].includes(s)) return "SENT";
  if (["delivered", "entregue", "delivery_ack"].includes(s)) return "DELIVERED";
  if (["read", "lido", "read_ack", "played"].includes(s)) return "READ";
  if (["error", "failed", "erro"].includes(s)) return "ERROR";
  return null;
}
