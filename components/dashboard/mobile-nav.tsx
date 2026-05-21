"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Image,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/projetos", icon: FolderKanban, label: "Projetos" },
  { href: "/crm", icon: Users, label: "CRM" },
  { href: "/dashboard/renders", icon: Image, label: "Renders" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setSidebarOpen } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-light/20 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:bg-brand-black/90 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-brand-dark" : "text-brand-dark/45"
              )}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-dark" />
              )}
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium text-brand-dark/45"
        >
          <MoreHorizontal className="h-5 w-5" />
          Mais
        </button>
      </div>
    </nav>
  );
}
