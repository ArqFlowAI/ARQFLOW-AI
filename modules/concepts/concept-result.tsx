"use client";

import { Badge } from "@/components/ui/badge";
import { ConceptPalette } from "@/modules/concepts/concept-palette";
import type { ConceptContent } from "@/types";
import { Lightbulb, Sun, Layers, Sparkles, Layout, Sofa } from "lucide-react";

export function ConceptResult({ content }: { content: ConceptContent }) {
  const paragraphs = content.description.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {content.title}
        </h2>
        {content.moodKeywords && content.moodKeywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {content.moodKeywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-brand-dark/85">
            {p}
          </p>
        ))}
      </div>

      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-dark/50">
          <Layers className="h-4 w-4" />
          Paleta cromática
        </h3>
        <ConceptPalette palette={content.palette} size="lg" />
      </section>

      <section className="rounded-2xl bg-brand-beige/25 p-5 dark:bg-brand-dark/20">
        <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
          <Sun className="h-4 w-4 text-brand-light" />
          Iluminação
        </h3>
        <p className="text-sm leading-relaxed text-brand-dark/80">
          {content.lighting}
        </p>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-dark/50">
          <Layers className="h-4 w-4" />
          Materiais e acabamentos
        </h3>
        <div className="flex flex-wrap gap-2">
          {content.materials.map((m) => (
            <Badge key={m} className="text-xs">
              {m}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-dark/50">
          <Sparkles className="h-4 w-4" />
          Diferenciais
        </h3>
        <ul className="space-y-2">
          {content.differentials.map((d) => (
            <li
              key={d}
              className="flex gap-2 text-sm text-brand-dark/80 before:content-['•'] before:text-brand-light"
            >
              {d}
            </li>
          ))}
        </ul>
      </section>

      {content.furnitureDirection && (
        <section className="rounded-2xl border border-brand-light/20 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
            <Sofa className="h-4 w-4" />
            Mobiliário e marcenaria
          </h3>
          <p className="text-sm leading-relaxed text-brand-dark/80">
            {content.furnitureDirection}
          </p>
        </section>
      )}

      {content.layoutTips && content.layoutTips.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-brand-dark/50">
            <Layout className="h-4 w-4" />
            Dicas de layout
          </h3>
          <ul className="space-y-2">
            {content.layoutTips.map((tip) => (
              <li key={tip} className="text-sm text-brand-dark/75">
                → {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-gradient-to-br from-brand-dark/5 to-brand-beige/30 p-6 dark:from-brand-dark/30">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-brand-dark" />
          Storytelling
        </h3>
        <p className="text-sm leading-relaxed italic text-brand-dark/85 whitespace-pre-line">
          {content.storytelling}
        </p>
      </section>
    </div>
  );
}
