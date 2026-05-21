import { getSession } from "@/lib/auth/session";
import { estimateBudget, parseBudgetEstimate } from "@/services/budget.service";
import { handleApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBudgetEstimate(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const result = estimateBudget(parsed.data);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
