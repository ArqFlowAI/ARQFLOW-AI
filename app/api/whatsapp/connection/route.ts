import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { refreshWhatsAppConnection } from "@/services/whatsapp.service";
import { getWhatsAppPageData } from "@/services/whatsapp-dashboard.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connection } = await getWhatsAppPageData(session.organizationId);
    return Response.json({ success: true, data: connection });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await refreshWhatsAppConnection(
      session.organizationId
    );

    return Response.json({
      success: true,
      data: {
        status: connection.status,
        qrCode: connection.qrCode,
        qrExpiresAt: connection.qrExpiresAt?.toISOString() ?? null,
        phoneNumber: connection.phoneNumber,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
