import Link from "next/link";
import type { PipelineStage } from "@/types/dashboard";
import { ArrowRight } from "lucide-react";

export function PipelineWidget({ pipeline }: { pipeline: PipelineStage[] }) {
  const max = Math.max(...pipeline.map((p) => p.count), 1);

  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-6 dark:bg-brand-black/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Pipeline CRM</h3>
          <p className="text-xs text-brand-dark/60 mt-1">Funil comercial atual</p>
        </div>
        <Link
          href="/dashboard/crm"
          className="flex items-center gap-1 text-xs font-medium text-brand-dark hover:underline"
        >
          Ver Kanban <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {pipeline.map((stage) => (
          <div key={stage.stage}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">{stage.label}</span>
              <span className="text-brand-dark/60 tabular-nums">{stage.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-brand-beige/30">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round((stage.count / max) * 100)}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
