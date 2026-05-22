"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Globe,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
} from "lucide-react";
import type {
  HistoryItem,
  LintStatus,
  TargetSummary,
} from "@/lib/mock-results-data";
import HistoryTimeline from "./HistoryTimeline";

function SummaryBadge({ status }: { status: LintStatus }) {
  switch (status) {
    case "fatal":
      return (
        <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-fuchsia-500/10 text-fuchsia-400">
          <AlertOctagon size={12} /> FATAL
        </span>
      );
    case "fail":
      return (
        <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-red-500/10 text-red-400">
          <XCircle size={12} /> FAIL
        </span>
      );
    case "warn":
      return (
        <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-amber-500/10 text-amber-400">
          <AlertTriangle size={12} /> WARN
        </span>
      );
    case "info":
      return (
        <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-sky-500/10 text-sky-400">
          <Info size={12} /> INFO
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={12} /> PASS
        </span>
      );
  }
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-1 truncate font-mono text-xs text-zinc-200" title={value}>
        {value}
      </p>
    </div>
  );
}

export default function TargetHistoryDetail({
  summary,
  history,
}: {
  summary: TargetSummary;
  history: HistoryItem[];
}) {
  const head = summary.hostname ?? summary.ipAddress ?? "unknown";

  return (
    <div className="flex flex-col gap-6 p-8">
      <nav className="flex items-center gap-2 font-mono text-xs">
        <Link
          href="/main/results"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft size={12} />
          Back
        </Link>
        <span className="text-zinc-700">/</span>
        <Link href="/main/results" className="text-zinc-500 transition hover:text-zinc-300">
          Results
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-500">Targets</span>
        <span className="text-zinc-700">/</span>
        <span className="truncate text-zinc-300">
          {head}:{summary.port}
        </span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-mono text-2xl font-semibold text-zinc-100">
              {head}:{summary.port}
            </h1>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">
              {summary.scanCount} scan{summary.scanCount === 1 ? "" : "s"} on record
            </p>
          </div>
          <SummaryBadge status={(summary.latestStatus as LintStatus) ?? "pass"} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaCard
            icon={<Globe size={12} />}
            label="Hostname"
            value={summary.hostname ?? "—"}
          />
          <MetaCard
            icon={<Server size={12} />}
            label="IP Address"
            value={summary.ipAddress ?? "—"}
          />
          <MetaCard
            icon={<Shield size={12} />}
            label="Latest Issuer"
            value={summary.issuerCn ?? "—"}
          />
          <MetaCard
            icon={<Calendar size={12} />}
            label="Last Scanned"
            value={
              summary.lastScannedAt
                ? new Date(summary.lastScannedAt).toLocaleString()
                : "—"
            }
          />
        </div>
      </header>

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
            Compliance History
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Every scan that has evaluated this target, newest first
          </p>
        </div>
        <HistoryTimeline items={history} />
      </section>
    </div>
  );
}
