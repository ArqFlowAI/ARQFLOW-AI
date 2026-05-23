import { getSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/services/dashboard.service";
import { assertPlanFeature } from "@/lib/billing/plan-guard";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await assertPlanFeature(session.organizationId, "dashboard");

    const stats = await getDashboardStats(session.organizationId);
    return Response.json({ success: true, data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
