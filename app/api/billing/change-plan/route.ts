import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { changePlan } from "@/services/billing.service";
import { SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["FREE", "BASIC", "PRO", "PREMIUM"]),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = schema.parse(await request.json());
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const result = await changePlan({
      organizationId: session.organizationId,
      email: session.email,
      plan: plan as SubscriptionPlan,
      baseUrl,
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
