import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { getCriticalFindings } from "@/lib/server/dashboard";

function getSeverityLabel(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "fatal") {
    return "Fatal";
  }

  if (normalizedStatus === "error" || normalizedStatus === "fail") {
    return "Critical";
  }

  return "Critical";
}

function getSeverityClass(severity: string) {
  if (severity === "Fatal") {
    return "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400";
  }

  return "border-red-500/40 bg-red-500/10 text-red-400";
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

export default async function CriticalFindingsPage() {
  const findings = await getCriticalFindings();

  const totalFindings = findings.length;

  const fatalFindings = findings.filter(
    (finding) => finding.status.toLowerCase() === "fatal"
  ).length;

  const affectedScans = new Set(findings.map((finding) => finding.scan_id)).size;

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
              Critical / Fatal Findings
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              High-risk TLS compliance issues that require immediate review.
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
          <p className="mt-2 text-xs text-zinc-500">Critical or fatal issues</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Fatal Findings
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">
            {fatalFindings}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Immediate action required</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Affected Scans
          </p>
          <p className="mt-4 text-3xl font-semibold text-yellow-400">
            {affectedScans}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Scans contain major issues
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {findings.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-sm text-zinc-400">
              No critical or fatal findings found.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              New findings will appear here after scan results are processed.
            </p>
          </div>
        ) : (
          findings.map((finding) => {
            const severity = getSeverityLabel(finding.status);

            return (
              <div
                key={finding.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
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
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}