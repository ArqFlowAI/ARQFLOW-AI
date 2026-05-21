import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Image,
  Lightbulb,
  FileText,
  ArrowRight,
} from "lucide-react";
import type { Lead, Render, Budget, Concept } from "@prisma/client";

type ActivityItem = {
  id: string;
  type: "lead" | "render" | "concept" | "budget";
  title: string;
  subtitle: string;
  date: Date;
  href: string;
};

function buildActivities(
  leads: Lead[],
  renders: Render[],
  budgets: Budget[],
  concepts: Concept[]
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      type: "lead" as const,
      title: `Lead: ${l.name}`,
      subtitle: l.company ?? l.email ?? "Novo no CRM",
      date: l.updatedAt,
      href: "/dashboard/crm",
    })),
    ...renders.map((r) => ({
      id: `render-${r.id}`,
      type: "render" as const,
      title: `Render: ${r.prompt?.slice(0, 40) ?? "Imagem IA"}`,
      subtitle: r.status,
      date: r.createdAt,
      href: "/dashboard/renders",
    })),
    ...budgets.map((b) => ({
      id: `budget-${b.id}`,
      type: "budget" as const,
      title: `Orçamento: ${b.title}`,
      subtitle: b.clientName ?? "Proposta",
      date: b.createdAt,
      href: "/dashboard/orcamentos",
    })),
    ...concepts.map((c) => ({
      id: `concept-${c.id}`,
      type: "concept" as const,
      title: `Conceito: ${c.title ?? c.environment}`,
      subtitle: `${c.style} · ${c.environment}`,
      date: c.createdAt,
      href: "/dashboard/conceitos",
    })),
  ];

  return items
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);
}

const icons = {
  lead: Users,
  render: Image,
  concept: Lightbulb,
  budget: FileText,
};

const colors = {
  lead: "bg-brand-beige/50 text-brand-dark",
  render: "bg-brand-light/30 text-brand-dark",
  concept: "bg-brand-dark/10 text-brand-dark",
  budget: "bg-brand-beige/70 text-brand-dark",
};

export function ActivityFeed({
  leads,
  renders,
  budgets,
  concepts,
}: {
  leads: Lead[];
  renders: Render[];
  budgets: Budget[];
  concepts: Concept[];
}) {
  const activities = buildActivities(leads, renders, budgets, concepts);

  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Atividade recente</h3>
          <p className="text-xs text-brand-dark/50 mt-0.5">
            Últimas movimentações do escritório
          </p>
        </div>
        <Link
          href="/dashboard/crm"
          className="flex items-center gap-1 text-xs font-medium hover:underline"
        >
          Ver tudo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-1">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-dark/50">
            Nenhuma atividade ainda
          </p>
        ) : (
          activities.map((item) => {
            const Icon = icons[item.type];
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-brand-beige/25"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[item.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-brand-dark/50">
                    {item.subtitle}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-brand-dark/40">
                  {formatDate(item.date)}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
