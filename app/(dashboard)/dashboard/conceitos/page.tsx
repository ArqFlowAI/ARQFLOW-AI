import { getSession } from "@/lib/auth/session";
import { conceptRepository } from "@/repositories/concept.repository";
import {
  ConceptGenerator,
  ConceptCard,
  ConceptEmptyState,
} from "@/modules/concepts";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleStats } from "@/components/dashboard/module-stats";
import { CONCEPT_CREDIT_COST } from "@/lib/concepts/constants";
import { startOfMonth } from "date-fns";

export default async function ConceitosPage() {
  const session = await getSession();
  const orgId = session!.organizationId;
  const monthStart = startOfMonth(new Date());

  const [concepts, total, thisMonth] = await Promise.all([
    conceptRepository.findByOrg(orgId),
    conceptRepository.countByOrg(orgId),
    conceptRepository.countByOrg(orgId, monthStart),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Conceitos IA"
        description="Conceitos arquitetônicos gerados com OpenAI — paleta, materiais, iluminação, layout e storytelling"
      />

      <ModuleStats
        stats={[
          { label: "Total gerados", value: total, icon: "lightbulb" },
          { label: "Este mês", value: thisMonth, icon: "calendar" },
          { label: "Créditos disp.", value: session!.credits, icon: "sparkles" },
          {
            label: "Custo / conceito",
            value: `${CONCEPT_CREDIT_COST} créditos`,
            icon: "sparkles",
          },
        ]}
      />

      <ConceptGenerator credits={session!.credits} />

      <div>
        <h2 className="font-display text-lg font-semibold mb-4">
          Histórico ({concepts.length})
        </h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {concepts.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
          {concepts.length === 0 && <ConceptEmptyState />}
        </div>
      </div>
    </div>
  );
}
