import { getSession } from "@/lib/auth/session";
import {
  createAndQueueRender,
  parseRenderInput,
} from "@/services/render.service";
import { handleApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseRenderInput(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const render = await createAndQueueRender({
      organizationId: session.organizationId,
      userId: session.id,
      input: parsed.data,
    });

    return Response.json({ success: true, data: render });
  } catch (error) {
    return handleApiError(error);
  }
}
