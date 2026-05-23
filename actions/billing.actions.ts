"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";

const BILLING_PATHS = ["/billing", "/dashboard/billing", "/dashboard"];

function revalidateBilling() {
  BILLING_PATHS.forEach((p) => revalidatePath(p));
}

export async function refreshBillingAction() {
  await requireSession();
  revalidateBilling();
  return { success: true };
}
