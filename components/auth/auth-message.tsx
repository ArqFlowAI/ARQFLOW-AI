import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthMessage({
  error,
  success,
  message,
}: {
  error?: string;
  success?: boolean;
  message?: string;
}) {
  if (!error && !message) return null;

  const isSuccess = success && !error;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
        isSuccess
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      )}
      <p>{error ?? message}</p>
    </div>
  );
}
