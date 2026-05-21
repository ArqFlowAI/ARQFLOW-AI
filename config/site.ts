import { CRM_STAGES } from "@/lib/crm/constants";

export const siteConfig = {
  name: "ARQFLOW AI",
  description:
    "Plataforma premium de IA para arquitetos, designers e marcenarias. Renders, propostas e automações de vendas.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://arqflow.ai",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/arqflowai",
    instagram: "https://instagram.com/arqflowai",
    linkedin: "https://linkedin.com/company/arqflowai",
  },
  creator: "ARQFLOW AI",
};

export const navItems = [
  { title: "Benefícios", href: "#beneficios" },
  { title: "Funcionalidades", href: "#funcionalidades" },
  { title: "Demonstração", href: "#demo" },
  { title: "Preços", href: "#precos" },
  { title: "FAQ", href: "#faq" },
];

export const dashboardNav = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Projetos", href: "/dashboard/projetos", icon: "FolderKanban" },
  { title: "Render IA", href: "/dashboard/renders", icon: "Image" },
  { title: "Conceitos", href: "/dashboard/conceitos", icon: "Lightbulb" },
  { title: "Orçamentos", href: "/dashboard/orcamentos", icon: "FileText" },
  { title: "CRM", href: "/crm", icon: "Users" },
  { title: "WhatsApp", href: "/whatsapp", icon: "MessageCircle" },
  { title: "Automações", href: "/dashboard/automacoes", icon: "Workflow" },
  { title: "Billing", href: "/billing", icon: "CreditCard" },
  { title: "Configurações", href: "/dashboard/configuracoes", icon: "Settings" },
];

/** @deprecated Use CRM_STAGES from @/lib/crm/constants */
export const crmStages = CRM_STAGES;
