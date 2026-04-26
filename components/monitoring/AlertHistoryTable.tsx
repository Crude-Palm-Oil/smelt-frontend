"use client";

import { useState } from "react";
import { AlertTriangle, ShieldX } from "lucide-react";
import { failedScans } from "@/lib/mock-monitoring-data";
import { timeAgo } from "@/lib/utils";
import ScanDetailModal, { type ScanDetail } from "./ScanDetailModal";

export default function AlertHistoryTable() {
  const [selected, setSelected] = useState<ScanDetail | null>(null);

  if (failedScans.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Failed Scans
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-6">
          <ShieldX size={18} className="text-zinc-600" />
          <p className="text-sm text-zinc-400">No failed scans detected</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={14} className="text-red-400" />
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Failed Scans
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {failedScans.length} certificate{failedScans.length !== 1 ? "s" : ""} with compliance issues
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Scanned</th>
              <th className="px-5 py-3">Issue</th>
              <th className="px-5 py-3">Config</th>
            </tr>
          </thead>
          <tbody>
            {failedScans.map((row) => (
              <tr
                key={row.id}
                onClick={() =>
                  setSelected({
                    id: row.id,
                    name: row.name,
                    status: "fail",
                    scannedAt: row.scannedAt,
                    config: row.config,
                    issue: row.issues,
                  })
                }
                className="cursor-pointer border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
              >
                <td className="px-5 py-4">
                  <p className="font-mono text-zinc-200">{row.name}</p>
                  <p className="font-mono text-[10px] text-zinc-600">{row.id}</p>
                </td>
                <td className="px-5 py-4 text-zinc-400" title={row.scannedAt}>
                  {timeAgo(row.scannedAt)}
                </td>
                <td className="px-5 py-4">
                  <span className="text-red-400">{row.issues}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded px-2 py-0.5 text-xs font-mono font-medium bg-zinc-800 text-zinc-300">
                    {row.config}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ScanDetailModal scan={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
