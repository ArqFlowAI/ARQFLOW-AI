import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/utils/validations";
import { handleApiError } from "@/lib/errors";
import { assertPlanFeature } from "@/lib/billing/plan-guard";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = settingsSchema.safeParse({
      organizationName: formData.get("organizationName") || undefined,
      logoUrl: formData.get("logoUrl") || undefined,
      brandColor: formData.get("brandColor") || undefined,
      whatsappEnabled: formData.get("whatsappEnabled") === "on",
      zapiInstanceId: formData.get("zapiInstanceId") || undefined,
      twilioEnabled: formData.get("twilioEnabled") === "on",
      whatsappProvider:
        (formData.get("whatsappProvider") as "ZAPI" | "TWILIO") || undefined,
    });

    if (!parsed.success) {
      return Response.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const {
      organizationName,
      logoUrl,
      brandColor,
      whatsappEnabled,
      zapiInstanceId,
      twilioEnabled,
      whatsappProvider,
    } = parsed.data;

    if (organizationName || logoUrl || brandColor) {
      await prisma.organization.update({
        where: { id: session.organizationId },
        data: {
          ...(organizationName && { name: organizationName }),
          ...(logoUrl && { logoUrl }),
          ...(brandColor && { brandColor }),
        },
      });
    }

    if (
      whatsappEnabled !== undefined ||
      zapiInstanceId ||
      twilioEnabled !== undefined ||
      whatsappProvider
    ) {
      // Enforce WhatsApp settings only for organizations with the WhatsApp feature
      if (whatsappEnabled !== undefined || zapiInstanceId || twilioEnabled !== undefined || whatsappProvider) {
        await assertPlanFeature(session.organizationId, "whatsapp");
      }
      await prisma.organizationSettings.upsert({
        where: { organizationId: session.organizationId },
        create: {
          organizationId: session.organizationId,
          whatsappEnabled: whatsappEnabled ?? false,
          zapiInstanceId,
          twilioEnabled: twilioEnabled ?? false,
          whatsappProvider: whatsappProvider ?? "ZAPI",
        },
        update: {
          ...(whatsappEnabled !== undefined && { whatsappEnabled }),
          ...(zapiInstanceId && { zapiInstanceId }),
          ...(twilioEnabled !== undefined && { twilioEnabled }),
          ...(whatsappProvider && { whatsappProvider }),
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
