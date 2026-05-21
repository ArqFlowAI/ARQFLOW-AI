import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, ImageIcon } from "lucide-react";
import type { Render } from "@prisma/client";

export function RecentRenders({ renders }: { renders: Render[] }) {
  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Renders recentes</h3>
        <Link
          href="/dashboard/renders"
          className="flex items-center gap-1 text-xs font-medium text-brand-dark hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {renders.length === 0 ? (
          <p className="col-span-2 py-8 text-center text-sm text-brand-dark/50">
            Nenhum render gerado
          </p>
        ) : (
          renders.map((render) => (
            <Link
              key={render.id}
              href="/dashboard/renders"
              className="group relative aspect-video overflow-hidden rounded-xl bg-brand-beige/30"
            >
              {render.status === "COMPLETED" && render.imageUrl ? (
                <Image
                  src={render.imageUrl}
                  alt={render.prompt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="200px"
                />
              ) : render.status === "PROCESSING" || render.status === "PENDING" ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-dark" />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-brand-light/50" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-black/80 to-transparent p-2">
                <p className="line-clamp-1 text-[10px] text-brand-bg">
                  {render.prompt}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
