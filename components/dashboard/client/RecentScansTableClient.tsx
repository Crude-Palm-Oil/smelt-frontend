"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  LoaderCircle,
  Info,
} from "lucide-react";
import type { RecentScan } from "@/lib/server/dashboard";

const SHOW_OPTIONS = [5, 10, 20, 50];

function ScanStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase().trim();

  if (normalizedStatus === "fatal") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-fuchsia-500/10 px-2 py-0.5 font-mono text-xs font-medium text-fuchsia-400">
        <AlertOctagon size={11} />
        FATAL
      </span>
    );
  }

  if (
    normalizedStatus === "fail" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "error"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 font-mono text-xs font-medium text-red-400">
        <XCircle size={11} />
        FAIL
      </span>
    );
  }

  if (normalizedStatus === "warn" || normalizedStatus === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-medium text-amber-400">
        <AlertTriangle size={11} />
        WARN
      </span>
    );
  }

  if (normalizedStatus === "info") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-medium text-sky-400">
        <Info size={11} />
        INFO
      </span>
    );
  }

  if (normalizedStatus === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-medium text-sky-400">
        <LoaderCircle size={11} />
        RUNNING
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-emerald-400">
      <CheckCircle2 size={11} />
      PASS
    </span>
  );
}

export default function RecentScansTableClient({
  scans,
}: {
  scans: RecentScan[];
}) {
  const [showCount, setShowCount] = useState(5);

  const visibleScans = scans.slice(0, showCount);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
            Recent Scans
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Showing {visibleScans.length} of {scans.length} recent scans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Show
          </label>

          <select
            value={showCount}
            onChange={(event) => setShowCount(Number(event.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-300 outline-none transition hover:border-zinc-700 focus:border-zinc-600"
          >
            {SHOW_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <Link
            href="/main/results"
            className="font-mono text-xs text-emerald-400 transition hover:text-emerald-300"
          >
            View all →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left font-mono text-xs uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Targets</th>
              <th className="px-5 py-3">Issues</th>
              <th className="px-5 py-3">Scanned</th>
              <th className="w-10 px-5 py-3" />
            </tr>
          </thead>

          <tbody>
            {visibleScans.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center font-mono text-xs text-zinc-600"
                >
                  No recent scans found
                </td>
              </tr>
            ) : (
              visibleScans.map((scan, index) => {
                const isLatest = index === 0;

                return (
                  <tr
                    key={scan.id}
                    className={`border-b border-zinc-800/60 transition last:border-b-0 hover:bg-zinc-900/40 ${
                      isLatest ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <Link href={`/main/results/${scan.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-zinc-200">
                            {scan.name || "Unnamed Scan"}
                          </p>

                          {isLatest && (
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-widest text-emerald-400">
                              Latest
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-[10px] text-zinc-600">
                          {scan.id.slice(0, 8)}
                        </p>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Link href={`/main/results/${scan.id}`} className="block">
                        <ScanStatusBadge status={scan.status} />
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-mono text-zinc-300">
                      <Link href={`/main/results/${scan.id}`} className="block">
                        {scan.targets}
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <Link href={`/main/results/${scan.id}`} className="block">
                        <span
                          className={
                            scan.issues > 0 ? "text-red-400" : "text-zinc-500"
                          }
                        >
                          {scan.issues}
                        </span>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Link href={`/main/results/${scan.id}`} className="block">
                        <p className="font-mono text-xs text-zinc-400">
                          {scan.date}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                          {scan.time}
                        </p>
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      <Link href={`/main/results/${scan.id}`}>
                        <ChevronRight size={14} />
                      </Link>
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