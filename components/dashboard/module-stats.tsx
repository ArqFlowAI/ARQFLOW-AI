import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Send,
  CheckCheck,
  MessageCircle,
  Users,
  TrendingUp,
  Image,
  Lightbulb,
  FolderKanban,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle,
  Loader2,
  Heart,
  Workflow,
  Mail,
  CreditCard,
  UserCheck,
  Play,
  RefreshCw,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

export type ModuleStatIcon =
  | "layout-dashboard"
  | "send"
  | "check-check"
  | "message-circle"
  | "users"
  | "trending-up"
  | "image"
  | "lightbulb"
  | "folder-kanban"
  | "file-text"
  | "calendar"
  | "sparkles"
  | "check-circle"
  | "loader"
  | "heart"
  | "workflow"
  | "mail"
  | "credit-card"
  | "user-check"
  | "play"
  | "refresh-cw"
  | "dollar-sign";

const iconMap: Record<ModuleStatIcon, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  send: Send,
  "check-check": CheckCheck,
  "message-circle": MessageCircle,
  users: Users,
  "trending-up": TrendingUp,
  image: Image,
  lightbulb: Lightbulb,
  "folder-kanban": FolderKanban,
  "file-text": FileText,
  calendar: Calendar,
  sparkles: Sparkles,
  "check-circle": CheckCircle,
  loader: Loader2,
  heart: Heart,
  workflow: Workflow,
  mail: Mail,
  "credit-card": CreditCard,
  "user-check": UserCheck,
  play: Play,
  "refresh-cw": RefreshCw,
  "dollar-sign": DollarSign,
};

type Stat = {
  label: string;
  value: string | number;
  icon?: ModuleStatIcon;
};

export function ModuleStats({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon ? iconMap[stat.icon] : null;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-brand-light/15 bg-gradient-to-br from-white/80 to-brand-beige/10 px-4 py-4 shadow-sm transition-shadow hover:shadow-md dark:from-brand-black/40 dark:to-brand-dark/20"
          >
            {Icon && (
              <div className="rounded-lg bg-brand-beige/40 p-2">
                <Icon className="h-4 w-4 text-brand-dark" />
              </div>
            )}
            <div>
              <p className="text-xs text-brand-dark/50">{stat.label}</p>
              <p className="font-display text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
