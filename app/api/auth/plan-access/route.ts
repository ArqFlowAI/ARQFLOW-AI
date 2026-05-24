import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ authenticated: false, allowed: false });
  }

  return Response.json({
    authenticated: true,
    allowed: true,
    plan: session.plan,
    status: session.subscriptionStatus,
    feature: null,
  });
}
