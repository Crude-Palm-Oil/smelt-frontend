"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  FileCode,
  Shield,
  Target as TargetIcon,
  Calendar,
  ArrowLeft,
  FileText,
  Eye,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import {
  type FinishedScan,
  type Lint,
  type LintFinding,
  type LintSeverity,
} from "@/lib/mock-results-data";
import useSWR from "swr"

function severityIcon(severity: LintSeverity) {
  switch (severity) {
    case "pass":
      return <CheckCircle2 size={12} className="text-emerald-400" />;
    case "info":
      return <Info size={12} className="text-sky-400" />;
    case "warn":
      return <AlertTriangle size={12} className="text-amber-400" />;
    case "error":
      return <XCircle size={12} className="text-red-400" />;
    case "fatal":
      return <AlertOctagon size={12} className="text-fuchsia-400" />;
    case "na":
      return <MinusCircle size={12} className="text-zinc-600" />;
  }
}

function severityClass(severity: LintSeverity) {
  switch (severity) {
    case "pass":
      return "bg-emerald-500/5 border-emerald-500/20";
    case "info":
      return "bg-sky-500/5 border-sky-500/20";
    case "warn":
      return "bg-amber-500/5 border-amber-500/20";
    case "error":
      return "bg-red-500/5 border-red-500/20";
    case "fatal":
      return "bg-fuchsia-500/5 border-fuchsia-500/30";
    case "na":
      return "bg-zinc-500/5 border-zinc-700";
  }
}

// Severity ranking used to sort the per-cert cards worst-first.
function lintStatusRank(status: Lint["status"]): number {
  switch (status) {
    case "fatal":
      return 5;
    case "fail":
      return 4;
    case "warn":
      return 3;
    case "info":
      return 2;
    case "pass":
      return 1;
  }
}

// Severity ranking used to sort the per-rule findings *inside* a card.
// Note this uses LintSeverity (which has `error`/`na`), distinct from
// LintStatus (which uses `fail` instead of `error`).
function findingSeverityRank(severity: LintSeverity): number {
  switch (severity) {
    case "fatal":
      return 5;
    case "error":
      return 4;
    case "warn":
      return 3;
    case "info":
      return 2;
    case "pass":
      return 1;
    case "na":
      return 0;
  }
}

function LintCard({
  lint,
  expanded,
  onToggle,
}: {
  lint: Lint;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Default to actionable findings (warn/error/fatal) — there are typically
  // hundreds of NA/pass entries that drown out what the user actually needs
  // to look at. Per usability feedback: "UI/UX more simplified".
  const [severityFilter, setSeverityFilter] = useState<LintSeverity | "all" | "issues">(
    "issues",
  );

  const { summary, findings } = lint.lintResults;
  const issueCount = summary.fatal + summary.error + summary.warn;
  // Sort findings worst-first (fatal → error → warn → info → pass → na), with
  // rule name as the tiebreaker so the order is stable across reloads.
  const visibleFindings = findings
    .filter((f) => {
      if (severityFilter === "all") return true;
      if (severityFilter === "issues") {
        return f.severity === "warn" || f.severity === "error" || f.severity === "fatal";
      }
      return f.severity === severityFilter;
    })
    .sort((a, b) => {
      const diff = findingSeverityRank(b.severity) - findingSeverityRank(a.severity);
      if (diff !== 0) return diff;
      return a.rule.localeCompare(b.rule);
    });

  const statusBadge = (() => {
    switch (lint.status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={10} /> PASS
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400">
            <Info size={10} /> INFO
          </span>
        );
      case "warn":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400">
            <AlertTriangle size={10} /> WARN
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-red-500/10 text-red-400">
            <XCircle size={10} /> FAIL
          </span>
        );
      case "fatal":
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-medium bg-fuchsia-500/10 text-fuchsia-400">
            <AlertOctagon size={10} /> FATAL
          </span>
        );
    }
  })();

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-900/60"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-zinc-500" />
        ) : (
          <ChevronRight size={14} className="text-zinc-500" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-mono text-sm text-zinc-200">{lint.targetName}</p>
            {statusBadge}
          </div>
          <p className="truncate font-mono text-[10px] text-zinc-600">{lint.certIssuer}</p>
        </div>
        <div className="hidden items-center gap-3 font-mono text-[11px] sm:flex">
          <span className="text-emerald-400">✓ {summary.pass}</span>
          {summary.info > 0 && <span className="text-sky-400">i {summary.info}</span>}
          {summary.warn > 0 && <span className="text-amber-400">! {summary.warn}</span>}
          {summary.error > 0 && <span className="text-red-400">✕ {summary.error}</span>}
          {summary.fatal > 0 && <span className="text-fuchsia-400">⊘ {summary.fatal}</span>}
          <span className="text-zinc-600">— {summary.na}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 bg-black/30 px-4 py-3">
          <div className="mb-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Subject</p>
              <p className="mt-0.5 truncate font-mono text-zinc-300" title={lint.certSubject}>
                {lint.certSubject}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Issuer</p>
              <p className="mt-0.5 truncate font-mono text-zinc-300" title={lint.certIssuer}>
                {lint.certIssuer}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Cert ID</p>
              <p className="mt-0.5 truncate font-mono text-zinc-300">{lint.certId}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Lint ID</p>
              <p className="mt-0.5 truncate font-mono text-zinc-300">{lint.id}</p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
            <FilterChip
              active={severityFilter === "issues"}
              label={`Issues (${issueCount})`}
              onClick={() => setSeverityFilter("issues")}
              tone="amber"
            />
            <FilterChip
              active={severityFilter === "all"}
              label={`All (${findings.length})`}
              onClick={() => setSeverityFilter("all")}
            />
            <FilterChip
              active={severityFilter === "fatal"}
              label={`Fatal (${summary.fatal})`}
              onClick={() => setSeverityFilter("fatal")}
              tone="fuchsia"
            />
            <FilterChip
              active={severityFilter === "error"}
              label={`Errors (${summary.error})`}
              onClick={() => setSeverityFilter("error")}
              tone="red"
            />
            <FilterChip
              active={severityFilter === "warn"}
              label={`Warn (${summary.warn})`}
              onClick={() => setSeverityFilter("warn")}
              tone="amber"
            />
            <FilterChip
              active={severityFilter === "info"}
              label={`Info (${summary.info})`}
              onClick={() => setSeverityFilter("info")}
              tone="sky"
            />
            <FilterChip
              active={severityFilter === "pass"}
              label={`Pass (${summary.pass})`}
              onClick={() => setSeverityFilter("pass")}
              tone="emerald"
            />
          </div>

          <div className="space-y-1.5">
            {visibleFindings.length === 0 ? (
              <p className="py-4 text-center font-mono text-xs text-zinc-600">
                No findings at this severity
              </p>
            ) : (
              visibleFindings.map((f, i) => <FindingRow key={i} finding={f} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: "red" | "amber" | "emerald" | "sky" | "fuchsia";
}) {
  const toneText =
    tone === "red"
      ? "text-red-400"
      : tone === "amber"
        ? "text-amber-400"
        : tone === "emerald"
          ? "text-emerald-400"
          : tone === "sky"
            ? "text-sky-400"
            : tone === "fuchsia"
              ? "text-fuchsia-400"
              : "text-zinc-300";

  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-[10px] font-mono transition ${
        active ? `bg-zinc-800 ${toneText}` : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function FindingRow({ finding }: { finding: LintFinding }) {
  return (
    <div className={`rounded border px-3 py-2 ${severityClass(finding.severity)}`}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5">{severityIcon(finding.severity)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] text-zinc-300">{finding.rule}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{finding.description}</p>
          {finding.details && (
            <p className="mt-1 font-mono text-[10px] text-zinc-500">{finding.details}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
  tone = "zinc",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "zinc" | "emerald" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-400"
      : tone === "red"
        ? "text-red-400"
        : "text-zinc-200";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-widest">{label}</p>
      </div>
      <p className={`mt-1 truncate font-mono text-xs ${toneClass}`} title={value}>
        {value}
      </p>
    </div>
  );
}

function SummaryPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "emerald" | "sky" | "amber" | "red" | "fuchsia";
}) {
  const bg = {
    emerald: "bg-emerald-500/10",
    sky: "bg-sky-500/10",
    amber: "bg-amber-500/10",
    red: "bg-red-500/10",
    fuchsia: "bg-fuchsia-500/10",
  }[tone];
  const text = {
    emerald: "text-emerald-400",
    sky: "text-sky-400",
    amber: "text-amber-400",
    red: "text-red-400",
    fuchsia: "text-fuchsia-400",
  }[tone];

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-md ${bg} px-2.5 py-1 font-mono text-xl font-semibold ${text}`}>
        {count}
      </span>
      <span className="font-mono text-xs text-zinc-400">{label}</span>
    </div>
  );
}

/**
 * Meta card variant for report generation status.
 * Receives initialStatus from the server (pre-fetched in ScanResultPage)
 * Auto triggers generation on scan if status is not already Ready.
 * View/download buttons are disabled until status reaches Ready.
 */
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json())

function ReportBox({ scanId, initialStatus }: { scanId: string, initialStatus: string }) {
  const [triggered, setTriggered] = useState(false)

  // Poll /api/reports every 3s until report is Ready or Failed
  const { data: reports } = useSWR(
    "/api/reports",
    fetcher,
    {
      refreshInterval: (data) => {
        // Stop polling once this scan's report is Ready or Failed
        const report = data?.find((r: any) => r.id === scanId)
        if (report?.pdf_status === "Ready" || report?.pdf_status === "Failed") return 0
        return 3000
      },
      fallbackData: [],
    }
  )

  // Derive status from SWR data, fall back to initialStatus
  const report = reports?.find((r: any) => r.id === scanId)
  const status = (report?.pdf_status ?? initialStatus) as "Pending" | "Generating" | "Ready" | "Failed"

  // Trigger generation once on mount if not already Ready
  useEffect(() => {
    if (status === "Ready" || triggered) return
    setTriggered(true)
    fetch(`/api/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scan_id: scanId }),
    }).catch(console.error)
  }, [scanId, status, triggered])

  const handleView = () => {
    window.open(`/api/reports/${scanId}`, "_blank")
  }

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = `/api/reports/${scanId}?download=true`
    a.download = `report-${scanId}.html`
    a.click()
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <FileText size={12} />
        <p className="font-mono text-[10px] uppercase tracking-widest">Report</p>
      </div>
      <div className="mt-1 flex items-center justify-between">
        {status === "Generating" || status === "Pending" ? (
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Loader2 size={11} className="animate-spin" />
            <span className="font-mono text-xs">Generating</span>
          </div>
        ) : status === "Ready" ? (
          <span className="font-mono text-xs text-emerald-400">Ready</span>
        ) : (
          <span className="font-mono text-xs text-red-400">Failed</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleView}
            disabled={status !== "Ready"}
            className={`transition ${status === "Ready" ? "text-zinc-400 hover:text-zinc-100" : "cursor-not-allowed text-zinc-700"}`}
            title="View report"
          >
            <Eye size={13} />
          </button>
          <button
            onClick={handleDownload}
            disabled={status !== "Ready"}
            className={`transition ${status === "Ready" ? "text-zinc-400 hover:text-zinc-100" : "cursor-not-allowed text-zinc-700"}`}
            title="Download report"
          >
            <Download size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ScanResultDetail({
  scan,
  lints,
  initialReportStatus,
}: {
  scan: FinishedScan;
  lints: Lint[];
  initialReportStatus: string;
}) {
  console.log("initialReportStatus:", initialReportStatus)
  const failingCertCount = lints.filter(
    (l) => l.status === "fatal" || l.status === "fail",
  ).length;
  const showFailureCallout = scan.status === "failed" && failingCertCount > 0;

  // Collect the most common error/fatal rules across all certs in this scan
  // so the callout can tell the user *why* it failed without making them
  // expand every lint card.
  const topFailureReasons = (() => {
    const counts = new Map<string, { count: number; description: string }>();
    for (const lint of lints) {
      for (const finding of lint.lintResults.findings) {
        if (finding.severity !== "error" && finding.severity !== "fatal") continue;
        const existing = counts.get(finding.rule);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(finding.rule, { count: 1, description: finding.description });
        }
      }
    }
    return Array.from(counts.entries())
      .map(([rule, { count, description }]) => ({ rule, count, description }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  })();

  // Render cards worst-first (fatal → fail → warn → info → pass) so the operator
  // triages from the top. Tiebreak by target name to keep the order stable across
  // reloads — the Go service returns rows in S3-fetch-completion order otherwise.
  const sortedLints = [...lints].sort((a, b) => {
    const rankDiff = lintStatusRank(b.status) - lintStatusRank(a.status);
    if (rankDiff !== 0) return rankDiff;
    return (a.targetName ?? "").localeCompare(b.targetName ?? "");
  });

  // Per-cert search + controlled expand state for Expand-all / Collapse-all.
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const visibleLints = searchQuery
    ? sortedLints.filter((lint) => {
        const q = searchQuery.toLowerCase();
        return (
          lint.targetName.toLowerCase().includes(q) ||
          lint.certSubject.toLowerCase().includes(q) ||
          lint.certIssuer.toLowerCase().includes(q)
        );
      })
    : sortedLints;

  const allVisibleExpanded =
    visibleLints.length > 0 &&
    visibleLints.every((l) => expandedIds.has(l.id));

  const toggleOne = (id: string) => {
    setExpandedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () =>
    setExpandedIds(new Set(visibleLints.map((l) => l.id)));
  const collapseAll = () => setExpandedIds(new Set());

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
        <span className="truncate text-zinc-300">{scan.name}</span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-mono text-2xl font-semibold text-zinc-100">
              {scan.name}
            </h1>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">{scan.id}</p>
          </div>
          <div>
            {scan.status === "completed" ? (
              <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={12} /> COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-mono font-medium bg-red-500/10 text-red-400">
                <XCircle size={12} /> FAILED
              </span>
            )}
          </div>
        </div>

        {/* Updated grid: 5 columns to include the new Report box */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MetaCard
            icon={<Calendar size={12} />}
            label="Scanned"
            value={new Date(scan.scannedAt).toLocaleString()}
          />
          <MetaCard
            icon={<TargetIcon size={12} />}
            label="Targets"
            value={String(scan.targetCount)}
          />
          <MetaCard
            icon={<Shield size={12} />}
            label="Certificates Linted"
            value={String(lints.length)}
          />
          <MetaCard
            icon={<FileCode size={12} />}
            label="Status"
            value={scan.status.toUpperCase()}
            tone={scan.status === "completed" ? "emerald" : "red"}
          />
          <ReportBox scanId={scan.id} initialStatus={initialReportStatus} />
        </div>
      </header>

      {showFailureCallout && (
        <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertOctagon size={18} className="mt-0.5 shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-red-400">
                Why this scan failed
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {failingCertCount} certificate{failingCertCount !== 1 ? "s" : ""}{" "}
                produced error or fatal findings.
                {topFailureReasons.length > 0 &&
                  " The most common reasons across this scan:"}
              </p>
              {topFailureReasons.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {topFailureReasons.map((reason) => (
                    <li
                      key={reason.rule}
                      className="rounded border border-red-500/20 bg-black/30 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-mono text-[11px] text-red-300">
                          {reason.rule}
                        </p>
                        <span className="shrink-0 font-mono text-[10px] text-red-400">
                          ×{reason.count}
                        </span>
                      </div>
                      {reason.description && (
                        <p className="mt-1 text-xs text-zinc-400">{reason.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Result Summary
        </p>
        <div className="flex flex-wrap gap-5">
          <SummaryPill count={scan.lintsPass} label="Pass" tone="emerald" />
          <SummaryPill count={scan.lintsInfo} label="Info" tone="sky" />
          <SummaryPill count={scan.lintsWarn} label="Warn" tone="amber" />
          <SummaryPill count={scan.lintsFail} label="Fail" tone="red" />
          <SummaryPill count={scan.lintsFatal} label="Fatal" tone="fuchsia" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
              Lint Results
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {visibleLints.length === sortedLints.length
                ? `${sortedLints.length} certificate${sortedLints.length !== 1 ? "s" : ""}`
                : `${visibleLints.length} of ${sortedLints.length} certificate${sortedLints.length !== 1 ? "s" : ""}`}
              {" · click to expand findings"}
            </p>
          </div>

          {lints.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search host, subject, issuer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600 sm:w-72"
                />
              </div>
              <button
                type="button"
                onClick={allVisibleExpanded ? collapseAll : expandAll}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs font-mono text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900/80"
              >
                {allVisibleExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>
          )}
        </div>

        {lints.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-12 text-center">
            <p className="font-mono text-xs text-zinc-600">No lint data available for this scan</p>
          </div>
        ) : visibleLints.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-12 text-center">
            <p className="font-mono text-xs text-zinc-600">No certificates match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleLints.map((lint) => (
              <LintCard
                key={lint.id}
                lint={lint}
                expanded={expandedIds.has(lint.id)}
                onToggle={() => toggleOne(lint.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}