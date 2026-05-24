import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/utils/validations";
import { handleApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      clientName: formData.get("clientName"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        organizationId: session.organizationId,
        ...parsed.data,
      },
    });

    return Response.json({ success: true, data: project });
  } catch (error) {
    return handleApiError(error);
  }
}
