"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createBudgetAction,
  estimateBudgetAction,
} from "@/actions/budget.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetEstimatePreview } from "@/modules/budgets/budget-estimate-preview";
import {
  PROJECT_TYPES,
  DESIGN_STYLES,
  FINISH_LEVELS,
  BUDGET_CREDIT_COST,
} from "@/lib/budgets/constants";
import type { BudgetEstimateResult } from "@/types/budget";
import type { BudgetItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText,
  Calculator,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetWizard({ credits }: { credits: number }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, startTransition] = useTransition();
  const [calculating, setCalculating] = useState(false);

  const [projectType, setProjectType] = useState("residencial_novo");
  const [area, setArea] = useState("");
  const [style, setStyle] = useState("contemporaneo");
  const [finishLevel, setFinishLevel] = useState("padrao");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const [estimate, setEstimate] = useState<BudgetEstimateResult | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);

  const canSubmit = (credits < 0 || credits >= BUDGET_CREDIT_COST) && items.length > 0;

  const total = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.total, 0);
    return Math.max(0, sub - discount + tax);
  }, [items, discount, tax]);

  async function handleCalculate() {
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) {
      toast.error("Informe a metragem válida");
      return;
    }
    setCalculating(true);
    const r = await estimateBudgetAction({
      projectType,
      area: areaNum,
      style,
      finishLevel,
    });
    setCalculating(false);
    if ("error" in r && r.error) toast.error(r.error);
    else if ("data" in r && r.data) {
      setEstimate(r.data);
      setItems(r.data.items);
      setStep(2);
      if (!title) {
        const pt = PROJECT_TYPES.find((p) => p.id === projectType);
        setTitle(`Proposta — ${pt?.label ?? "Projeto"} ${areaNum}m²`);
      }
      toast.success("Valores calculados");
    }
  }

  function updateItem(id: string, field: keyof BudgetItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total =
            Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  }

  function handleGenerate() {
    const fd = new FormData();
    fd.set("title", title);
    fd.set("clientName", clientName);
    fd.set("clientEmail", clientEmail);
    fd.set("items", JSON.stringify(items));
    fd.set("discount", String(discount));
    fd.set("tax", String(tax));
    fd.set("projectType", projectType);
    fd.set("area", area);
    fd.set("style", style);
    fd.set("finishLevel", finishLevel);
    fd.set(
      "validUntil",
      new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );

    startTransition(async () => {
      const r = await createBudgetAction(fd);
      if ("error" in r && r.error) toast.error(r.error);
      else {
        toast.success("Proposta gerada com PDF!");
        setStep(1);
        setEstimate(null);
        setItems([]);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        {([1, 2, 3] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => s < step && setStep(s)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 font-medium transition-colors",
              step === s
                ? "bg-brand-dark text-brand-bg"
                : step > s
                  ? "bg-brand-beige/50 text-brand-dark"
                  : "bg-brand-beige/20 text-brand-dark/40"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-xs">
              {s}
            </span>
            {s === 1 && "Parâmetros"}
            {s === 2 && "Itens"}
            {s === 3 && "Proposta"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-brand-light/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              {step === 1 && <Calculator className="h-5 w-5" />}
              {step === 2 && <FileText className="h-5 w-5" />}
              {step === 3 && <Sparkles className="h-5 w-5" />}
              {step === 1 && "Dados do projeto"}
              {step === 2 && "Revisar itens"}
              {step === 3 && "Gerar proposta"}
            </CardTitle>
            <p className="text-xs text-brand-dark/50">
              {BUDGET_CREDIT_COST} crédito · {credits < 0 ? "Ilimitado" : credits} disponíveis
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <Label>Tipo de projeto</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {PROJECT_TYPES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProjectType(p.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left text-sm transition-all",
                          projectType === p.id
                            ? "border-brand-dark bg-brand-dark/5 ring-1 ring-brand-dark"
                            : "border-brand-light/25 hover:border-brand-dark/30"
                        )}
                      >
                        <span className="font-medium">{p.label}</span>
                        <p className="mt-0.5 text-[10px] text-brand-dark/50">
                          {p.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="area">Metragem (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    min={1}
                    step={0.1}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="mt-1"
                    placeholder="Ex: 85"
                  />
                </div>

                <div>
                  <Label>Estilo de design</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DESIGN_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium",
                          style === s.id
                            ? "bg-brand-dark text-brand-bg"
                            : "bg-brand-beige/40"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Nível de acabamento</Label>
                  <div className="mt-2 space-y-2">
                    {FINISH_LEVELS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFinishLevel(f.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm",
                          finishLevel === f.id
                            ? "border-brand-dark bg-brand-dark/5"
                            : "border-brand-light/25"
                        )}
                      >
                        <div>
                          <span className="font-medium">{f.label}</span>
                          <p className="text-[10px] text-brand-dark/50">
                            {f.description}
                          </p>
                        </div>
                        <span className="text-xs text-brand-dark/40">
                          ×{f.multiplier}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={handleCalculate}
                  disabled={calculating}
                >
                  {calculating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
                  )}
                  Calcular estimativa
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-end rounded-lg border border-brand-light/15 p-2"
                    >
                      <div className="col-span-5">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", Number(e.target.value))
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, "unitPrice", Number(e.target.value))
                          }
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="col-span-2 text-xs font-medium py-2 tabular-nums">
                        {formatCurrency(item.total)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-9 w-9"
                        onClick={() =>
                          setItems((p) => p.filter((i) => i.id !== item.id))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setItems((p) => [
                      ...p,
                      {
                        id: `custom-${Date.now()}`,
                        description: "Item adicional",
                        quantity: 1,
                        unitPrice: 0,
                        total: 0,
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" /> Adicionar item
                </Button>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label>Desconto (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Taxas (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button className="flex-1 gap-1" onClick={() => setStep(3)}>
                    Continuar <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="title">Título da proposta *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="clientName">Cliente</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-brand-dark p-4 text-brand-bg">
                  <p className="text-xs opacity-70">Investimento total</p>
                  <p className="font-display text-3xl font-bold">
                    {formatCurrency(total)}
                  </p>
                </div>
                <p className="text-xs text-brand-dark/50">
                  A IA gerará texto comercial + PDF premium e salvará no
                  histórico.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={pending || !canSubmit || !title}
                    onClick={handleGenerate}
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Gerar proposta + PDF
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <BudgetEstimatePreview estimate={estimate} />
      </div>
    </div>
  );
}
