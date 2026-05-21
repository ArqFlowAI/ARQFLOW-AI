import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-lg border border-brand-light/30 bg-white/80 px-4 py-2 text-sm text-brand-black placeholder:text-brand-light/60 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-black/20 dark:border-brand-light/20",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
