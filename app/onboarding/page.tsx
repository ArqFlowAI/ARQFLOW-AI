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
  const [loading, setLoading] = useState(false);

  async function complete() {
    setLoading(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus }),
    });
    router.push("/dashboard");
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
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {focuses.map((f) => (
                <button
                  key={f}
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
          {step === 0 && (
            <div>
              <Label>Nome do escritório</Label>
              <Input className="mt-1" placeholder="Seu escritório" />
            </div>
          )}
          {step === 2 && (
            <p className="text-center text-brand-dark/70 py-8">
              Tudo pronto! Comece gerando seu primeiro conceito ou render.
            </p>
          )}
          <div className="mt-8 flex justify-between">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button
              className="ml-auto"
              disabled={step === 1 && !focus}
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
