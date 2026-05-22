"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertOctagon,
  XCircle,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";

type CriticalFinding = {
  id: string;
  scan_id: string;
  scan_name: string;
  target_id: string | null;
  cert_id: string | null;
  severity?: string;
  status: string;
  name: string;
  description: string;
  citation?: string | null;
  source?: string | null;
  detail_url: string;
};

type FilterType = "all" | "fatal" | "fail";

type CriticalFindingsClientProps = {
  findings: CriticalFinding[];
};

function getSeverity(finding: CriticalFinding) {
  const severity = String(finding.severity || "").toLowerCase().trim();
  const status = String(finding.status || "").toLowerCase().trim();

  if (severity === "fatal" || status === "fatal") {
    return "Fatal";
  }

  return "Fail";
}

function formatRuleName(name: string) {
  return name
    .replace(/^e_/, "")
    .replace(/^w_/, "")
    .replace(/^n_/, "")
    .replace(/^smelt_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "Fatal") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-fuchsia-500/10 px-2 py-0.5 font-mono text-xs font-medium text-fuchsia-400">
        <AlertOctagon size={11} />
        FATAL
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 font-mono text-xs font-medium text-red-400">
      <XCircle size={11} />
      FAIL
    </span>
  );
}

function CriticalStatCard({
  label,
  value,
  icon,
  color,
  bg,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  active: boolean;
  onClick: () => void;
}) {
  const baseClasses = "rounded-xl border px-4 py-4 text-left transition";

  const stateClasses = active
    ? "border-zinc-500 bg-zinc-800/80 ring-1 ring-inset ring-zinc-500/40"
    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
      aria-pressed={active}
    >
      <div className="flex items-center gap-2">
        <span className={`${color} ${bg} rounded-md p-1.5`}>{icon}</span>

        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {label}
        </p>
      </div>

      <p className={`mt-2 font-mono text-2xl font-semibold ${color}`}>
        {value}
      </p>
    </button>
  );
}

export default function CriticalFindingsClient({
  findings,
}: CriticalFindingsClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const fatalFindings = useMemo(
    () => findings.filter((finding) => getSeverity(finding) === "Fatal"),
    [findings]
  );

  const failFindings = useMemo(
    () => findings.filter((finding) => getSeverity(finding) === "Fail"),
    [findings]
  );

  const filteredFindings = useMemo(() => {
    if (selectedFilter === "fatal") {
      return fatalFindings;
    }

    if (selectedFilter === "fail") {
      return failFindings;
    }

    return findings;
  }, [findings, fatalFindings, failFindings, selectedFilter]);

  return (
    <div className="flex flex-col gap-6 p-8">
      <nav className="flex items-center gap-2 font-mono text-xs">
        <Link
          href="/main/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft size={12} />
          Back
        </Link>

        <span className="text-zinc-700">/</span>

        <Link
          href="/main/dashboard"
          className="text-zinc-500 transition hover:text-zinc-300"
        >
          Dashboard
        </Link>

        <span className="text-zinc-700">/</span>

        <span className="text-zinc-300">Fatal / Fail Findings</span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-fuchsia-500/10 p-2.5 text-fuchsia-400">
            <TriangleAlert size={18} />
          </div>

          <div>
            <h1 className="font-mono text-2xl font-semibold text-zinc-100">
              Fatal / Fail Findings
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              TLS compliance checks with fatal or failed status that require
              review.
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <CriticalStatCard
          label="Total Findings"
          value={findings.length}
          icon={<TriangleAlert size={16} />}
          color="text-zinc-100"
          bg="bg-zinc-800/50"
          active={selectedFilter === "all"}
          onClick={() => setSelectedFilter("all")}
        />

        <CriticalStatCard
          label="Fatal"
          value={fatalFindings.length}
          icon={<AlertOctagon size={16} />}
          color="text-fuchsia-400"
          bg="bg-fuchsia-500/10"
          active={selectedFilter === "fatal"}
          onClick={() => setSelectedFilter("fatal")}
        />

        <CriticalStatCard
          label="Fail"
          value={failFindings.length}
          icon={<XCircle size={16} />}
          color="text-red-400"
          bg="bg-red-500/10"
          active={selectedFilter === "fail"}
          onClick={() => setSelectedFilter("fail")}
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
              {selectedFilter === "all"
                ? "All Critical Findings"
                : selectedFilter === "fatal"
                  ? "Fatal Findings"
                  : "Failed Findings"}
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">
              {filteredFindings.length} of {findings.length} finding
              {findings.length !== 1 ? "s" : ""} · click to inspect scan result
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left font-mono text-xs uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3">Rule</th>
                <th className="px-5 py-3">Scan</th>
                <th className="px-5 py-3">Certificate / Target</th>
                <th className="px-5 py-3">Severity</th>
                <th className="w-10 px-5 py-3" />
              </tr>
            </thead>

            <tbody>
              {filteredFindings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center font-mono text-xs text-zinc-600"
                  >
                    No fatal or failed findings found
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => {
                  const severity = getSeverity(finding);

                  return (
                    <tr
                      key={finding.id}
                      className="border-b border-zinc-800/60 transition last:border-b-0 hover:bg-zinc-900/40"
                    >
                      <td className="px-5 py-4">
                        <Link href={finding.detail_url} className="block">
                          <p className="font-mono text-sm text-zinc-200">
                            {formatRuleName(finding.name)}
                          </p>

                          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                            {finding.name}
                          </p>

                          <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                            {finding.description || "No description available."}
                          </p>

                          {finding.citation && (
                            <p className="mt-1 line-clamp-1 font-mono text-[10px] text-zinc-600">
                              {finding.citation}
                            </p>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={finding.detail_url} className="block">
                          <p className="font-mono text-sm text-zinc-300">
                            {finding.scan_name || "Unnamed Scan"}
                          </p>

                          <p className="mt-0.5 break-all font-mono text-[10px] text-zinc-600">
                            {finding.scan_id.slice(0, 8)}
                          </p>

                          {finding.source && (
                            <p className="mt-1 font-mono text-[10px] text-zinc-600">
                              Source: {finding.source}
                            </p>
                          )}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={finding.detail_url} className="block">
                          <p className="break-all font-mono text-xs text-zinc-300">
                            {finding.cert_id && finding.cert_id !== "None"
                              ? finding.cert_id
                              : "No certificate ID"}
                          </p>

                          <p className="mt-1 break-all font-mono text-[10px] text-zinc-600">
                            Target: {finding.target_id || "N/A"}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={finding.detail_url} className="block">
                          <SeverityBadge severity={severity} />
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        <Link href={finding.detail_url}>
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
    </div>
  );
}