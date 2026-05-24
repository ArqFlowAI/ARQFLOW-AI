"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Image,
  Lightbulb,
  FileText,
  Users,
  MessageCircle,
  Workflow,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNav, navGroups } from "@/config/dashboard-nav";
import { useUIStore } from "@/store/ui.store";
import { logoutAction } from "@/actions/auth.actions";
import type { SessionUser } from "@/types";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  Image,
  Lightbulb,
  FileText,
  Users,
  MessageCircle,
  Workflow,
  CreditCard,
  Settings,
};

export function Sidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();
  const {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
  } = useUIStore();
  const collapsed = sidebarCollapsed;

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-xl border border-brand-light/20 bg-white/80 p-2.5 shadow-sm backdrop-blur-xl dark:bg-brand-black/80 lg:hidden"
        onClick={toggleSidebar}
        aria-label="Menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-brand-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-brand-light/15 bg-gradient-to-b from-white via-white to-brand-beige/10 shadow-xl backdrop-blur-2xl transition-all duration-300 dark:from-brand-black dark:via-brand-black dark:to-brand-dark/30 lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[280px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-brand-light/10",
            collapsed ? "justify-center px-2" : "gap-3 px-5"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-dark to-brand-black text-brand-bg shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <Link
                href="/dashboard"
                className="font-display text-lg font-bold leading-none tracking-tight"
                onClick={() => setSidebarOpen(false)}
              >
                ARQFLOW
              </Link>
              <p className="truncate text-[10px] text-brand-dark/50">
                {session.organizationName}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-lg p-1.5 text-brand-dark/50 transition-colors hover:bg-brand-beige/40 hover:text-brand-dark lg:flex"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-brand-dark/35">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {dashboardNav
                  .filter((item) => group.items.includes(item.title))
                  .map((item) => {
                    const Icon = icons[item.icon] ?? LayoutDashboard;
                    const active =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href ||
                          pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.title : undefined}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                          active
                            ? "bg-brand-dark text-brand-bg shadow-md"
                            : "text-brand-dark/65 hover:bg-brand-beige/50 hover:text-brand-black dark:hover:bg-brand-dark/40"
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-beige" />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-brand-beige" : "text-brand-dark/70"
                          )}
                        />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={cn(
            "border-t border-brand-light/10 p-3 space-y-3",
            collapsed && "px-2"
          )}
        >
          {!collapsed ? (
            <div className="rounded-xl bg-gradient-to-br from-brand-beige/60 via-brand-light/20 to-transparent p-4 ring-1 ring-brand-light/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-dark/70">
                  Créditos IA
                </span>
                <span className="rounded-full bg-brand-dark px-2 py-0.5 text-[10px] font-semibold text-brand-bg">
                  {session.plan}
                </span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-brand-dark">
                {session.credits}
              </p>
              <div className="mt-2 text-center text-xs font-medium text-brand-dark">
                {session.credits < 0 ? "Créditos ilimitados" : `${session.credits} créditos disponíveis`}
              </div>
            </div>
          ) : (
            <div className="flex justify-center rounded-xl bg-brand-dark p-2.5 text-brand-bg">
              <span className="text-xs font-bold">
                {session.credits < 0 ? "∞" : session.credits}
              </span>
            </div>
          )}

          {!collapsed && (
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-dark to-brand-black text-xs font-bold text-brand-bg">
                {(session.name ?? session.email)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session.name ?? "Usuário"}
                </p>
                <p className="truncate text-[10px] text-brand-dark/50">
                  {session.email}
                </p>
              </div>
            </div>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              className={cn(
                "flex w-full items-center gap-2 rounded-xl text-sm text-brand-dark/70 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sair da conta"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
