"use client";

import { PRIORITY_CONFIG } from "@/lib/crm/constants";
import type { LeadPriority } from "@prisma/client";
import { cn } from "@/lib/utils";

const priorities: LeadPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function LeadPrioritySelect({
  value,
  onChange,
  disabled,
}: {
  value: LeadPriority;
  onChange: (p: LeadPriority) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {priorities.map((p) => {
        const cfg = PRIORITY_CONFIG[p];
        const active = value === p;
        return (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
              active
                ? "border-brand-dark bg-brand-dark text-brand-bg shadow-sm"
                : "border-brand-light/25 hover:border-brand-dark/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        cfg.badge
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}
