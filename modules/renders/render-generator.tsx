"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateRenderAction } from "@/actions/render.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RENDER_ASPECT_RATIOS,
  RENDER_STYLE_PRESETS,
  RENDER_PROMPT_SUGGESTIONS,
  RENDER_CREDIT_COST,
} from "@/lib/renders/constants";
import { toast } from "sonner";
import { Image, Loader2, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function RenderGenerator({ credits }: { credits: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photoreal");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const canGenerate = credits >= RENDER_CREDIT_COST;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("style", style);
    fd.set("aspectRatio", aspectRatio);

    startTransition(async () => {
      const r = await generateRenderAction(fd);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Render enviado ao Replicate! Acompanhe na galeria.");
        setPrompt("");
        router.refresh();
      }
    });
  }

  return (
    <Card className="border-brand-light/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Wand2 className="h-5 w-5 text-brand-light" />
          Gerar render fotorrealista
        </CardTitle>
        <p className="text-sm text-brand-dark/60">
          Replicate Flux Schnell · {RENDER_CREDIT_COST} créditos por imagem
        </p>
        <p
          className={cn(
            "text-xs font-medium",
            canGenerate ? "text-emerald-700" : "text-red-600"
          )}
        >
          {credits} créditos disponíveis
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Estilo visual</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RENDER_STYLE_PRESETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    style === s.id
                      ? "bg-brand-dark text-brand-bg"
                      : "bg-brand-beige/40 text-brand-dark/70 hover:bg-brand-beige/60"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="style" value={style} />
          </div>

          <div>
            <Label>Proporção</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RENDER_ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => setAspectRatio(ar.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    aspectRatio === ar.value
                      ? "border-brand-dark bg-brand-dark/5"
                      : "border-brand-light/30"
                  )}
                >
                  {ar.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="aspectRatio" value={aspectRatio} />
          </div>

          <div>
            <Label htmlFor="prompt">Descrição do ambiente *</Label>
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 flex w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 py-2 text-sm dark:bg-brand-black/40"
              placeholder="Descreva o ambiente, materiais, mobiliário, iluminação..."
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {RENDER_PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="rounded-full bg-brand-beige/30 px-2 py-0.5 text-[10px] text-brand-dark/60 hover:bg-brand-beige/50"
                >
                  + exemplo
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="negativePrompt">Evitar na imagem (opcional)</Label>
            <input
              id="negativePrompt"
              name="negativePrompt"
              className="mt-1 flex h-10 w-full rounded-lg border border-brand-light/30 px-4 text-sm"
              placeholder="cartoon, baixa qualidade, texto, pessoas distorcidas..."
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
                Enviando para Replicate...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar render IA
              </>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-center text-xs text-red-600">
              Créditos insuficientes. Faça upgrade em Billing.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
