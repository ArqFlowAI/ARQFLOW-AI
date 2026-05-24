import { getSession } from "@/lib/auth/session";
import { handleApiError, AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { sendWhatsAppMessage } from "@/services/whatsapp.service";
import { z } from "zod";

const schema = z.object({
  phone: z.string().min(10),
  message: z.string().min(1),
  leadId: z.string().optional(),
  automationId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`whatsapp:${session.id}`, 30, 60_000);
    if (!success) throw new AppError("Rate limit exceeded", 429);

    const body = schema.parse(await request.json());

    const result = await sendWhatsAppMessage({
      organizationId: session.organizationId,
      phone: body.phone,
      message: body.message,
      leadId: body.leadId,
      automationId: body.automationId,
    });

    return Response.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
