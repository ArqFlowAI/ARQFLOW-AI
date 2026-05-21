import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-brand-beige/40 dark:bg-brand-light/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
