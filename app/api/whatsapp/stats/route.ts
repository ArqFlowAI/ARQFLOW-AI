import { getSession } from "@/lib/auth/session";
import { assertPlanFeature } from "@/lib/billing/plan-guard";
import { handleApiError } from "@/lib/errors";
import { getWhatsAppPageData } from "@/services/whatsapp-dashboard.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertPlanFeature(session.organizationId, "whatsapp");

    const { stats } = await getWhatsAppPageData(session.organizationId);
    return Response.json({ success: true, data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
