import { getSession, getSupabaseAuthUser } from "@/lib/auth/session";

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
  });
}
