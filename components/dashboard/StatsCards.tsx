import Link from "next/link";
import {
  ShieldCheck,
  TriangleAlert,
  ClockAlert,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import {
  getDashboardSummary,
  type TimeRange,
} from "@/lib/server/dashboard";

type StatCard = {
  label: string;
  value: string | number;
  sub: string;
  href: string;
  color: string;
  bg: string;
  icon: LucideIcon;
};

function getPassRateColor(passRate: number) {
  if (passRate >= 90) {
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  }

  if (passRate >= 70) {
    return {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    };
  }

  return {
    color: "text-red-400",
    bg: "bg-red-500/10",
  };
}

function getRangeLabel(range: TimeRange) {
  if (range === "all") {
    return "All time";
  }

  if (range === "14d") {
    return "Last 14 days";
  }

  if (range === "30d") {
    return "Last 30 days";
  }

  if (range === "1y") {
    return "Last year";
  }

  return "Last 7 days";
}

export default async function StatsCards({
  range,
}: {
  range: TimeRange;
}) {
  const summary = await getDashboardSummary(range);
  const passRateTone = getPassRateColor(summary.compliance_pass_rate);
  const rangeLabel = getRangeLabel(range);

  const acceptableChecks =
    summary.acceptable_checks ?? summary.passed_checks ?? 0;

  const totalChecks = summary.total_checks ?? 0;

  const stats: StatCard[] = [
    {
      label: "Compliance Pass Rate",
      value: `${acceptableChecks}/${totalChecks}`,
      sub: `${summary.compliance_pass_rate}% pass rate · ${rangeLabel}`,
      href: `/main/dashboard/compliance-pass-rate?range=${range}`,
      color: passRateTone.color,
      bg: passRateTone.bg,
      icon: ShieldCheck,
    },
    {
      label: "Critical Findings",
      value: summary.critical_fatal_findings,
      sub: rangeLabel,
      href: `/main/dashboard/critical-findings?range=${range}`,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      icon: TriangleAlert,
    },
    {
      label: "Expired Certificates",
      value: summary.expired_certificates ?? 0,
      sub: rangeLabel,
      href: `/main/dashboard/expiring-soon?tab=expired&range=${range}`,
      color: "text-red-400",
      bg: "bg-red-500/10",
      icon: CircleX,
    },
    {
      label: "Expiring Soon",
      value: summary.expiring_soon ?? 0,
      sub: "Expiry warning in selected scans",
      href: `/main/dashboard/expiring-soon?tab=expiring-soon&range=${range}`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      icon: ClockAlert,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900/80"
          >
            <div className="flex items-center gap-2">
              <span className={`${stat.color} ${stat.bg} rounded-md p-1.5`}>
                <Icon size={16} />
              </span>

              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {stat.label}
              </p>
            </div>

            <p className={`mt-2 font-mono text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>

            <p className="mt-1 font-mono text-[10px] text-zinc-500">
              {stat.sub}
            </p>
          </Link>
        );
      })}
    </div>
  );
}