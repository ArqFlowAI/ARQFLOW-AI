"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateConceptAction } from "@/actions/concept.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConceptResult } from "@/modules/concepts/concept-result";
import {
  CONCEPT_ENVIRONMENTS,
  CONCEPT_STYLES,
} from "@/lib/concepts/constants";
import type { ConceptContent } from "@/types";
import { toast } from "sonner";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConceptGenerator() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ConceptContent | null>(null);
  const [customEnv, setCustomEnv] = useState(false);
  const [customStyle, setCustomStyle] = useState(false);

  const canGenerate = true;

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const r = await generateConceptAction(formData);
      if ("error" in r && r.error) {
        if ((r as any).code === "OPENAI_NOT_CONFIGURED") {
          toast.error("OpenAI não configurada. Defina OPENAI_API_KEY no .env");
        } else {
          toast.error(r.error);
        }
        return;
      }
      if ("data" in r && r.data) {
        const content = r.data.content as ConceptContent;
        setResult(content);
        toast.success("Conceito gerado com sucesso!");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="border-brand-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Wand2 className="h-5 w-5 text-brand-light" />
            Gerar conceito arquitetônico
          </CardTitle>
          <p className="text-sm text-brand-dark/60">
            Powered by OpenAI GPT-4o — gere conceitos diretamente (verifique OPENAI_API_KEY)
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="environment">Ambiente *</Label>
                <button
                  type="button"
                  className="text-[10px] text-brand-dark/50 hover:underline"
                  onClick={() => setCustomEnv(!customEnv)}
                >
                  {customEnv ? "Lista" : "Personalizar"}
                </button>
              </div>
              {customEnv ? (
                <Input
                  id="environment"
                  name="environment"
                  required
                  placeholder="Ex: Loft industrial com mezanino"
                  className="mt-1"
                />
              ) : (
                <select
                  id="environment"
                  name="environment"
                  required
                  className="mt-1 flex h-11 w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 text-sm dark:bg-brand-black/40"
                >
                  <option value="">Selecione o ambiente</option>
                  {CONCEPT_ENVIRONMENTS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="style">Estilo *</Label>
                <button
                  type="button"
                  className="text-[10px] text-brand-dark/50 hover:underline"
                  onClick={() => setCustomStyle(!customStyle)}
                >
                  {customStyle ? "Lista" : "Personalizar"}
                </button>
              </div>
              {customStyle ? (
                <Input
                  id="style"
                  name="style"
                  required
                  placeholder="Ex: Neo-clássico com toques contemporâneos"
                  className="mt-1"
                />
              ) : (
                <select
                  id="style"
                  name="style"
                  required
                  className="mt-1 flex h-11 w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 text-sm dark:bg-brand-black/40"
                >
                  <option value="">Selecione o estilo</option>
                  {CONCEPT_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="area">Metragem (m²)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  step="0.1"
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="budget">Orçamento (R$)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min={0}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="references">Referências visuais</Label>
              <Input
                id="references"
                name="references"
                placeholder="Pinterest, revistas, artistas, marcas..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Briefing do cliente</Label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="mt-1 flex w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 py-2 text-sm dark:bg-brand-black/40"
                placeholder="Perfil do cliente, restrições, desejos, cores a evitar..."
              />
            </div>

            <Button
              type="submit"
              disabled={pending || !canGenerate}
              className="w-full gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando com OpenAI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar conceito IA
                </>
              )}
            </Button>

            {!canGenerate && (
              <p className="text-center text-xs text-red-600">
                Créditos insuficientes.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "border-brand-light/20 min-h-[400px]",
          pending && "opacity-90"
        )}
      >
        <CardHeader>
          <CardTitle className="font-display text-lg">Resultado</CardTitle>
          <p className="text-xs text-brand-dark/50">
            Paleta, materiais, iluminação e storytelling
          </p>
        </CardHeader>
        <CardContent>
          {pending ? (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center gap-2 text-sm text-brand-dark/60">
                <Loader2 className="h-5 w-5 animate-spin" />
                A IA está criando seu conceito...
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 animate-pulse rounded-lg bg-brand-beige/40"
                    style={{ width: `${100 - i * 12}%` }}
                  />
                ))}
              </div>
            </div>
          ) : result ? (
            <ConceptResult content={result} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-12 w-12 text-brand-light/40" />
              <p className="mt-4 text-sm text-brand-dark/50 max-w-xs">
                Preencha o briefing e gere um conceito completo para apresentar ao
                cliente
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
