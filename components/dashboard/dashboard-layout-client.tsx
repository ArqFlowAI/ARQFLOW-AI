"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-[padding] duration-300",
        sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[280px]"
      )}
    >
      {children}
    </div>
  );
}
