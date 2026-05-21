import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreditsWidget({
  remaining,
  total,
  plan,
}: {
  remaining: number;
  total: number;
  plan: string;
}) {
  const used = total - remaining;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark to-brand-black p-6 text-brand-bg">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-beige/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-brand-beige" />
          <span className="text-sm font-medium text-brand-beige/80">
            Créditos IA · Plano {plan}
          </span>
        </div>
        <p className="mt-4 font-display text-4xl font-bold">{remaining}</p>
        <p className="text-sm text-brand-beige/70">créditos disponíveis</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-black/40">
          <div
            className="h-full rounded-full bg-brand-beige transition-all"
            style={{ width: `${100 - pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-brand-beige/60">
          {used} de {total} utilizados este período
        </p>
        <Button
          size="sm"
          className="mt-4 bg-brand-beige text-brand-black hover:bg-brand-bg"
          asChild
        >
          <Link href="/billing">
            Fazer upgrade <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
