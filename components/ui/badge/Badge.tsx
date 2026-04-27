type BadgeVariant = "PASS" | "INFO" | "WARN" | "ERROR" | "FAIL" | "FATAL";

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
};

const variants: Record<BadgeVariant, string> = {
  PASS: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  INFO: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  WARN: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  ERROR: "border-red-500/40 bg-red-500/10 text-red-400",
  FAIL: "border-red-500/40 bg-red-500/10 text-red-400",
  FATAL: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}