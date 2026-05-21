import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCompliancePassFindings } from "@/lib/server/dashboard";

function getStatusStyle(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "pass") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (normalizedStatus === "warn") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-zinc-700 bg-zinc-800 text-zinc-300";
}

function getFindingHref(
  scanId: string,
  certId: string | null,
  targetId: string | null
) {
  if (certId) {
    return `/main/results/${scanId}?certId=${certId}`;
  }

  if (targetId) {
    return `/main/results/${scanId}?targetId=${targetId}`;
  }

  return `/main/results/${scanId}`;
}

export default async function CompliancePassRatePage() {
  const complianceFindings = await getCompliancePassFindings();

  return (
    <main className="min-h-screen bg-[#09090b] p-8 text-white">
      <div className="mb-8">
        <Link
          href="/main/dashboard"
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <p className="text-sm text-zinc-500">
          Dashboard / Compliance Pass Rate
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Passed and Warning Certificate Checks
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          This page shows certificate checks that are counted in the compliance
          pass rate. Both PASS and WARN statuses are included.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-[1.2fr_1fr_120px_1.5fr] border-b border-zinc-800 px-6 py-4 text-xs uppercase text-zinc-500">
          <p>Scan</p>
          <p>Certificate / Target</p>
          <p>Status</p>
          <p>Check</p>
        </div>

        {complianceFindings.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {complianceFindings.map((finding) => (
              <Link
                key={`${finding.scan_id}-${finding.target_id}-${finding.cert_id}-${finding.name}`}
                href={getFindingHref(
                  finding.scan_id,
                  finding.cert_id,
                  finding.target_id
                )}
                className="grid grid-cols-[1.2fr_1fr_120px_1.5fr] px-6 py-4 text-sm transition hover:bg-zinc-900"
              >
                <div>
                  <p className="font-medium text-zinc-100">
                    {finding.scan_name || "Untitled Scan"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {finding.scan_id}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-300">
                    {finding.cert_id
                      ? `Cert ${finding.cert_id}`
                      : finding.target_id
                        ? `Target ${finding.target_id}`
                        : "Scan-level"}
                  </p>
                </div>

                <div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                      finding.status
                    )}`}
                  >
                    {finding.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-zinc-200">{finding.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {finding.description || "No description available."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-300">
              No PASS or WARN checks found.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Compliance pass rate findings will appear here after scans are
              completed.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}