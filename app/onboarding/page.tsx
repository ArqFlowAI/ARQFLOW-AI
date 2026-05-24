"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const steps = [
  { title: "Bem-vindo ao ARQFLOW AI", desc: "Vamos configurar seu escritório em 3 passos." },
  { title: "Qual seu foco?", desc: "Selecione sua área principal de atuação." },
  { title: "Pronto!", desc: "Sua conta está configurada. Acesse o dashboard." },
];

const focuses = ["Arquitetura", "Design de Interiores", "Marcenaria", "Móveis Planejados", "Escritório Criativo"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue =
    (step === 0 && organizationName.trim().length > 0) ||
    (step === 1 && focus.length > 0) ||
    step === 2;

  async function complete() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus, organizationName }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Erro ao salvar dados. Tente novamente.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand-dark" : "bg-brand-beige"}`}
              />
            ))}
          </div>
          <CardTitle className="font-display">{steps[step].title}</CardTitle>
          <p className="text-sm text-brand-dark/70">{steps[step].desc}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {step === 0 && (
            <div>
              <Label htmlFor="organizationName">Nome do escritório</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                className="mt-1"
                placeholder="Seu escritório"
              />
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {focuses.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFocus(f)}
                  className={`rounded-lg border p-4 text-sm transition-all ${
                    focus === f
                      ? "border-brand-dark bg-brand-dark text-brand-bg"
                      : "border-brand-light/30 hover:border-brand-dark"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 py-8 text-center text-brand-dark/70">
              <p>Seu escritório foi configurado com o plano PREMIUM.</p>
              <p>Todos os recursos estão liberados: CRM, WhatsApp, renders IA e automações.</p>
            </div>
          )}
          <div className="mt-8 flex justify-between">
            {step > 0 && (
              <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button
              type="button"
              className="ml-auto"
              disabled={!canContinue || loading}
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else complete();
              }}
            >
              {loading ? "Salvando..." : step < 2 ? "Continuar" : "Ir para Dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
