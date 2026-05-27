import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function UpgradePage() {
  // Billing disabled - all features available to authenticated users
  redirect("/dashboard");
}
