"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  toggleRenderFavoriteAction,
  retryRenderAction,
  deleteRenderAction,
} from "@/actions/render.actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Download,
  Loader2,
  RefreshCw,
  Trash2,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { Render } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3000;

const statusLabels: Record<string, string> = {
  PENDING: "Na fila",
  PROCESSING: "Gerando",
  COMPLETED: "Pronto",
  FAILED: "Falhou",
};

export function RenderGallery({ renders: initial }: { renders: Render[] }) {
  const router = useRouter();
  const [renders, setRenders] = useState(initial);

  useEffect(() => {
    setRenders(initial);
  }, [initial]);

  const pollStatus = useCallback(async () => {
    const pending = renders.filter(
      (r) => r.status === "PENDING" || r.status === "PROCESSING"
    );
    if (pending.length === 0) return;

    const updates = await Promise.all(
      pending.map(async (r) => {
        try {
          const res = await fetch(`/api/renders/${r.id}`);
          const json = await res.json();
          return json.success ? (json.data as Render) : r;
        } catch {
          return r;
        }
      })
    );

    const hasChange = updates.some(
      (u, i) =>
        u.status !== pending[i].status || u.imageUrl !== pending[i].imageUrl
    );

    if (hasChange) {
      setRenders((prev) =>
        prev.map((r) => {
          const updated = updates.find((u) => u.id === r.id);
          return updated ?? r;
        })
      );
      router.refresh();
    }
  }, [renders, router]);

  useEffect(() => {
    const hasPending = renders.some(
      (r) => r.status === "PENDING" || r.status === "PROCESSING"
    );
    if (!hasPending) return;

    pollStatus();
    const id = setInterval(pollStatus, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [renders, pollStatus]);

  if (renders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-light/30 py-16 text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-brand-light/50" />
        <p className="mt-4 text-brand-dark/50">
          Nenhum render ainda. Gere o primeiro acima.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {renders.map((render) => (
        <RenderCard key={render.id} render={render} onUpdate={router.refresh} />
      ))}
    </div>
  );
}

function RenderCard({
  render,
  onUpdate,
}: {
  render: Render;
  onUpdate: () => void;
}) {
  const isLoading =
    render.status === "PENDING" || render.status === "PROCESSING";
  const meta = render.metadata as { aspectRatio?: string } | null;

  return (
    <Card className="overflow-hidden group border-brand-light/15">
      <div className="relative aspect-video bg-brand-beige/20">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-dark" />
            <p className="text-xs text-brand-dark/60 text-center">
              Replicate está gerando sua imagem...
            </p>
          </div>
        ) : render.status === "FAILED" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-xs text-red-600">Falha na geração</p>
          </div>
        ) : render.imageUrl ? (
          <Image
            src={render.imageUrl}
            alt={render.prompt}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={render.imageUrl.includes("replicate.delivery")}
          />
        ) : null}

        <div className="absolute top-2 right-2 flex gap-1">
          <Badge
            variant={render.status === "COMPLETED" ? "success" : "secondary"}
            className={cn(isLoading && "animate-pulse")}
          >
            {statusLabels[render.status] ?? render.status}
          </Badge>
          {meta?.aspectRatio && (
            <Badge variant="outline" className="bg-white/80 text-[10px]">
              {meta.aspectRatio}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm line-clamp-2 text-brand-dark/80">{render.prompt}</p>
        <p className="text-[10px] text-brand-dark/40 mt-1">
          {formatDate(render.createdAt)}
          {render.provider === "replicate" && " · Flux Schnell"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              const r = await toggleRenderFavoriteAction(render.id);
              if ("error" in r && r.error) toast.error(r.error);
              else {
                toast.success(
                  render.isFavorite ? "Removido dos favoritos" : "Favoritado!"
                );
                onUpdate();
              }
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                render.isFavorite && "fill-red-500 text-red-500"
              )}
            />
          </Button>
          {render.imageUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a
                href={render.imageUrl}
                download={`render-${render.id}.webp`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          {render.status === "FAILED" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const r = await retryRenderAction(render.id);
                if ("error" in r && r.error) toast.error(r.error);
                else {
                  toast.success("Reprocessando render...");
                  onUpdate();
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            onClick={async () => {
              if (!confirm("Excluir este render?")) return;
              const r = await deleteRenderAction(render.id);
              if ("error" in r && r.error) toast.error(r.error);
              else {
                toast.success("Render excluído");
                onUpdate();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
