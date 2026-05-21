import {
  PROJECT_TYPES,
  DESIGN_STYLES,
  FINISH_LEVELS,
  LINE_ITEM_SPLITS,
  type ProjectTypeId,
  type DesignStyleId,
  type FinishLevelId,
} from "@/lib/budgets/constants";
import type { BudgetItem } from "@/types";
import type { BudgetEstimateInput, BudgetEstimateResult } from "@/types/budget";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calculateBudgetEstimate(
  input: BudgetEstimateInput
): BudgetEstimateResult {
  const project = PROJECT_TYPES.find((p) => p.id === input.projectType);
  const style = DESIGN_STYLES.find((s) => s.id === input.style);
  const finish = FINISH_LEVELS.find((f) => f.id === input.finishLevel);

  if (!project || !style || !finish) {
    throw new Error("Parâmetros de orçamento inválidos");
  }

  const pricePerSqm = round2(
    project.basePerSqm * style.multiplier * finish.multiplier
  );
  const baseTotal = round2(pricePerSqm * input.area);

  const items: BudgetItem[] = LINE_ITEM_SPLITS.map((line, i) => {
    const total = round2(baseTotal * line.pct);
    return {
      id: `item-${i + 1}`,
      description: line.label,
      quantity: 1,
      unitPrice: total,
      total,
    };
  });

  const subtotal = round2(items.reduce((s, i) => s + i.total, 0));

  return {
    items,
    subtotal,
    pricePerSqm,
    baseTotal,
    meta: {
      projectType: project.id,
      projectLabel: project.label,
      style: style.id,
      styleLabel: style.label,
      finishLevel: finish.id,
      finishLabel: finish.label,
      area: input.area,
      multipliers: {
        style: style.multiplier,
        finish: finish.multiplier,
      },
    },
  };
}

export function getEstimateLabels(input: BudgetEstimateInput) {
  return {
    project:
      PROJECT_TYPES.find((p) => p.id === input.projectType)?.label ?? "",
    style: DESIGN_STYLES.find((s) => s.id === input.style)?.label ?? "",
    finish:
      FINISH_LEVELS.find((f) => f.id === input.finishLevel)?.label ?? "",
  };
}
