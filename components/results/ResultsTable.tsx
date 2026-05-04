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
import { type FinishedScan } from "@/lib/mock-results-data";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "clean" | "issues";

function ScanStatusBadge({ scan }: { scan: FinishedScan }) {
  if (scan.lintsFatal > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-fuchsia-500/10 text-fuchsia-400">
        <AlertOctagon size={11} />
        FATAL
      </span>
    );
  }
  if (scan.lintsFail > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400">
        <XCircle size={11} />
        FAIL
      </span>
    );
  }
  if (scan.lintsWarn > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-amber-500/10 text-amber-400">
        <AlertTriangle size={11} />
        WARN
      </span>
    );
  }
  if (scan.lintsInfo > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-sky-500/10 text-sky-400">
        <Info size={11} />
        INFO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400">
      <CheckCircle2 size={11} />
      PASS
    </span>
  );
}

function LintBar({ scan }: { scan: FinishedScan }) {
  const total =
    scan.lintsPass + scan.lintsInfo + scan.lintsWarn + scan.lintsFail + scan.lintsFatal;
  if (total === 0) return <span className="text-zinc-600 text-xs">—</span>;

  const passPct = (scan.lintsPass / total) * 100;
  const infoPct = (scan.lintsInfo / total) * 100;
  const warnPct = (scan.lintsWarn / total) * 100;
  const failPct = (scan.lintsFail / total) * 100;
  const fatalPct = (scan.lintsFatal / total) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-28 overflow-hidden rounded-full bg-zinc-800">
        <div className="bg-emerald-500" style={{ width: `${passPct}%` }} />
        <div className="bg-sky-500" style={{ width: `${infoPct}%` }} />
        <div className="bg-amber-500" style={{ width: `${warnPct}%` }} />
        <div className="bg-red-500" style={{ width: `${failPct}%` }} />
        <div className="bg-fuchsia-500" style={{ width: `${fatalPct}%` }} />
      </div>
      <div className="flex gap-1.5 font-mono text-[10px]">
        <span className="text-emerald-400">{scan.lintsPass}</span>
        {scan.lintsInfo > 0 && <span className="text-sky-400">{scan.lintsInfo}</span>}
        {scan.lintsWarn > 0 && <span className="text-amber-400">{scan.lintsWarn}</span>}
        {scan.lintsFail > 0 && <span className="text-red-400">{scan.lintsFail}</span>}
        {scan.lintsFatal > 0 && <span className="text-fuchsia-400">{scan.lintsFatal}</span>}
      </div>
    </div>
  );
}

export default function ResultsTable({ scans }: { scans: FinishedScan[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const hasIssues = (s: FinishedScan) =>
    s.lintsFatal > 0 || s.lintsFail > 0 || s.lintsWarn > 0;

  const filtered = scans.filter((s) => {
    if (filter === "clean" && hasIssues(s)) return false;
    if (filter === "issues" && !hasIssues(s)) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
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
          Scan Results
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Finished scans with lint breakdown · click to inspect findings
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
            placeholder="Search scan..."
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
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Scanned</th>
              <th className="px-5 py-3">Targets</th>
              <th className="px-5 py-3">Lint Breakdown</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-600">
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/main/results/${row.id}`)}
                  className="cursor-pointer border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-zinc-200">{row.name}</p>
                    <p className="font-mono text-[10px] text-zinc-600">{row.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-400" title={row.scannedAt}>
                    {timeAgo(row.scannedAt)}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-300">{row.targetCount}</td>
                  <td className="px-5 py-4">
                    <LintBar scan={row} />
                  </td>
                  <td className="px-5 py-4">
                    <ScanStatusBadge scan={row} />
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}
