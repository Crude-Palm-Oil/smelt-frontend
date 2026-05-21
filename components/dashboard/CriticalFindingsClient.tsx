"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, TriangleAlert } from "lucide-react";

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
  const severity = String(finding.severity || "").toLowerCase();
  const status = String(finding.status || "").toLowerCase();

  if (severity === "fatal" || status === "fatal") {
    return "Fatal";
  }

  return "Fail";
}

function getSeverityClass(severity: string) {
  if (severity === "Fatal") {
    return "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400";
  }

  return "border-red-500/40 bg-red-500/10 text-red-400";
}

function getFilterClass(isActive: boolean) {
  if (isActive) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }

  return "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-200";
}

function formatRuleName(name: string) {
  return name
    .replace(/^e_/, "")
    .replace(/^w_/, "")
    .replace(/^n_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CriticalFindingsClient({
  findings,
}: CriticalFindingsClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const severity = getSeverity(finding).toLowerCase();

      if (selectedFilter === "fatal") {
        return severity === "fatal";
      }

      if (selectedFilter === "fail") {
        return severity === "fail";
      }

      return true;
    });
  }, [findings, selectedFilter]);

  const totalFindings = findings.length;

  const fatalFindings = findings.filter(
  (finding) => getSeverity(finding) === "Fatal"
  ).length;

  const failFindings = findings.filter(
  (finding) => getSeverity(finding) === "Fail"
  ).length;

  return (
    <main className="min-h-screen bg-[#080809] px-8 py-6 text-zinc-100">
      <div className="mb-8">
        <Link
          href="/main/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-fuchsia-500/10 p-3">
            <TriangleAlert className="text-fuchsia-400" size={22} />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-wide">
              Fatal / Fail Findings
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              TLS compliance checks with fatal or failed status that require
              review.
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Total Findings
          </p>
          <p className="mt-4 text-3xl font-semibold text-fuchsia-400">
            {totalFindings}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Filtered findings</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Fatal
          </p>
          <p className="mt-4 text-3xl font-semibold text-fuchsia-400">
            {fatalFindings}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Highest severity issues</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Fail
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">
            {failFindings}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Failed compliance checks</p>
        </div>

      </section>

      <section className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`rounded-lg border px-4 py-2 text-sm ${getFilterClass(
            selectedFilter === "all"
          )}`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("fatal")}
          className={`rounded-lg border px-4 py-2 text-sm ${getFilterClass(
            selectedFilter === "fatal"
          )}`}
        >
          Fatal
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("fail")}
          className={`rounded-lg border px-4 py-2 text-sm ${getFilterClass(
            selectedFilter === "fail"
          )}`}
        >
          Fail
        </button>
      </section>

      <p className="mt-6 text-xs text-zinc-500">
        Showing {filteredFindings.length} of {findings.length} findings
      </p>

      <section className="mt-3 space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm text-zinc-400">
              No fatal or failed findings found.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              New findings will appear here after scan results are processed.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const severity = getSeverity(finding);

            return (
              <Link
                key={finding.id}
                href={finding.detail_url}
                className="block rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-emerald-500/40 hover:bg-zinc-900/40"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-md border px-3 py-1 text-xs ${getSeverityClass(
                          severity
                        )}`}
                      >
                        {severity}
                      </span>

                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                        {finding.scan_name || "Unnamed Scan"}
                      </p>

                      {finding.source && (
                        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                          {finding.source}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-medium text-zinc-100">
                      {formatRuleName(finding.name)}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      Rule: {finding.name}
                    </p>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                      {finding.description || "No description available."}
                    </p>

                    {finding.citation && (
                      <p className="mt-3 text-xs text-zinc-600">
                        Citation: {finding.citation}
                      </p>
                    )}

                    <p className="mt-4 text-xs text-emerald-400">
                      View scan certificate details →
                    </p>
                  </div>

                  <div className="min-w-48 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-right">
                    <p className="text-xs text-zinc-500">Certificate</p>
                    <p className="mt-1 break-all text-sm font-medium text-zinc-200">
                      {finding.cert_id || "N/A"}
                    </p>

                    <p className="mt-3 text-xs text-zinc-500">Target</p>
                    <p className="mt-1 break-all text-xs text-zinc-400">
                      {finding.target_id || "N/A"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </main>
  );
}