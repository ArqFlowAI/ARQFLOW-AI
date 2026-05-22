import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getFeatureForPath,
  getFeatureForApiPath,
  isAlwaysAllowedPath,
} from "@/lib/billing/routes";

/**
 * Verifica plano via API interna (cookies repassados).
 * Usado no middleware Edge onde Prisma não está disponível.
 */
export async function checkPlanInMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (isAlwaysAllowedPath(pathname)) return null;

  const feature =
    getFeatureForPath(pathname) ?? getFeatureForApiPath(pathname);

  if (!feature) return null;

  const url = new URL("/api/auth/plan-access", request.url);
  url.searchParams.set("path", pathname);
  url.searchParams.set("feature", feature);

  try {
    const res = await fetch(url.toString(), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.authenticated) return null;

    if (!data.allowed) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          {
            error: "Plano insuficiente",
            code: "PLAN_FEATURE_LOCKED",
            requiredPlan: data.requiredPlan,
            feature,
          },
          { status: 403 }
        );
      }

      const upgrade = new URL("/billing/upgrade", request.url);
      upgrade.searchParams.set("feature", feature);
      upgrade.searchParams.set("plan", data.requiredPlan ?? "PRO");
      upgrade.searchParams.set("from", pathname);
      return NextResponse.redirect(upgrade);
    }
  } catch {
    // Falha na verificação: páginas ainda protegidas pelo layout server-side
  }

  return null;
}
