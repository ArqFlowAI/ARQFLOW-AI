import { getSession } from "@/lib/auth/session";
import { budgetRepository } from "@/repositories/budget.repository";
import { BudgetWizard, BudgetHistoryList } from "@/modules/budgets";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleStats } from "@/components/dashboard/module-stats";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function OrcamentosPage() {
  const session = await getSession();
  const orgId = session!.organizationId;

  const [budgets, agg, signed, myCount] = await Promise.all([
    budgetRepository.findByOrg(orgId),
    budgetRepository.aggregateTotal(orgId),
    prisma.budget.count({
      where: { organizationId: orgId, signedAt: { not: null } },
    }),
    budgetRepository.findByUser(orgId, session!.id).then((b) => b.length),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Orçamentos"
        description="Propostas comerciais com cálculo automático, texto IA e PDF — salvas no Supabase"
      />

      <ModuleStats
        stats={[
          { label: "Propostas", value: agg._count, icon: "file-text" },
          {
            label: "Valor total",
            value: formatCurrency(agg._sum.total ?? 0),
            icon: "dollar-sign",
          },
          { label: "Assinadas", value: signed, icon: "send" },
          {
            label: "Suas propostas",
            value: myCount,
            icon: "sparkles",
          },
        ]}
      />

      <section>
        <h2 className="font-display text-lg font-semibold mb-1">
          Novo orçamento
        </h2>
        <p className="text-sm text-brand-dark/50 mb-6">
          Etapa 1: parâmetros · Etapa 2: itens · Etapa 3: proposta + PDF
        </p>
        <BudgetWizard isOpenAIConfigured={!!process.env.OPENAI_API_KEY} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold mb-4">
          Histórico da equipe
        </h2>
        <BudgetHistoryList
          budgets={budgets}
          currentUserId={session!.id}
        />
      </section>
    </div>
  );
}
