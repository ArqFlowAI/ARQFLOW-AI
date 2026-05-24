import { getSession } from "@/lib/auth/session";
import { handleApiError, AppError } from "@/lib/errors";
import { whatsappRepository } from "@/repositories/whatsapp.repository";
import { getWhatsAppPageData } from "@/services/whatsapp-dashboard.service";
import { z } from "zod";
import type { AutomationStatus } from "@prisma/client";

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["ACTIVE", "PAUSED", "DRAFT"]).optional(),
  template: z.string().min(1).optional(),
  delayMinutes: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { automations } = await getWhatsAppPageData(session.organizationId);
    return Response.json({ success: true, data: automations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = patchSchema.parse(await request.json());
    const updated = await whatsappRepository.updateAutomation(
      body.id,
      session.organizationId,
      {
        status: body.status as AutomationStatus | undefined,
        template: body.template,
        delayMinutes: body.delayMinutes,
      }
    );

    if (updated.count === 0) {
      throw new AppError("Automação não encontrada", 404);
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
