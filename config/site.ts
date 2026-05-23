import { CRM_STAGES } from "@/lib/crm/constants";

export const siteConfig = {
  name: "ARQFLOW AI",
  description:
    "Plataforma premium de IA para arquitetos, designers e marcenarias. Renders, propostas e automações de vendas.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://arqflow-ai.vercel.app",
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

export { dashboardNav, navGroups } from "@/config/dashboard-nav";

/** @deprecated Use CRM_STAGES from @/lib/crm/constants */
export const crmStages = CRM_STAGES;
