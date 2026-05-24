import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function checkPlanInMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  return null;
}
