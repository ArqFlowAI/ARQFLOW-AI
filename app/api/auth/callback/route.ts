import { createClient } from "@/lib/supabase/server";
import {
  syncUserFromSupabase,
  getPostAuthRedirect,
} from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[Auth Callback]", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const meta = data.user.user_metadata;

  await syncUserFromSupabase({
    supabaseId: data.user.id,
    email: data.user.email!,
    name: meta?.full_name ?? meta?.name,
    avatarUrl: meta?.avatar_url,
    organizationName: meta?.organization_name,
  });

  let destination = await getPostAuthRedirect(data.user.id);

  if (
    nextParam &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
  ) {
    destination = nextParam;
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
