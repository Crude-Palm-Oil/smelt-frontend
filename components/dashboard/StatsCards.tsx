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
  sub: string;
  href: string;
  color: string;
  iconBg: string;
  icon: LucideIcon;
};

export default async function StatsCards() {
  const summary = await getDashboardSummary();

  const stats: StatCard[] = [
    {
      label: "Compliance Pass Rate",
      value: `${summary.compliance_pass_rate}%`,
      sub: `${summary.passed_checks + summary.warning_checks}/${
        summary.total_checks
      } checks passed or warned`,
      href: "/main/dashboard/compliance-pass-rate",
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      icon: ShieldCheck,
    },
    {
      label: "Critical / Fatal Findings",
      value: summary.critical_fatal_findings,
      sub: "Failed or fatal compliance findings",
      href: "/main/dashboard/critical-findings",
      color: "text-fuchsia-400",
      iconBg: "bg-fuchsia-500/10",
      icon: TriangleAlert,
    },
    {
      label: "Expired Certificates",
      value: summary.expired_certificates ?? 0,
      sub: "Certificates already expired",
      href: "/main/dashboard/expiring-soon",
      color: "text-red-400",
      iconBg: "bg-red-500/10",
      icon: CircleX,
    },
    {
      label: "Expiring Soon",
      value: summary.expiring_soon ?? 0,
      sub: "Validity warnings requiring review",
      href: "/main/dashboard/expiring-soon",
      color: "text-yellow-400",
      iconBg: "bg-yellow-500/10",
      icon: ClockAlert,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Link key={stat.label} href={stat.href} className="group">
            <div className="h-full rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition group-hover:border-emerald-400/50 group-hover:bg-zinc-900">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className={`rounded-md p-2 ${stat.iconBg}`}>
                  <Icon size={18} className={stat.color} />
                </div>

                <span className="text-xs text-zinc-600 transition group-hover:text-emerald-400">
                  View →
                </span>
              </div>

              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {stat.label}
              </p>

              <p className={`mt-4 text-3xl font-semibold ${stat.color}`}>
                {stat.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {stat.sub}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}