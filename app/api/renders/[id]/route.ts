import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const render = await prisma.render.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!render) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: render });
  } catch (error) {
    return handleApiError(error);
  }
}
