"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartPoint, PipelineStage } from "@/types/dashboard";

export function DashboardCharts({
  chartData,
  pipeline,
}: {
  chartData: ChartPoint[];
  pipeline: PipelineStage[];
}) {
  const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-brand-light/20 bg-white/50 dark:bg-brand-black/30">
        <CardHeader>
          <CardTitle className="font-display">Performance (6 meses)</CardTitle>
          <p className="text-xs text-brand-dark/50">Leads, renders e conceitos gerados</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B4F3A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6B4F3A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rendersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A67C52" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A67C52" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D6C2A1" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6B4F3A" fontSize={11} />
              <YAxis stroke="#6B4F3A" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #D6C2A1",
                  background: "#F7F3EE",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#6B4F3A"
                fill="url(#leadsGrad)"
              />
              <Area
                type="monotone"
                dataKey="renders"
                name="Renders"
                stroke="#A67C52"
                fill="url(#rendersGrad)"
              />
              <Area
                type="monotone"
                dataKey="concepts"
                name="Conceitos"
                stroke="#D6C2A1"
                fill="#D6C2A1"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-brand-light/20 bg-white/50 dark:bg-brand-black/30">
        <CardHeader>
          <CardTitle className="font-display">Conversão por etapa</CardTitle>
          <p className="text-xs text-brand-dark/50">Distribuição do pipeline CRM</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipeline} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={80}
                tick={{ fontSize: 11, fill: "#6B4F3A" }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {pipeline.map((entry) => (
                  <Cell key={entry.stage} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {pipeline.map((s) => (
              <div key={s.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <span className="tabular-nums text-brand-dark/60">{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-beige/40">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.round((s.count / maxPipeline) * 100)}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
