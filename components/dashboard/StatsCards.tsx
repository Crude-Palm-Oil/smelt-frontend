import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  TriangleAlert,
  ClockAlert,
} from "lucide-react";

type DashboardSummary = {
  certificates_checked: number;
  compliance_pass_rate: number;
  passed_checks: number;
  total_checks: number;
  critical_fatal_findings: number;
  expiring_soon: number;
};

async function getDashboardSummary(): Promise<DashboardSummary> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const res = await fetch(`${apiBaseUrl}/api/dashboard/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return res.json();
}

export default async function StatsCards() {
  const summary = await getDashboardSummary();

  const stats = [
    {
      label: "Certificates Checked",
      value: String(summary.certificates_checked),
      sub: "Across recent finished scans",
      color: "text-emerald-400",
      icon: CheckCircle2,
      href: "/main/results",
    },
    {
      label: "Compliance Pass Rate",
      value: `${summary.compliance_pass_rate}%`,
      sub: `${summary.passed_checks} of ${summary.total_checks} checks passed`,
      color: "text-yellow-400",
      icon: ShieldCheck,
      href: "/main/reports",
    },
    {
      label: "Critical / Fatal Findings",
      value: String(summary.critical_fatal_findings),
      sub: "Requires immediate review",
      color: "text-fuchsia-400",
      icon: TriangleAlert,
      href: "/main/dashboard/critical-findings",
    },
    {
      label: "Expiring Soon",
      value: String(summary.expiring_soon),
      sub: "Validity-related findings",
      color: "text-red-400",
      icon: ClockAlert,
      href: "/main/dashboard/expiring-soon",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        const card = (
          <div
            className={`rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition ${
              stat.href
                ? "cursor-pointer hover:border-emerald-400/50 hover:bg-zinc-900"
                : ""
            }`}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-zinc-900 p-2">
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                {stat.label}
              </p>
            </div>

            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-zinc-500">{stat.sub}</p>
          </div>
        );

        return (
          <Link key={stat.label} href={stat.href}>
            {card}
          </Link>
        );
      })}
    </div>
  );
}