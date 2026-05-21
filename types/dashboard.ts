import type { Lead, Render, Budget, Concept, LeadStage } from "@prisma/client";

export type ChartPoint = {
  month: string;
  leads: number;
  renders: number;
  concepts: number;
};

export type PipelineStage = {
  stage: LeadStage;
  label: string;
  count: number;
  color: string;
};

export type DashboardOverview = {
  stats: {
    totalLeads: number;
    leadsThisMonth: number;
    conversionRate: number;
    totalRenders: number;
    rendersThisMonth: number;
    totalConcepts: number;
    activeProjects: number;
    creditsRemaining: number;
    creditsTotal: number;
    automationsActive: number;
    totalProposals: number;
    proposalsValue: number;
  };
  chartData: ChartPoint[];
  pipeline: PipelineStage[];
  recentLeads: (Lead & { assignee: { name: string | null } | null })[];
  recentRenders: Render[];
  recentProposals: Budget[];
  recentConcepts: Concept[];
};
