import { getSession } from "@/lib/auth/session";
import { assertPlanFeature } from "@/lib/billing/plan-guard";
import { getBudget } from "@/services/budget.service";
import { budgetRepository } from "@/repositories/budget.repository";
import { handleApiError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    await assertPlanFeature(session.organizationId, "budgets");

    const { id } = await params;
    const budget = await getBudget(id, session.organizationId);
    return Response.json({ success: true, data: budget });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    await assertPlanFeature(session.organizationId, "budgets");

    const { id } = await params;
    await budgetRepository.delete(id, session.organizationId);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
