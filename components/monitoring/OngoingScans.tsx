"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ongoingScans, type OngoingScan } from "@/lib/mock-monitoring-data";

function formatElapsed(startedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ScanCard({ scan }: { scan: OngoingScan }) {
  const [elapsed, setElapsed] = useState(formatElapsed(scan.startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(scan.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [scan.startedAt]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/30">
      {/* pulse bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500/40">
        <div className="h-full w-1/3 animate-pulse bg-emerald-400 rounded-full" />
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="font-mono text-sm font-medium text-zinc-100">{scan.name}</p>
          <p className="font-mono text-[10px] text-zinc-600">{scan.id}</p>
        </div>
        <Loader2 size={16} className="animate-spin text-emerald-400" />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Started</p>
          <p className="font-mono text-xs text-zinc-400">
            {new Date(scan.startedAt).toLocaleTimeString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Elapsed</p>
          <p className="font-mono text-sm tabular-nums text-emerald-400">{elapsed}</p>
        </div>
      </div>
    </div>
  );
}

export default function OngoingScans() {
  if (ongoingScans.length === 0) {
    return (
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Ongoing Scans
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-6">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <p className="text-sm text-zinc-400">All clear — no scans currently running</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Ongoing Scans
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          {ongoingScans.length} scan{ongoingScans.length !== 1 ? "s" : ""} in progress
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ongoingScans.map((scan) => (
          <ScanCard key={scan.id} scan={scan} />
        ))}
      </div>
    </section>
  );
}
