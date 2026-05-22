"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, CheckCircle2 } from "lucide-react";
import { type OngoingScan } from "@/lib/mock-monitoring-data";

function formatElapsed(startedAtMs: number, now: number): string {
  const diff = Math.floor((now - startedAtMs) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTime(startedAtMs: number): string {
  return new Date(startedAtMs).toLocaleTimeString("en-US", { hour12: false });
}

function ScanLine({
  scan,
  anchor,
  now,
  onClick,
}: {
  scan: OngoingScan;
  anchor: number | null;
  now: number | null;
  onClick: () => void;
}) {
  const startedAtMs = anchor !== null ? anchor - scan.startedAtOffsetSec * 1000 : null;

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 border-b border-emerald-500/5 px-4 py-2 text-left font-mono text-[13px] transition hover:bg-emerald-500/10"
    >
      <span className="text-zinc-600">
        [{startedAtMs !== null ? formatTime(startedAtMs) : "--:--:--"}]
      </span>
      <span className="font-semibold text-emerald-500">SCAN</span>
      <span className="min-w-[180px] truncate text-zinc-300 group-hover:text-emerald-300">
        {scan.name}
      </span>
      <span className="relative flex-1 overflow-hidden rounded bg-zinc-900/50">
        <span className="scan-bar block h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      </span>
      <span className="tabular-nums text-emerald-400">
        {startedAtMs !== null && now !== null ? formatElapsed(startedAtMs, now) : "--:--"}
      </span>
      <span className="hidden text-[10px] text-zinc-700 lg:inline">
        {scan.id.slice(0, 8)}
      </span>
    </button>
  );
}

export default function OngoingScans({
  scans,
}: {
  scans: OngoingScan[];
}) {
  const router = useRouter();
  const [anchor, setAnchor] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const mountTime = Date.now();
    setAnchor(mountTime);
    setNow(mountTime);
    if (scans.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [scans.length]);

  if (scans.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Ongoing Scans
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/50 px-5 py-8 font-mono">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-emerald-500">$</span>
          <span className="text-sm text-zinc-400">idle — awaiting scan jobs</span>
          <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-emerald-500" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <style jsx>{`
        :global(.scan-bar) {
          width: 40%;
          animation: scanSlide 1.8s linear infinite;
        }
        @keyframes scanSlide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <div>
            <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
              Ongoing Scans
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {scans.length} scan{scans.length !== 1 ? "s" : ""} in progress · live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-emerald-400">LIVE</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black/60 shadow-inner">
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            scan.monitor — live
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {scans.map((scan) => (
            <ScanLine
              key={scan.id}
              scan={scan}
              anchor={anchor}
              now={now}
              onClick={() => router.push(`/main/results/${scan.id}`)}
            />
          ))}

          <div className="flex items-center gap-2 px-4 py-3 font-mono text-[13px]">
            <span className="text-emerald-500">$</span>
            <span className="inline-block h-4 w-2 animate-pulse bg-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
