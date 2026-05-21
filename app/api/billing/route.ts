import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { getBillingPageData } from "@/services/billing.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getBillingPageData(session.organizationId);
    return Response.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
