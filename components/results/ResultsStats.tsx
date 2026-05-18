"use client";

import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  Target,
} from "lucide-react";
import type { FinishedScan } from "@/lib/mock-results-data";

// Severity keys the stats cards can filter by. Total-style cards (scans,
// targets, pass rate) don't filter — they're informational.
export type SeverityFilter = "pass" | "info" | "warn" | "fail" | "fatal";

type Stat = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  filter: SeverityFilter | null;
};

export default function ResultsStats({
  scans,
  activeFilter,
  onFilterChange,
}: {
  scans: FinishedScan[];
  activeFilter?: SeverityFilter | null;
  onFilterChange?: (filter: SeverityFilter | null) => void;
}) {
  const totalScans = scans.length;
  const totalTargets = scans.reduce((sum, s) => sum + s.targetCount, 0);
  const totalPass = scans.reduce((sum, s) => sum + s.lintsPass, 0);
  const totalInfo = scans.reduce((sum, s) => sum + s.lintsInfo, 0);
  const totalWarn = scans.reduce((sum, s) => sum + s.lintsWarn, 0);
  const totalFail = scans.reduce((sum, s) => sum + s.lintsFail, 0);
  const totalFatal = scans.reduce((sum, s) => sum + s.lintsFatal, 0);
  const totalLints = totalPass + totalInfo + totalWarn + totalFail + totalFatal;
  const passRate = totalLints > 0 ? Math.round((totalPass / totalLints) * 100) : 0;

  const stats: Stat[] = [
    {
      label: "Finished Scans",
      value: totalScans,
      icon: <FileText size={16} />,
      color: "text-zinc-100",
      bg: "bg-zinc-800/50",
      filter: null,
    },
    {
      label: "Targets Scanned",
      value: totalTargets,
      icon: <Target size={16} />,
      color: "text-zinc-100",
      bg: "bg-zinc-800/50",
      filter: null,
    },
    {
      label: "Passed",
      value: totalPass,
      icon: <CheckCircle2 size={16} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      filter: "pass",
    },
    {
      label: "Info",
      value: totalInfo,
      icon: <Info size={16} />,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      filter: "info",
    },
    {
      label: "Warnings",
      value: totalWarn,
      icon: <AlertTriangle size={16} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      filter: "warn",
    },
    {
      label: "Failures",
      value: totalFail,
      icon: <XCircle size={16} />,
      color: "text-red-400",
      bg: "bg-red-500/10",
      filter: "fail",
    },
    {
      label: "Fatal",
      value: totalFatal,
      icon: <AlertOctagon size={16} />,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      filter: "fatal",
    },
    {
      label: "Pass Rate",
      value: `${passRate}%`,
      icon: <CheckCircle2 size={16} />,
      color:
        passRate >= 90
          ? "text-emerald-400"
          : passRate >= 70
            ? "text-amber-400"
            : "text-red-400",
      bg:
        passRate >= 90
          ? "bg-emerald-500/10"
          : passRate >= 70
            ? "bg-amber-500/10"
            : "bg-red-500/10",
      filter: null,
    },
  ];

  // Clicking an already-active card clears the filter; clicking a new one switches to it.
  const handleClick = (stat: Stat) => {
    if (!stat.filter || !onFilterChange) return;
    onFilterChange(activeFilter === stat.filter ? null : stat.filter);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {stats.map((stat) => {
        const clickable = !!stat.filter && !!onFilterChange;
        const active = !!stat.filter && stat.filter === activeFilter;

        const baseClasses =
          "rounded-xl border px-4 py-4 text-left transition";
        const stateClasses = active
          ? "border-zinc-500 bg-zinc-800/80 ring-1 ring-inset ring-zinc-500/40"
          : clickable
            ? "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 cursor-pointer"
            : "border-zinc-800 bg-zinc-900/50";

        const content = (
          <>
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
          </>
        );

        if (clickable) {
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => handleClick(stat)}
              className={`${baseClasses} ${stateClasses}`}
              aria-pressed={active}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={stat.label} className={`${baseClasses} ${stateClasses}`}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
