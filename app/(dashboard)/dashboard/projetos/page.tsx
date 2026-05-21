import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/modules/projects/project-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleStats } from "@/components/dashboard/module-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FolderKanban, Image as ImageIcon, Lightbulb, FileText } from "lucide-react";

export default async function ProjetosPage() {
  const session = await getSession();
  const orgId = session!.organizationId;

  const [projects, active, total] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { concepts: true, renders: true, budgets: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.count({
      where: { organizationId: orgId, status: "active" },
    }),
    prisma.project.count({ where: { organizationId: orgId } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projetos"
        description="Centralize conceitos, renders e orçamentos por cliente"
      />

      <ModuleStats
        stats={[
          { label: "Total projetos", value: total, icon: "folder-kanban" },
          { label: "Ativos", value: active, icon: "folder-kanban" },
        ]}
      />

      <ProjectForm />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="group transition-shadow hover:shadow-lg border-brand-light/15"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-display text-lg group-hover:text-brand-dark">
                  {p.name}
                </CardTitle>
                <Badge variant={p.status === "active" ? "success" : "secondary"}>
                  {p.status}
                </Badge>
              </div>
              {p.clientName && (
                <p className="text-sm text-brand-dark/60">{p.clientName}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-xs text-brand-dark/60">
                <span className="flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" />
                  {p._count.concepts}
                </span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                  {p._count.renders}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {p._count.budgets}
                </span>
              </div>
              <p className="text-xs text-brand-dark/40 mt-4">
                Atualizado {formatDate(p.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-light/30 py-16 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-brand-light/50" />
          <p className="mt-4 text-brand-dark/50">Crie seu primeiro projeto acima</p>
        </div>
      )}
    </div>
  );
}
