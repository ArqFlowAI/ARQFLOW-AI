import { requireApiSession } from "@/lib/auth/api";
import { completeOnboarding } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireApiSession();
    if (response) return response;

    const { focus, organizationName } = await request.json();

    await completeOnboarding(session!.id);

    if (focus || organizationName) {
      await prisma.$transaction([
        ...(organizationName
          ? [
              prisma.organization.update({
                where: { id: session!.organizationId },
                data: { name: organizationName },
              }),
            ]
          : []),
        prisma.organizationSettings.upsert({
          where: { organizationId: session!.organizationId },
          create: {
            organizationId: session!.organizationId,
            brandSettings: { focus },
          },
          update: {
            brandSettings: { focus },
          },
        }),
      ]);
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
