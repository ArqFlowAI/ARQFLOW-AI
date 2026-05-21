"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CRM_STAGES } from "@/lib/crm/constants";
import type { LeadStage } from "@prisma/client";

type FunnelProps = {
  stageCounts: { stage: LeadStage; _count: number }[];
  totalValue: number;
};

export function CrmFunnel({ stageCounts, totalValue }: FunnelProps) {
  const countMap = Object.fromEntries(
    stageCounts.map((s) => [s.stage, s._count])
  ) as Record<string, number>;

  const data = CRM_STAGES.map((s) => ({
    label: s.label,
    count: countMap[s.id] ?? 0,
    color: s.color,
    stage: s.id,
  }));

  const total = data.reduce((a, b) => a + b.count, 0);

  return (
    <div className="rounded-2xl border border-brand-light/20 bg-white/50 p-5 dark:bg-brand-black/30">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Funil comercial</h3>
          <p className="text-xs text-brand-dark/50">
            {total} leads · valor total no pipeline
          </p>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          }).format(totalValue)}
        </p>
      </div>

      <div className="mt-4 h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#6B4F3A" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(214,194,161,0.2)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #D6C2A1",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.stage} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1">
        {data.map((d, i) => {
          const prev = i > 0 ? data[i - 1].count : d.count;
          const rate =
            prev > 0 && i > 0
              ? Math.round((d.count / prev) * 100)
              : i === 0
                ? 100
                : 0;
          return (
            <div key={d.stage} className="text-center">
              <p className="text-[10px] text-brand-dark/40 truncate">{d.label}</p>
              <p className="text-sm font-bold tabular-nums">{d.count}</p>
              {i > 0 && (
                <p className="text-[9px] text-brand-dark/40">{rate}%</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
