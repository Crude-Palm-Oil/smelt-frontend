import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

const findings = [
  {
    title: "SHA-1 Signature Detected",
    scan: "Legacy Services Audit",
    severity: "Critical",
    affected: "3 certificates",
    description:
      "One or more certificates are still using SHA-1 based signatures and should be replaced.",
  },
  {
    title: "Expired Certificate Still Active",
    scan: "Legacy Services Audit",
    severity: "Fatal",
    affected: "1 certificate",
    description:
      "An expired certificate is still being served by a monitored endpoint.",
  },
  {
    title: "Oversized Certificate Lifetime",
    scan: "Third-party Vendor Certs",
    severity: "Critical",
    affected: "2 certificates",
    description:
      "Certificate lifetime exceeds the accepted compliance threshold.",
  },
];

function getSeverityClass(severity: string) {
  if (severity === "Fatal") {
    return "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400";
  }

  return "border-red-500/40 bg-red-500/10 text-red-400";
}

export default function CriticalFindingsPage() {
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
          <p className="mt-4 text-3xl font-semibold text-fuchsia-400">3</p>
          <p className="mt-2 text-xs text-zinc-500">Critical or fatal issues</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Fatal Findings
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">1</p>
          <p className="mt-2 text-xs text-zinc-500">Immediate action required</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Affected Scans
          </p>
          <p className="mt-4 text-3xl font-semibold text-yellow-400">2</p>
          <p className="mt-2 text-xs text-zinc-500">Scans contain major issues</p>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {findings.map((finding) => (
          <div
            key={finding.title}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`rounded-md border px-3 py-1 text-xs ${getSeverityClass(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>

                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                    {finding.scan}
                  </p>
                </div>

                <h2 className="text-base font-medium text-zinc-100">
                  {finding.title}
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                  {finding.description}
                </p>
              </div>

              <div className="min-w-40 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-right">
                <p className="text-xs text-zinc-500">Affected</p>
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {finding.affected}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}