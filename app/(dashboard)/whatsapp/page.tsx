import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/dashboard/page-header";
import { WhatsAppPageClient } from "@/modules/whatsapp/whatsapp-page";
import { getWhatsAppPageData } from "@/services/whatsapp-dashboard.service";

export default async function WhatsAppPage() {
  const session = await getSession();
  const data = await getWhatsAppPageData(session!.organizationId);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-light/20 bg-gradient-to-br from-brand-beige/50 via-brand-bg to-brand-light/20 p-8 dark:from-brand-dark/50 dark:via-brand-black dark:to-brand-dark/30">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-light/25 blur-3xl" />
        <PageHeader
          title="WhatsApp"
          description="Automações premium, QR Code, Z-API e Twilio — multi-tenant SaaS"
          className="relative border-0 p-0"
        />
      </div>

      <WhatsAppPageClient
        stats={data.stats}
        connection={data.connection}
        automations={data.automations}
        messages={data.messages}
      />
    </div>
  );
}
