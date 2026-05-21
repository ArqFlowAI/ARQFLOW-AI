import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { cancelSubscription } from "@/services/billing.service";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await cancelSubscription(session.organizationId);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
