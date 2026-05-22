import type {
  Lead,
  LeadStage,
  Project,
  Render,
  Concept,
  Budget,
  Automation,
  Subscription,
  Organization,
  User,
} from "@prisma/client";

export type { LeadStage };

export type OrganizationWithSubscription = Organization & {
  subscription: Subscription | null;
};

export type LeadWithRelations = Lead & {
  assignee: Pick<User, "id" | "name" | "avatarUrl"> | null;
  _count?: { leadNotes: number; history?: number };
};

export type DashboardStats = {
  totalLeads: number;
  leadsThisMonth: number;
  conversionRate: number;
  totalRenders: number;
  rendersThisMonth: number;
  totalConcepts: number;
  activeProjects: number;
  creditsRemaining: number;
  automationsActive: number;
};

export type ConceptContent = {
  title: string;
  description: string;
  palette: { name: string; hex: string }[];
  lighting: string;
  materials: string[];
  differentials: string[];
  storytelling: string;
  layoutTips?: string[];
  moodKeywords?: string[];
  furnitureDirection?: string;
};

export type BudgetItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  organizationId: string;
  organizationName: string;
  role: string;
  plan: string;
  subscriptionStatus: string;
  credits: number;
  onboardingDone: boolean;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ProjectWithCounts = Project & {
  _count: { concepts: number; renders: number; budgets: number };
};

export type RenderWithUser = Render & {
  user: Pick<User, "id" | "name">;
};

export type ConceptWithUser = Concept & {
  user: Pick<User, "id" | "name">;
};

export type BudgetWithRelations = Budget & {
  project: Pick<Project, "id" | "name"> | null;
};

export type AutomationWithStats = Automation & {
  runsCount: number;
};
