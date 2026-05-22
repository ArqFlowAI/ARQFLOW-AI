import Link from "next/link";
import { PLANS, FEATURE_LABELS, normalizePlanKey } from "@/config/plans";
import type { PlanFeature } from "@/config/plans";
import type { SubscriptionPlan } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, ArrowRight, Check } from "lucide-react";

export function UpgradeGatePage({
  feature,
  requiredPlan,
  currentPlan,
  fromPath,
}: {
  feature: PlanFeature;
  requiredPlan: SubscriptionPlan;
  currentPlan: string;
  fromPath?: string;
}) {
  const target = PLANS[normalizePlanKey(requiredPlan)];
  const current = PLANS[normalizePlanKey(currentPlan)];
  const featureLabel = FEATURE_LABELS[feature];

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-beige/50">
          <Lock className="h-8 w-8 text-brand-dark" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Upgrade necessário
        </h1>
        <p className="mt-3 text-brand-dark/70">
          <strong>{featureLabel}</strong> está disponível no plano{" "}
          <strong>{target.name}</strong> ou superior. Seu plano atual:{" "}
          <Badge variant="secondary" className="ml-1">
            {current.name}
          </Badge>
        </p>
      </div>

      <Card className="border-brand-dark/20 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-light" />
            Plano {target.name}
          </CardTitle>
          <p className="text-3xl font-bold font-display">
            {target.price === 0 ? "Grátis" : `R$${target.price}`}
            {target.price > 0 && (
              <span className="text-sm font-normal text-brand-dark/50">/mês</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {target.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-brand-dark" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full" size="lg" asChild>
            <Link href={`/billing?upgrade=${requiredPlan}`}>
              Fazer upgrade para {target.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {fromPath && (
            <Button variant="ghost" className="w-full" asChild>
              <Link href={fromPath}>Voltar</Link>
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Ir ao dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
