"use client";

import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ongoingScans, failedScans, allScans } from "@/lib/mock-monitoring-data";

const stats = [
  {
    label: "Total Scans",
    value: allScans.length,
    icon: <Activity size={16} />,
    color: "text-zinc-100",
    bg: "bg-zinc-800/50",
  },
  {
    label: "Active",
    value: ongoingScans.length,
    icon: <Loader2 size={16} className="animate-spin" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Passed",
    value: allScans.filter((s) => s.status === "pass").length,
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Failed",
    value: failedScans.length,
    icon: <XCircle size={16} />,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    label: "Pass Rate",
    value:
      allScans.length > 0
        ? `${Math.round((allScans.filter((s) => s.status === "pass").length / allScans.length) * 100)}%`
        : "—",
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4"
        >
          <div className="flex items-center gap-2">
            <span className={`${stat.color} ${stat.bg} rounded-md p-1.5`}>
              {stat.icon}
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {stat.label}
            </p>
          </div>
          <p className={`mt-2 text-2xl font-mono font-semibold ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
