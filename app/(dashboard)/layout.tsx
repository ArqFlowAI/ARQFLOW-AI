import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.onboardingDone) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-black">
      <Sidebar session={session} />
      <DashboardLayoutClient>
        <Topbar session={session} />
        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">{children}</main>
      </DashboardLayoutClient>
      <MobileNav />
    </div>
  );
}
