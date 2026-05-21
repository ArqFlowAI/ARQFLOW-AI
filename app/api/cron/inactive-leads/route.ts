import { prisma } from "@/lib/prisma";
import { sendLeadRecoveryEmail } from "@/emails/send";
import { triggerN8nWebhook } from "@/services/n8n.service";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const leads = await prisma.lead.findMany({
    where: {
      updatedAt: { lt: sevenDaysAgo },
      stage: { notIn: ["FECHADO"] },
      email: { not: null },
    },
    take: 50,
  });

  for (const lead of leads) {
    if (lead.email) {
      await sendLeadRecoveryEmail({
        to: lead.email,
        name: lead.name,
        message:
          "Notamos que seu projeto ainda está em análise. Gostaríamos de ajudá-lo a dar o próximo passo.",
      });
      await triggerN8nWebhook("lead-recovery", {
        leadId: lead.id,
        email: lead.email,
        phone: lead.phone,
      });
    }
  }

  return Response.json({ processed: leads.length });
}
