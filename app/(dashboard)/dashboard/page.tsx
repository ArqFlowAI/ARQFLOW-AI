import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardCharts } from "@/components/dashboard/dashboard-chart";
import { PipelineWidget } from "@/components/dashboard/pipeline-widget";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { RecentRenders } from "@/components/dashboard/recent-renders";
import { RecentProposals } from "@/components/dashboard/recent-proposals";
import { CreditsWidget } from "@/components/dashboard/credits-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MobileQuickActions } from "@/components/dashboard/topbar";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getSession();
  const overview = await getDashboardOverview(session!.organizationId);
  const { stats } = overview;
  const firstName = session?.name?.split(" ")[0] ?? "Arquiteto";
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-light/20 bg-gradient-to-br from-brand-beige/40 via-brand-bg to-white/80 p-8 dark:from-brand-dark/40 dark:via-brand-black dark:to-brand-black/80">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-light/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-dark/60 dark:text-brand-beige/60">
              {greeting} · {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {firstName}, seu escritório está em movimento
            </h1>
            <p className="mt-2 text-sm text-brand-dark/70 dark:text-brand-beige/70">
              {session?.organizationName} · Plano {session?.plan}
            </p>
          </div>
          <div className="flex gap-6 text-center sm:text-right">
            <div>
              <p className="font-display text-2xl font-bold text-brand-dark">
                {stats.conversionRate}%
              </p>
              <p className="text-xs text-brand-dark/50">conversão</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-dark">
                {formatCurrency(stats.proposalsValue)}
              </p>
              <p className="text-xs text-brand-dark/50">em propostas</p>
            </div>
          </div>
        </div>
      </div>

      <MobileQuickActions />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Leads"
          value={stats.totalLeads}
          sublabel={`+${stats.leadsThisMonth} este mês`}
          icon="users"
          trend="up"
          accent="beige"
          delay={0}
        />
        <StatCard
          label="Conversão"
          value={`${stats.conversionRate}%`}
          sublabel="taxa de fechamento"
          icon="trending-up"
          accent="light"
          delay={0.05}
        />
        <StatCard
          label="Renders IA"
          value={stats.totalRenders}
          sublabel={`+${stats.rendersThisMonth} este mês`}
          icon="image"
          trend="up"
          accent="dark"
          delay={0.1}
        />
        <StatCard
          label="Conceitos"
          value={stats.totalConcepts}
          sublabel="gerados com IA"
          icon="lightbulb"
          accent="beige"
          delay={0.15}
        />
        <StatCard
          label="Projetos"
          value={stats.activeProjects}
          sublabel="ativos agora"
          icon="folder-kanban"
          accent="light"
          delay={0.2}
        />
        <StatCard
          label="Propostas"
          value={stats.totalProposals}
          sublabel={formatCurrency(stats.proposalsValue)}
          icon="file-text"
          accent="dark"
          delay={0.25}
        />
      </div>

      <DashboardCharts
        chartData={overview.chartData}
        pipeline={overview.pipeline}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <CreditsWidget
            remaining={stats.creditsRemaining}
            total={stats.creditsTotal}
            plan={session!.plan}
          />
          <QuickActions />
        </div>
        <div className="lg:col-span-4">
          <PipelineWidget pipeline={overview.pipeline} />
        </div>
        <div className="lg:col-span-4">
          <RecentLeads leads={overview.recentLeads} />
        </div>
      </div>

      <ActivityFeed
        leads={overview.recentLeads}
        renders={overview.recentRenders}
        budgets={overview.recentProposals}
        concepts={overview.recentConcepts}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRenders renders={overview.recentRenders} />
        <RecentProposals proposals={overview.recentProposals} />
      </div>

      {overview.recentConcepts.length > 0 && (
        <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Últimos conceitos</h3>
            <Link
              href="/dashboard/conceitos"
              className="text-xs font-medium text-brand-dark hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {overview.recentConcepts.map((c) => (
              <Link
                key={c.id}
                href="/dashboard/conceitos"
                className="rounded-xl border border-brand-light/15 p-4 transition-colors hover:bg-brand-beige/20"
              >
                <p className="font-medium text-sm">{c.title ?? c.environment}</p>
                <p className="text-xs text-brand-dark/50 mt-1">
                  {c.style} · {c.environment}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
