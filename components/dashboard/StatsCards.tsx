import Link from "next/link";
import {
  ShieldCheck,
  TriangleAlert,
  ClockAlert,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/server/dashboard";

type StatCard = {
  label: string;
  value: string | number;
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

export default async function StatsCards() {
  const summary = await getDashboardSummary();
  const passRateTone = getPassRateColor(summary.compliance_pass_rate);

  const stats: StatCard[] = [
    {
      label: "Compliance Pass Rate",
      value: `${summary.acceptable_checks}/${summary.total_checks}`,
      href: "/main/dashboard/compliance-pass-rate",
      color: passRateTone.color,
      bg: passRateTone.bg,
      icon: ShieldCheck,
    },
    {
      label: "Critical Findings",
      value: summary.critical_fatal_findings,
      href: "/main/dashboard/critical-findings",
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      icon: TriangleAlert,
    },
    {
      label: "Expired Certificates",
      value: summary.expired_certificates ?? 0,
      href: "/main/dashboard/expiring-soon?tab=expired",
      color: "text-red-400",
      bg: "bg-red-500/10",
      icon: CircleX,
    },
    {
      label: "Expiring Soon",
      value: summary.expiring_soon ?? 0,
      href: "/main/dashboard/expiring-soon?tab=expiring-soon",
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
          </Link>
        );
      })}
    </div>
  );
}