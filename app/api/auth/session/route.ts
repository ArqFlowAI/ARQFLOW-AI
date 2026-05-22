import { getSession, getSupabaseAuthUser } from "@/lib/auth/session";
import { hasPlanAccess } from "@/config/plans";

export async function GET() {
  const authUser = await getSupabaseAuthUser();

  if (!authUser) {
    return Response.json({ user: null, authenticated: false });
  }

  const session = await getSession();

  return Response.json({
    user: session,
    authenticated: true,
    auth: {
      id: authUser.id,
      email: authUser.email,
      emailConfirmed: !!authUser.email_confirmed_at,
    },
    features: session
      ? {
          renders: hasPlanAccess(session.plan, "renders"),
          crm: hasPlanAccess(session.plan, "crm"),
          whatsapp: hasPlanAccess(session.plan, "whatsapp"),
          automations: hasPlanAccess(session.plan, "automations"),
          budgets: hasPlanAccess(session.plan, "budgets"),
        }
      : null,
  });
}
