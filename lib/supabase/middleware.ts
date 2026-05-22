import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, isPublicApiRoute } from "@/lib/auth/constants";
import { checkPlanInMiddleware } from "@/lib/billing/middleware-plan";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  // If Supabase env vars are not configured, skip session handling to avoid server errors.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase env vars missing — skipping middleware session handling");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // Do not mutate the incoming request.cookies (not writable in middleware).
          // Create a response and set cookies there for Supabase to persist.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPasswordRecovery = pathname.startsWith(AUTH_ROUTES.updatePassword);

  const isAuthRoute =
    (pathname === AUTH_ROUTES.login ||
      pathname === AUTH_ROUTES.register ||
      pathname === AUTH_ROUTES.forgotPassword ||
      pathname === AUTH_ROUTES.verifyEmail) &&
    !isPasswordRecovery;

  const isAuthCallback =
    pathname.startsWith(AUTH_ROUTES.callback) ||
    pathname.startsWith(AUTH_ROUTES.google);

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/whatsapp") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/onboarding");

  const isProtectedApi =
    pathname.startsWith("/api") &&
    !isPublicApiRoute(pathname) &&
    !isAuthCallback;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedApi) {
    return NextResponse.json(
      { error: "Não autenticado", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  if (user) {
    const planBlock = await checkPlanInMiddleware(request);
    if (planBlock) return planBlock;
  }

  return supabaseResponse;
}
