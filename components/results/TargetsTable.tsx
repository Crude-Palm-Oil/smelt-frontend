"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
} from "lucide-react";
import type { LintStatus, TargetSummary } from "@/lib/mock-results-data";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "clean" | "issues";

// URL-safe identifier used by the history detail page to fetch the right
// target. Format: `${hostname or ip}:${port}`. The hostname branch wins
// when both are present so the same key is generated whether or not the
// scanner resolved the IP at the time of the scan.
export function targetKey(t: TargetSummary): string {
  const head = t.hostname ?? t.ipAddress ?? "unknown";
  return `${head}:${t.port}`;
}

function StatusBadge({ status }: { status: LintStatus }) {
  switch (status) {
    case "fatal":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-fuchsia-500/10 text-fuchsia-400">
          <AlertOctagon size={11} /> FATAL
        </span>
      );
    case "fail":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400">
          <XCircle size={11} /> FAIL
        </span>
      );
    case "warn":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-amber-500/10 text-amber-400">
          <AlertTriangle size={11} /> WARN
        </span>
      );
    case "info":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-sky-500/10 text-sky-400">
          <Info size={11} /> INFO
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={11} /> PASS
        </span>
      );
  }
}

// Compact "dot strip" trend: counts of each severity across all historical
// scans of this target. A coloured bar segment per severity, sized to the
// proportion of total findings. Gives an at-a-glance view of how dirty
// this target has been over time without rendering a full chart.
function TrendStrip({ target }: { target: TargetSummary }) {
  const total =
    target.lintsPass +
    target.lintsInfo +
    target.lintsWarn +
    target.lintsFail +
    target.lintsFatal;
  if (total === 0) return <span className="text-xs text-zinc-600">—</span>;

  const segments: Array<{ key: string; value: number; cls: string }> = [
    { key: "pass", value: target.lintsPass, cls: "bg-emerald-500" },
    { key: "info", value: target.lintsInfo, cls: "bg-sky-500" },
    { key: "warn", value: target.lintsWarn, cls: "bg-amber-500" },
    { key: "fail", value: target.lintsFail, cls: "bg-red-500" },
    { key: "fatal", value: target.lintsFatal, cls: "bg-fuchsia-500" },
  ];
  return (
    <div className="flex h-1.5 w-28 overflow-hidden rounded-full bg-zinc-800">
      {segments.map((s) =>
        s.value > 0 ? (
          <div
            key={s.key}
            className={s.cls}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
}

function hasIssues(t: TargetSummary): boolean {
  return t.lintsWarn > 0 || t.lintsFail > 0 || t.lintsFatal > 0;
}

export default function TargetsTable({ targets }: { targets: TargetSummary[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = targets.filter((t) => {
    if (filter === "clean" && hasIssues(t)) return false;
    if (filter === "issues" && !hasIssues(t)) return false;
    if (query) {
      const q = query.toLowerCase();
      const inHost = t.hostname?.toLowerCase().includes(q) ?? false;
      const inIp = t.ipAddress?.toLowerCase().includes(q) ?? false;
      const inCn = t.commonName?.toLowerCase().includes(q) ?? false;
      if (!inHost && !inIp && !inCn) return false;
    }
    return true;
  });

  const filterBtn = (value: Filter, label: string) => (
    <button
      onClick={() => setFilter(value)}
      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
        filter === value
          ? "bg-zinc-700 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Targets
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Unique hosts and IPs · click for compliance history
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {filterBtn("all", "All")}
          {filterBtn("clean", "Clean")}
          {filterBtn("issues", "Issues")}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search host, IP, CN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Last Scanned</th>
              <th className="px-5 py-3">Scans</th>
              <th className="px-5 py-3">Trend</th>
              <th className="px-5 py-3">Worst</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-600">
                  No targets found
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const key = targetKey(row);
                const head = row.hostname ?? row.ipAddress ?? "unknown";
                return (
                  <tr
                    key={key}
                    onClick={() =>
                      router.push(`/main/results/target/${encodeURIComponent(key)}`)
                    }
                    className="cursor-pointer border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-zinc-200">
                        {head}:{row.port}
                      </p>
                      {row.issuerCn && (
                        <p className="font-mono text-[10px] text-zinc-600 truncate max-w-[260px]">
                          issuer · {row.issuerCn}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-400" title={row.lastScannedAt ?? ""}>
                      {row.lastScannedAt ? timeAgo(row.lastScannedAt) : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-300">{row.scanCount}</td>
                    <td className="px-5 py-4">
                      <TrendStrip target={row} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={(row.worstStatus as LintStatus) ?? "pass"} />
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
