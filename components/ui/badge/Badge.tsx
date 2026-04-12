import clsx from "clsx";

type BadgeVariant = "PASS" | "FAIL" | "WARN" | "SUCCESS" | "NOTICE" | "WARNING" | "ERROR";

type BadgeProps = {
  children: React.ReactNode;
  variant: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  PASS: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  FAIL: "border border-red-500/30 bg-red-500/10 text-red-400",
  WARN: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
  SUCCESS: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  NOTICE: "border border-blue-500/30 bg-blue-500/10 text-blue-400",
  WARNING: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
  ERROR: "border border-red-500/30 bg-red-500/10 text-red-400",
};

export default function Badge({ children, variant }: BadgeProps) {
  return (
    <span
    className={clsx(
      "inline-flex rounded-md px-3 py-1 text-xs font-medium tracking-wide",
      variantClasses[variant]
    )}
    >
    {children}
    </span>
  );
}