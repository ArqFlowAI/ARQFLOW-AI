import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

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
