import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { renderRepository } from "@/repositories/render.repository";
import { RenderGenerator, RenderGallery } from "@/modules/renders";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleStats } from "@/components/dashboard/module-stats";
import { Sparkles } from "lucide-react";

export default async function RendersPage() {
  const session = await getSession();
  const orgId = session!.organizationId;

  const [renders, total, favorites, processing, completed] = await Promise.all([
    renderRepository.findByOrg(orgId),
    renderRepository.countByOrg(orgId),
    prisma.render.count({
      where: { organizationId: orgId, isFavorite: true },
    }),
    renderRepository.countByOrg(orgId, "PROCESSING").then(async (proc) => {
      const pending = await renderRepository.countByOrg(orgId, "PENDING");
      return proc + pending;
    }),
    renderRepository.countByOrg(orgId, "COMPLETED"),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Render IA"
        description="Renders fotorrealistas via Replicate Flux Schnell — upload automático no Supabase Storage"
      />

      <ModuleStats
        stats={[
          { label: "Total renders", value: total, icon: "image" },
          { label: "Concluídos", value: completed, icon: "check-circle" },
          { label: "Processando", value: processing, icon: "loader" },
          { label: "Favoritos", value: favorites, icon: "heart" },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <RenderGenerator isReplicateConfigured={!!process.env.REPLICATE_API_TOKEN} />
        </div>
        <div className="lg:col-span-3 rounded-2xl border border-brand-light/20 bg-brand-beige/10 p-6 dark:bg-brand-dark/10">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Como funciona
          </h3>
          <ol className="mt-4 space-y-3 text-sm text-brand-dark/75">
            <li>
              <strong>1.</strong> Descreva o ambiente e escolha estilo + proporção
            </li>
            <li>
              <strong>2.</strong> A API Replicate (Flux Schnell) gera a imagem em ~10–30s
            </li>
            <li>
              <strong>3.</strong> A imagem é salva no bucket Supabase{" "}
              <code className="text-xs bg-white/50 px-1 rounded">renders</code>
            </li>
            <li>
              <strong>4.</strong> Configure REPLICATE_API_TOKEN para habilitar geração
            </li>
          </ol>
          <p className="mt-4 text-xs text-brand-dark/50">
            Configure{" "}
            <code className="bg-white/50 px-1 rounded">REPLICATE_API_TOKEN</code> no
            .env
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-4">
          Galeria ({renders.length})
        </h2>
        <RenderGallery renders={renders} />
      </div>
    </div>
  );
}
