import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types";
import type { DashboardOverview, ChartPoint } from "@/types/dashboard";
import { CRM_STAGES } from "@/lib/crm/constants";
import { startOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LeadStage } from "@prisma/client";

export async function getDashboardStats(
  organizationId: string
): Promise<DashboardStats> {
  const overview = await getDashboardOverview(organizationId);
  return {
    totalLeads: overview.stats.totalLeads,
    leadsThisMonth: overview.stats.leadsThisMonth,
    conversionRate: overview.stats.conversionRate,
    totalRenders: overview.stats.totalRenders,
    rendersThisMonth: overview.stats.rendersThisMonth,
    totalConcepts: overview.stats.totalConcepts,
    activeProjects: overview.stats.activeProjects,
    creditsRemaining: overview.stats.creditsRemaining,
    automationsActive: overview.stats.automationsActive,
  };
}

export async function getDashboardOverview(
  organizationId: string
): Promise<DashboardOverview> {
  const monthStart = startOfMonth(new Date());
  const sixMonthsAgo = subMonths(monthStart, 5);

  const [
    totalLeads,
    leadsThisMonth,
    closedLeads,
    totalRenders,
    rendersThisMonth,
    totalConcepts,
    activeProjects,
    subscription,
    automationsActive,
    totalProposals,
    proposalsAgg,
    leads,
    renders,
    budgets,
    concepts,
    leadsByStage,
    allLeads,
    allRenders,
    allConcepts,
  ] = await Promise.all([
    prisma.lead.count({ where: { organizationId } }),
    prisma.lead.count({
      where: { organizationId, createdAt: { gte: monthStart } },
    }),
    prisma.lead.count({
      where: { organizationId, stage: "FECHADO" },
    }),
    prisma.render.count({ where: { organizationId } }),
    prisma.render.count({
      where: { organizationId, createdAt: { gte: monthStart } },
    }),
    prisma.concept.count({ where: { organizationId } }),
    prisma.project.count({
      where: { organizationId, status: "active" },
    }),
    prisma.subscription.findUnique({ where: { organizationId } }),
    prisma.automation.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    prisma.budget.count({ where: { organizationId } }),
    prisma.budget.aggregate({
      where: { organizationId },
      _sum: { total: true },
    }),
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        assignee: { select: { name: true } },
      },
    }),
    prisma.render.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.budget.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.concept.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.lead.groupBy({
      by: ["stage"],
      where: { organizationId },
      _count: true,
    }),
    prisma.lead.findMany({
      where: { organizationId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.render.findMany({
      where: { organizationId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.concept.findMany({
      where: { organizationId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const conversionRate =
    totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const chartData = buildChartData(allLeads, allRenders, allConcepts);

  const stageCountMap = Object.fromEntries(
    leadsByStage.map((s) => [s.stage, s._count])
  ) as Record<LeadStage, number>;

  const maxPipeline = Math.max(
    ...CRM_STAGES.map((s) => stageCountMap[s.id as LeadStage] ?? 0),
    1
  );

  const pipeline = CRM_STAGES.map((s) => ({
    stage: s.id as LeadStage,
    label: s.label,
    count: stageCountMap[s.id as LeadStage] ?? 0,
    color: s.color,
    pct: Math.round(
      ((stageCountMap[s.id as LeadStage] ?? 0) / maxPipeline) * 100
    ),
  }));

  return {
    stats: {
      totalLeads,
      leadsThisMonth,
      conversionRate,
      totalRenders,
      rendersThisMonth,
      totalConcepts,
      activeProjects,
      creditsRemaining:
        (subscription?.credits ?? 50) - (subscription?.creditsUsed ?? 0),
      creditsTotal: subscription?.credits ?? 50,
      automationsActive,
      totalProposals,
      proposalsValue: proposalsAgg._sum.total ?? 0,
    },
    chartData,
    pipeline: pipeline.map(({ stage, label, count, color }) => ({
      stage,
      label,
      count,
      color,
    })),
    recentLeads: leads,
    recentRenders: renders,
    recentProposals: budgets,
    recentConcepts: concepts,
  };
}

function buildChartData(
  leads: { createdAt: Date }[],
  renders: { createdAt: Date }[],
  concepts: { createdAt: Date }[]
): ChartPoint[] {
  const months: ChartPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(startOfMonth(new Date()), i);
    const key = format(date, "yyyy-MM");
    const label = format(date, "MMM", { locale: ptBR });

    const inMonth = (d: Date) =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth();

    months.push({
      month: label.charAt(0).toUpperCase() + label.slice(1),
      leads: leads.filter((l) => inMonth(l.createdAt)).length,
      renders: renders.filter((r) => inMonth(r.createdAt)).length,
      concepts: concepts.filter((c) => inMonth(c.createdAt)).length,
    });
  }

  return months;
}

export async function getAnalyticsChart(organizationId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      organizationId,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  return { events };
}
