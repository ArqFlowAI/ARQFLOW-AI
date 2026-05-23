import { getSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/services/dashboard.service";
import { assertPlanFeature } from "@/lib/billing/plan-guard";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await assertPlanFeature(session.organizationId, "dashboard");

    const overview = await getDashboardOverview(session.organizationId);
    return Response.json({ success: true, data: overview });
  } catch (error) {
    return handleApiError(error);
  }
}
