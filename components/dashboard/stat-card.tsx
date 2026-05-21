"use client";

import { motion } from "framer-motion";
import {
  Users,
  Image,
  Lightbulb,
  FolderKanban,
  TrendingUp,
  TrendingDown,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardIcon =
  | "users"
  | "image"
  | "lightbulb"
  | "folder-kanban"
  | "trending-up"
  | "file-text";

const iconMap: Record<StatCardIcon, LucideIcon> = {
  users: Users,
  image: Image,
  lightbulb: Lightbulb,
  "folder-kanban": FolderKanban,
  "trending-up": TrendingUp,
  "file-text": FileText,
};

type StatCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: StatCardIcon;
  trend?: "up" | "down" | "neutral";
  href?: string;
  accent?: "beige" | "light" | "dark";
  delay?: number;
};

const accents = {
  beige: "from-brand-beige/50 to-brand-beige/10",
  light: "from-brand-light/30 to-brand-light/5",
  dark: "from-brand-dark/20 to-brand-dark/5",
};

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend = "neutral",
  accent = "beige",
  delay = 0,
}: StatCardProps) {
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-brand-light/20 bg-gradient-to-br p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-brand-light/10",
        accents[accent]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-dark/60 dark:text-brand-beige/60">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-brand-black dark:text-brand-bg">
            {value}
          </p>
          {sublabel && (
            <p className="mt-1 flex items-center gap-1 text-xs text-brand-dark/50">
              {trend === "up" && (
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              )}
              {trend === "down" && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {sublabel}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-white/60 p-3 shadow-sm dark:bg-brand-black/40">
          <Icon className="h-5 w-5 text-brand-dark dark:text-brand-beige" />
        </div>
      </div>
    </motion.div>
  );
}
