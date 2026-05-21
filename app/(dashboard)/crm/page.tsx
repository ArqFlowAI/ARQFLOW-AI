import { getSession } from "@/lib/auth/session";
import { leadRepository } from "@/repositories/lead.repository";
import { prisma } from "@/lib/prisma";
import { CrmPage } from "@/modules/crm/crm-page";
import { ACTIVE_PIPELINE_STAGES } from "@/lib/crm/constants";

export const metadata = {
  title: "CRM",
};

export default async function CrmRoutePage() {
  const session = await getSession();
  const orgId = session!.organizationId;

  const [leads, closed, lost, totalValue] = await Promise.all([
    leadRepository.findByOrg(orgId),
    prisma.lead.count({
      where: { organizationId: orgId, stage: "FECHADO" },
    }),
    prisma.lead.count({
      where: { organizationId: orgId, stage: "PERDIDO" },
    }),
    prisma.lead.aggregate({
      where: {
        organizationId: orgId,
        stage: { in: ACTIVE_PIPELINE_STAGES },
      },
      _sum: { value: true },
    }),
  ]);

  const pipeline = leads.filter(
    (l) => l.stage !== "FECHADO" && l.stage !== "PERDIDO"
  ).length;

  const conversion =
    leads.length > 0 ? Math.round((closed / leads.length) * 100) : 0;

  return (
    <CrmPage
      leads={leads}
      stats={{
        total: leads.length,
        pipeline,
        closed,
        lost,
        totalValue: totalValue._sum.value ?? 0,
        conversion,
      }}
    />
  );
}
