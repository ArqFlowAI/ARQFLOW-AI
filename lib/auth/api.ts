import { getSession } from "@/lib/auth/session";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: Response.json(
        { error: "Não autenticado", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }
  return { session, response: null };
}
