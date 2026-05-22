import type { PlanFeature } from "@/config/plans";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: string;
  feature?: PlanFeature;
};

export const dashboardNav: DashboardNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", feature: "dashboard" },
  { title: "Projetos", href: "/dashboard/projetos", icon: "FolderKanban", feature: "projects" },
  { title: "Render IA", href: "/dashboard/renders", icon: "Image", feature: "renders" },
  { title: "Conceitos", href: "/dashboard/conceitos", icon: "Lightbulb", feature: "concepts" },
  { title: "Orçamentos", href: "/dashboard/orcamentos", icon: "FileText", feature: "budgets" },
  { title: "CRM", href: "/crm", icon: "Users", feature: "crm" },
  { title: "WhatsApp", href: "/whatsapp", icon: "MessageCircle", feature: "whatsapp" },
  { title: "Automações", href: "/dashboard/automacoes", icon: "Workflow", feature: "automations" },
  { title: "Billing", href: "/billing", icon: "CreditCard" },
  { title: "Configurações", href: "/dashboard/configuracoes", icon: "Settings" },
];

export const navGroups = [
  { label: "Principal", items: ["Dashboard", "Projetos"] },
  { label: "Inteligência", items: ["Render IA", "Conceitos", "Orçamentos"] },
  { label: "Comercial", items: ["CRM", "WhatsApp", "Automações"] },
  { label: "Conta", items: ["Billing", "Configurações"] },
] as { label: string; items: string[] }[];
