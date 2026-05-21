import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createBillingPortalSession } from "@/services/stripe.service";
import { handleApiError } from "@/lib/errors";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { organizationId: session.organizationId },
    });

    if (!sub?.stripeCustomerId) {
      return Response.json(
        { error: "Nenhuma assinatura Stripe encontrada" },
        { status: 404 }
      );
    }

    const portal = await createBillingPortalSession(
      sub.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    );

    return Response.json({ success: true, url: portal.url });
  } catch (error) {
    return handleApiError(error);
  }
}
