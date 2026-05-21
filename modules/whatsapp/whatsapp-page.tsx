"use client";

import { WhatsAppStats } from "@/modules/whatsapp/whatsapp-stats";
import { WhatsAppConnection } from "@/modules/whatsapp/whatsapp-connection";
import { WhatsAppAutomations } from "@/modules/whatsapp/whatsapp-automations";
import { WhatsAppMessages } from "@/modules/whatsapp/whatsapp-messages";
import { WhatsAppComposer } from "@/modules/whatsapp/whatsapp-composer";
import type {
  WhatsAppAutomationDto,
  WhatsAppConnectionDto,
  WhatsAppDashboardStats,
  WhatsAppMessageDto,
} from "@/types/whatsapp";

export function WhatsAppPageClient({
  stats,
  connection,
  automations,
  messages,
}: {
  stats: WhatsAppDashboardStats;
  connection: WhatsAppConnectionDto;
  automations: WhatsAppAutomationDto[];
  messages: WhatsAppMessageDto[];
}) {
  return (
    <div className="space-y-8">
      <WhatsAppStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WhatsAppAutomations automations={automations} />
          <WhatsAppMessages messages={messages} />
        </div>
        <div className="space-y-6">
          <WhatsAppConnection connection={connection} />
          <WhatsAppComposer enabled={connection.whatsappEnabled} />
        </div>
      </div>
    </div>
  );
}
