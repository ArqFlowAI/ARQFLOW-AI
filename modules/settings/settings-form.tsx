"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { OrganizationSettings } from "@prisma/client";

export function SettingsForm({
  organization,
  settings,
}: {
  organization: { name: string; logoUrl: string; brandColor: string };
  settings: OrganizationSettings | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Escritório</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(fd) =>
              startTransition(async () => {
                const res = await fetch("/api/settings", {
                  method: "PATCH",
                  body: fd,
                });
                const data = await res.json();
                if (data.success) toast.success("Salvo!");
                else toast.error(data.error);
              })
            }
            className="space-y-4"
          >
            <div>
              <Label htmlFor="organizationName">Nome do escritório</Label>
              <Input
                id="organizationName"
                name="organizationName"
                defaultValue={organization.name}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">URL do logo</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={organization.logoUrl}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="brandColor">Cor da marca</Label>
              <Input
                id="brandColor"
                name="brandColor"
                type="color"
                defaultValue={organization.brandColor}
                className="mt-1 h-12"
              />
            </div>
            <Button type="submit" disabled={pending}>
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">WhatsApp (Z-API / Twilio)</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(fd) =>
              startTransition(async () => {
                const res = await fetch("/api/settings", {
                  method: "PATCH",
                  body: fd,
                });
                const data = await res.json();
                if (data.success) toast.success("Integração salva!");
              })
            }
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="whatsappEnabled"
                name="whatsappEnabled"
                defaultChecked={settings?.whatsappEnabled}
                className="rounded"
              />
              <Label htmlFor="whatsappEnabled">Ativar WhatsApp</Label>
            </div>
            <div>
              <Label htmlFor="whatsappProvider">Provedor padrão</Label>
              <select
                id="whatsappProvider"
                name="whatsappProvider"
                defaultValue={settings?.whatsappProvider ?? "ZAPI"}
                className="mt-1 flex h-11 w-full rounded-lg border border-brand-light/30 bg-white/80 px-3 text-sm"
              >
                <option value="ZAPI">Z-API (QR Code)</option>
                <option value="TWILIO">Twilio</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="twilioEnabled"
                name="twilioEnabled"
                defaultChecked={settings?.twilioEnabled}
                className="rounded"
              />
              <Label htmlFor="twilioEnabled">Twilio habilitado</Label>
            </div>
            <div>
              <Label htmlFor="zapiInstanceId">Z-API Instance ID</Label>
              <Input
                id="zapiInstanceId"
                name="zapiInstanceId"
                defaultValue={settings?.zapiInstanceId ?? ""}
                className="mt-1"
              />
            </div>
            <Button type="submit" variant="outline" disabled={pending}>
              Salvar integração
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
