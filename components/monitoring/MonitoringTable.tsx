"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { allScans, type ScanStatus } from "@/lib/mock-monitoring-data";
import { timeAgo } from "@/lib/utils";

function statusBadge(status: ScanStatus) {
  if (status === "pass")
    return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400";
  return "rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400";
}

type Filter = "all" | "pass" | "fail";

export default function MonitoringTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = allScans.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
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
          All Scans
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">Complete scan history</p>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {filterBtn("all", "All")}
          {filterBtn("pass", "Pass")}
          {filterBtn("fail", "Fail")}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search domain..."
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
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Config</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-zinc-600">
                  No scans found
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-zinc-200">{row.name}</p>
                    <p className="font-mono text-[10px] text-zinc-600">{row.id}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-400" title={row.scannedAt}>
                    {timeAgo(row.scannedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusBadge(row.status)}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded px-2 py-0.5 text-xs font-mono font-medium bg-zinc-800 text-zinc-300">
                      {row.config}
                    </span>
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
