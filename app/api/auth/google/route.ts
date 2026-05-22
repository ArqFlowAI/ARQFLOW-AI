import { NextResponse } from "next/server";
import { GOOGLE_AUTH_ENABLED } from "@/config/auth";

/**
 * Login Google — desativado até configurar o provider no Supabase.
 * Defina GOOGLE_AUTH_ENABLED = true em config/auth.ts quando estiver pronto.
 */
export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  if (!GOOGLE_AUTH_ENABLED) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent("Login com Google em breve. Use email e senha.")}`
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
}
