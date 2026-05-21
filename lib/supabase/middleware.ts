import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, isPublicApiRoute } from "@/lib/auth/constants";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  return supabaseResponse;
}
