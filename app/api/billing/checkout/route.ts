import { getSession } from "@/lib/auth/session";
import { createCheckoutSession } from "@/services/stripe.service";
import { handleApiError, AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { SubscriptionPlan } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`checkout:${session.id}`, 10, 60_000);
    if (!success) throw new AppError("Muitas requisições", 429);

    const { plan } = await request.json();
    if (!["FREE", "BASIC", "PRO", "PREMIUM"].includes(plan)) {
      throw new AppError("Plano inválido");
    }

    const checkout = await createCheckoutSession({
      organizationId: session.organizationId,
      email: session.email,
      plan: plan as SubscriptionPlan,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    });

    return Response.json({ success: true, url: checkout.url });
  } catch (error) {
    return handleApiError(error);
  }
}
