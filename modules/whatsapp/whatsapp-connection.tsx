"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  refreshConnectionAction,
  setProviderAction,
} from "@/actions/whatsapp.actions";
import type { WhatsAppConnectionDto } from "@/types/whatsapp";
import { Loader2, QrCode, Smartphone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  DISCONNECTED: "Desconectado",
  CONNECTING: "Conectando",
  QR_PENDING: "Aguardando QR",
  CONNECTED: "Conectado",
  ERROR: "Erro",
};

export function WhatsAppConnection({
  connection: initial,
}: {
  connection: WhatsAppConnectionDto;
}) {
  const [connection, setConnection] = useState(initial);
  const [pending, startTransition] = useTransition();

  function refreshQr() {
    startTransition(async () => {
      const res = await refreshConnectionAction();
      if (res.success) {
        setConnection((c) => ({
          ...c,
          status: res.status as WhatsAppConnectionDto["status"],
          qrCode: res.qrCode ?? c.qrCode,
        }));
        toast.success("Status atualizado");
      } else {
        toast.error("Não foi possível atualizar");
      }
    });
  }

  function switchProvider(provider: "ZAPI" | "TWILIO") {
    startTransition(async () => {
      const res = await setProviderAction(provider);
      if (res.success) {
        setConnection((c) => ({ ...c, provider }));
        toast.success(
          provider === "ZAPI" ? "Modo Z-API selecionado" : "Modo Twilio selecionado"
        );
        if (provider === "ZAPI") refreshQr();
      }
    });
  }

  return (
    <Card className="overflow-hidden border-brand-light/25 bg-gradient-to-br from-brand-beige/30 to-white/80 dark:from-brand-dark/40 dark:to-brand-black/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Conexão WhatsApp
          </CardTitle>
          <Badge
            variant={
              connection.status === "CONNECTED" ? "success" : "secondary"
            }
          >
            {statusLabels[connection.status] ?? connection.status}
          </Badge>
        </div>
        <p className="text-xs text-brand-dark/60">
          Z-API (QR Code) ou Twilio WhatsApp Business API
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={connection.provider === "ZAPI" ? "default" : "outline"}
            className="flex-1"
            onClick={() => switchProvider("ZAPI")}
            disabled={pending}
          >
            Z-API
          </Button>
          <Button
            type="button"
            size="sm"
            variant={connection.provider === "TWILIO" ? "default" : "outline"}
            className="flex-1"
            onClick={() => switchProvider("TWILIO")}
            disabled={pending}
          >
            Twilio
          </Button>
        </div>

        {connection.provider === "ZAPI" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 rounded-xl border border-brand-light/20 bg-white/60 p-6 dark:bg-brand-black/40"
          >
            {connection.status === "CONNECTED" ? (
              <div className="text-center">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  WhatsApp conectado
                </p>
                {connection.phoneNumber && (
                  <p className="mt-1 text-xs text-brand-dark/50">
                    {connection.phoneNumber}
                  </p>
                )}
              </div>
            ) : connection.qrCode ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={connection.qrCode}
                  alt="QR Code WhatsApp"
                  width={220}
                  height={220}
                  className="rounded-lg border border-brand-light/30"
                />
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-brand-dark/60">
                  <QrCode className="h-3.5 w-3.5" />
                  Escaneie no WhatsApp → Aparelhos conectados
                </p>
              </div>
            ) : (
              <p className="text-sm text-brand-dark/60 text-center">
                Clique em atualizar para gerar o QR Code
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshQr}
              disabled={pending}
              className="w-full"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {pending ? "Atualizando..." : "Atualizar QR Code"}
            </Button>
          </motion.div>
        )}

        {connection.provider === "TWILIO" && (
          <p
            className={cn(
              "rounded-xl border border-brand-light/20 bg-brand-beige/20 px-4 py-3 text-xs text-brand-dark/70",
              !connection.twilioEnabled && "border-amber-200/50 bg-amber-50/50"
            )}
          >
            {connection.twilioEnabled
              ? "Twilio ativo. Configure TWILIO_* no .env e o webhook de status em /api/whatsapp/webhooks/twilio."
              : "Ative Twilio em Configurações e defina as variáveis de ambiente."}
          </p>
        )}

        {!connection.whatsappEnabled && (
          <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
            Ative a integração em Configurações → WhatsApp para enviar mensagens.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
