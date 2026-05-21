import type {
  MessageStatus,
  WhatsAppAutomationType,
  WhatsAppConnectionStatus,
  WhatsAppProvider,
} from "@prisma/client";

export type WhatsAppDashboardStats = {
  totalMessages: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  errorCount: number;
  responseRate: number;
  conversionRate: number;
  activeLeads: number;
  activeAutomations: number;
};

export type WhatsAppConnectionDto = {
  provider: WhatsAppProvider;
  status: WhatsAppConnectionStatus;
  phoneNumber: string | null;
  displayName: string | null;
  qrCode: string | null;
  qrExpiresAt: string | null;
  zapiInstanceId: string | null;
  whatsappEnabled: boolean;
  twilioEnabled: boolean;
};

export type WhatsAppAutomationDto = {
  id: string;
  type: WhatsAppAutomationType;
  name: string;
  description: string | null;
  status: string;
  template: string;
  trigger: Record<string, unknown>;
  delayMinutes: number;
  runsCount: number;
  lastRunAt: string | null;
  icon: string;
};

export type WhatsAppMessageDto = {
  id: string;
  content: string;
  phone: string | null;
  direction: string;
  status: MessageStatus;
  leadName: string | null;
  automationName: string | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
};
