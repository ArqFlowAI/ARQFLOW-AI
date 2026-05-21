"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { sendWhatsAppAction } from "@/actions/whatsapp.actions";

export function WhatsAppComposer({
  enabled,
  defaultPhone,
  leadId,
}: {
  enabled: boolean;
  defaultPhone?: string;
  leadId?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="h-fit border-brand-light/25 bg-gradient-to-b from-white/90 to-brand-beige/20 dark:from-brand-black/50 dark:to-brand-dark/20">
      <CardHeader>
        <CardTitle className="font-display text-lg">Enviar mensagem</CardTitle>
        <p className="text-xs text-brand-dark/60">
          {enabled
            ? "Envio via Z-API ou Twilio conforme provedor"
            : "Ative em Configurações → WhatsApp"}
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await sendWhatsAppAction({
                phone: String(fd.get("phone")),
                message: String(fd.get("message")),
                leadId,
              });
              if (res.success) {
                toast.success("Mensagem enviada!");
                e.currentTarget.reset();
              } else {
                toast.error(res.error ?? "Erro ao enviar");
              }
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="phone">Telefone (com DDD)</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={defaultPhone}
              placeholder="5511999999999"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="mt-1 flex w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 py-2 text-sm dark:bg-brand-black/40"
              placeholder="Olá! Gostaria de falar sobre seu projeto..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending || !enabled}>
            <Send className="h-4 w-4" />
            {pending ? "Enviando..." : "Enviar WhatsApp"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
