import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent" | "muted";
}) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    accent: "bg-indigo-50 text-indigo-700",
    muted: "bg-zinc-50 text-muted border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
