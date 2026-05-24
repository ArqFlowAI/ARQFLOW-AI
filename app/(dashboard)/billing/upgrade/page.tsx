import { redirect } from "next/navigation";

export default function UpgradePage() {
  // Billing disabled - all features available to authenticated users
  redirect("/dashboard");
}
