"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LeadTagsInput({
  tags,
  onChange,
  suggestions = [],
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  const available = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pr-1 text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-brand-dark/10"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite e pressione Enter"
            className="h-9 text-sm"
          />
          <button
            type="button"
            onClick={() => addTag(input)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-light/30 hover:bg-brand-beige/40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {available.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1">
          {available.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className={cn(
                "rounded-full border border-dashed border-brand-light/40 px-2 py-0.5 text-[10px] text-brand-dark/60",
                "hover:border-brand-dark/30 hover:bg-brand-beige/30 hover:text-brand-dark"
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
