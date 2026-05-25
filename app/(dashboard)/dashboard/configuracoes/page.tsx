import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/modules/settings/settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  const org = await prisma.organization.findUnique({
    where: { id: session!.organizationId },
    include: { settings: true, subscription: true },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações"
        description="Branding, integrações WhatsApp e preferências da conta"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-brand-light/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark/60">Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-xl font-bold">Operacional</p>
            <Badge className="mt-2">{org?.subscription?.status ?? "ACTIVE"}</Badge>
          </CardContent>
        </Card>
        <Card className="border-brand-light/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark/60">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-xl font-bold">
              {org?.settings?.whatsappEnabled ? "Ativo" : "Inativo"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-brand-light/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-dark/60">Slug</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{org?.slug}</p>
          </CardContent>
        </Card>
      </div>

      <SettingsForm
        organization={{
          name: org?.name ?? "",
          logoUrl: org?.logoUrl ?? "",
          brandColor: org?.brandColor ?? "#D6C2A1",
        }}
        settings={org?.settings ?? null}
      />
    </div>
  );
}
