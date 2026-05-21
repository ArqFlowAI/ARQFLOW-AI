"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardNav } from "@/config/site";
import type { SessionUser } from "@/types";
import { cn } from "@/lib/utils";
import { PLANS } from "@/config/plans";
import type { SubscriptionPlan } from "@prisma/client";
import { useUIStore } from "@/store/ui.store";

const quickLinks = [
  { label: "Conceito", href: "/dashboard/conceitos", icon: Sparkles },
  { label: "Render", href: "/dashboard/renders", icon: Plus },
  { label: "Lead", href: "/crm", icon: Plus },
];

export function Topbar({ session }: { session: SessionUser }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const current = dashboardNav.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/dashboard" && pathname.startsWith(n.href))
  );
  const plan = PLANS[session.plan as SubscriptionPlan];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-brand-light/15 bg-brand-bg/85 px-4 backdrop-blur-xl dark:bg-brand-black/85 sm:h-16 sm:gap-4 lg:px-8",
        sidebarCollapsed ? "lg:pl-4" : ""
      )}
    >
      <div className="min-w-0 flex-1 pl-10 lg:pl-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-brand-dark/45 sm:text-xs">
          {session.organizationName}
        </p>
        <p className="truncate font-display text-sm font-semibold sm:text-base">
          {current?.title ?? "Dashboard"}
        </p>
      </div>

      <div className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
        <Input
          placeholder="Buscar projetos, leads..."
          className="h-9 border-brand-light/20 bg-white/60 pl-10 text-sm dark:bg-brand-black/40 sm:h-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-1 rounded-full bg-brand-beige/50 px-2.5 py-1 text-[10px] font-semibold text-brand-dark sm:px-3 sm:text-xs"
        >
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="tabular-nums">{session.credits}</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="relative hidden h-9 w-9 sm:flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-light ring-2 ring-brand-bg" />
        </Button>

        <ThemeToggle />

        <div className="hidden h-7 w-px bg-brand-light/30 sm:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-none">
              {session.name ?? "Usuário"}
            </p>
            <p className="text-[10px] text-brand-dark/50">
              {plan?.name ?? session.plan}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-dark to-brand-black text-xs font-semibold text-brand-bg sm:h-9 sm:w-9">
            {(session.name ?? session.email)[0]?.toUpperCase()}
          </div>
        </div>

        <Button size="sm" className="hidden gap-1 lg:flex" asChild>
          <Link href="/dashboard/conceitos">
            <Plus className="h-4 w-4" />
            Criar
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function MobileQuickActions() {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:hidden">
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex shrink-0 items-center gap-2 rounded-full border border-brand-light/25 bg-white/70 px-3.5 py-2 text-xs font-medium shadow-sm dark:bg-brand-black/50"
        >
          <link.icon className="h-3.5 w-3.5" />
          {link.label}
        </Link>
      ))}
    </div>
  );
}
