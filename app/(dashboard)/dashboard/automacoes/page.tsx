import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModuleStats } from "@/components/dashboard/module-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Workflow,
  Mail,
  CreditCard,
  UserCheck,
  RefreshCw,
  Play,
} from "lucide-react";

const defaultAutomations = [
  {
    id: "onboarding",
    name: "Onboarding",
    description: "Sequência de boas-vindas para novos usuários",
    icon: UserCheck,
    n8n: "arqflow-onboarding",
    status: "ACTIVE",
    runs: 0,
  },
  {
    id: "welcome",
    name: "Email de boas-vindas",
    description: "Disparo via Resend após cadastro",
    icon: Mail,
    n8n: "arqflow-welcome",
    status: "ACTIVE",
    runs: 0,
  },
  {
    id: "lead-recovery",
    name: "Recuperação de lead",
    description: "Reativa leads inativos há 7+ dias",
    icon: RefreshCw,
    n8n: "arqflow-lead-recovery",
    status: "ACTIVE",
    runs: 0,
  },
  {
    id: "billing",
    name: "Cobrança e renovação",
    description: "Alertas de pagamento e renovação",
    icon: CreditCard,
    n8n: "arqflow-billing",
    status: "ACTIVE",
    runs: 0,
  },
];

export default async function AutomacoesPage() {
  const session = await getSession();
  const dbAutomations = await prisma.automation.findMany({
    where: { organizationId: session!.organizationId },
  });

  const automations =
    dbAutomations.length > 0
      ? dbAutomations.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description ?? "",
          n8n: a.n8nWorkflowId ?? `arqflow-${a.type}`,
          status: a.status,
          runs: a.runsCount,
          icon: Workflow,
        }))
      : defaultAutomations;

  const activeCount = automations.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automações"
        description="Workflows n8n — onboarding, emails, recuperação e cobrança"
      />

      <ModuleStats
        stats={[
          { label: "Workflows", value: automations.length, icon: "workflow" },
          { label: "Ativos", value: activeCount, icon: "play" },
          {
            label: "Execuções",
            value: automations.reduce(
              (s, a) => s + ("runs" in a ? a.runs : 0),
              0
            ),
            icon: "refresh-cw",
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {automations.map((auto) => {
          const Icon = "icon" in auto ? auto.icon : Workflow;
          return (
            <Card key={auto.id} className="border-brand-light/15">
              <CardHeader className="flex flex-row gap-4">
                <div className="rounded-xl bg-brand-beige/40 p-3">
                  <Icon className="h-6 w-6 text-brand-dark" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg">{auto.name}</CardTitle>
                    <Badge variant={auto.status === "ACTIVE" ? "success" : "secondary"}>
                      {auto.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-dark/60 mt-1">
                    {"description" in auto ? auto.description : ""}
                  </p>
                  <p className="text-xs font-mono text-brand-light mt-2">
                    {auto.n8n}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-brand-dark/50">
                  {"runs" in auto ? auto.runs : 0} execuções
                </span>
                <Button variant="outline" size="sm">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Executar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
