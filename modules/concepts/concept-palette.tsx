"use client";

import type { ConceptContent } from "@/types";

export function ConceptPalette({
  palette,
  size = "md",
}: {
  palette: ConceptContent["palette"];
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <div className="flex flex-wrap gap-3">
      {palette.map((color) => (
        <div key={color.hex} className="flex flex-col items-center gap-1.5">
          <div
            className={`${sizes[size]} rounded-full border-2 border-white shadow-md ring-1 ring-brand-light/30`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
          <span className="max-w-[72px] truncate text-[10px] text-brand-dark/60 text-center">
            {color.name}
          </span>
          <span className="text-[9px] font-mono text-brand-dark/40">
            {color.hex}
          </span>
        </div>
      ))}
    </div>
  );
}
