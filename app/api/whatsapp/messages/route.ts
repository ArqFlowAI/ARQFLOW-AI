import { getSession } from "@/lib/auth/session";
import { assertPlanFeature } from "@/lib/billing/plan-guard";
import { handleApiError } from "@/lib/errors";
import { getWhatsAppPageData } from "@/services/whatsapp-dashboard.service";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await assertPlanFeature(session.organizationId, "whatsapp");

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const data = await getWhatsAppPageData(session.organizationId);

    return Response.json({
      success: true,
      data: data.messages.slice(0, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
