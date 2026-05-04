import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  TriangleAlert,
  ClockAlert,
} from "lucide-react";

const stats = [
  {
    label: "Certificates Checked",
    value: "8",
    sub: "Across 8 finished scans",
    color: "text-emerald-400",
    icon: CheckCircle2,
    href: "/main/results",
  },
  {
    label: "Compliance Pass Rate",
    value: "62.5%",
    sub: "5 of 8 checks passed",
    color: "text-yellow-400",
    icon: ShieldCheck,
    href: "/main/reports",
  },
  {
    label: "Critical / Fatal Findings",
    value: "3",
    sub: "Requires immediate review",
    color: "text-fuchsia-400",
    icon: TriangleAlert,
    href: "/main/dashboard/critical-findings",
  },
  {
    label: "Expiring Soon",
    value: "5",
    sub: "Certificates expiring in 30 days",
    color: "text-red-400",
    icon: ClockAlert,
    href: "/main/dashboard/expiring-soon",
  },
];

export default function StatsCards() {
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

        if (stat.href) {
          return (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          );
        }

        return <div key={stat.label}>{card}</div>;
      })}
    </div>
  );
}