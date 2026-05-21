"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConceptPalette } from "@/modules/concepts/concept-palette";
import { ConceptDetailDialog } from "@/modules/concepts/concept-detail-dialog";
import type { ConceptContent } from "@/types";
import type { Concept } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Eye, Sparkles } from "lucide-react";

type ConceptWithMeta = Concept & {
  user: { name: string | null };
  project?: { id: string; name: string } | null;
};

export function ConceptCard({ concept }: { concept: ConceptWithMeta }) {
  const [open, setOpen] = useState(false);
  const content = concept.content as ConceptContent;

  return (
    <>
      <Card className="group flex flex-col border-brand-light/15 transition-all hover:shadow-lg hover:ring-1 hover:ring-brand-light/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-display text-lg leading-tight line-clamp-2">
              {content.title ?? concept.title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {concept.style}
            </Badge>
          </div>
          <p className="text-xs text-brand-dark/50">
            {concept.environment}
            {concept.area ? ` · ${concept.area} m²` : ""} ·{" "}
            {formatDate(concept.createdAt)}
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="text-sm text-brand-dark/80 line-clamp-3 flex-1">
            {content.description.split("\n\n")[0]}
          </p>

          {content.moodKeywords && content.moodKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.moodKeywords.slice(0, 3).map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-brand-beige/40 px-2 py-0.5 text-[10px] text-brand-dark/70"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {content.palette && (
            <ConceptPalette palette={content.palette.slice(0, 5)} size="sm" />
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 mt-auto"
            onClick={() => setOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver conceito completo
          </Button>
        </CardContent>
      </Card>

      {open && (
        <ConceptDetailDialog concept={concept} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function ConceptEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-light/30 py-16 text-center col-span-full">
      <Sparkles className="mx-auto h-12 w-12 text-brand-light/50" />
      <p className="mt-4 text-brand-dark/50">
        Gere seu primeiro conceito com o gerador ao lado
      </p>
    </div>
  );
}
