import Link from "next/link";
import { ArrowLeft, ClockAlert } from "lucide-react";

type ExpiringFinding = {
  scan_id: string;
  scan_name: string;
  target_id: string | null;
  cert_id: string | null;
  name: string;
  status: string;
  description: string;
  citation: string | null;
  source: string | null;
};

async function getExpiringSoon(): Promise<ExpiringFinding[]> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${apiBaseUrl}/api/dashboard/expiring-soon`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch expiring soon findings");
  }

  return res.json();
}

function getStatusLabel(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "fatal" || normalizedStatus === "error") {
    return "Critical";
  }

  if (normalizedStatus === "warn" || normalizedStatus === "warning") {
    return "Warning";
  }

  return "Notice";
}

function getStatusClass(status: string) {
  if (status === "Critical") {
    return "border-red-500/40 bg-red-500/10 text-red-400";
  }

  if (status === "Warning") {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  }

  return "border-zinc-600 bg-zinc-800 text-zinc-300";
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

export default async function ExpiringSoonPage() {
  const expiringCertificates = await getExpiringSoon();

  const totalExpiring = expiringCertificates.length;

  const criticalWindow = expiringCertificates.filter((cert) => {
    const statusLabel = getStatusLabel(cert.status);
    return statusLabel === "Critical";
  }).length;

  const affectedScans = new Set(
    expiringCertificates.map((cert) => cert.scan_id)
  ).size;

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
          <div className="rounded-lg bg-red-500/10 p-3">
            <ClockAlert className="text-red-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide">
              Expiring Soon
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Certificate validity findings that require renewal or expiry review.
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Total Expiring
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">
            {totalExpiring}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Validity-related findings
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Critical Window
          </p>
          <p className="mt-4 text-3xl font-semibold text-yellow-400">
            {criticalWindow}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Critical expiry findings
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Affected Scans
          </p>
          <p className="mt-4 text-3xl font-semibold text-emerald-400">
            {affectedScans}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Scans requiring review</p>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-300">
            Expiring Certificates
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Prioritise validity-related findings from recent scan results.
          </p>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/40 text-xs uppercase tracking-[0.25em] text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Rule</th>
                <th className="px-6 py-4 font-medium">Scan</th>
                <th className="px-6 py-4 font-medium">Certificate</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {expiringCertificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <p className="text-sm text-zinc-400">
                      No expiring certificate findings found.
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Validity-related warnings will appear here after scan
                      results are processed.
                    </p>
                  </td>
                </tr>
              ) : (
                expiringCertificates.map((cert) => {
                  const statusLabel = getStatusLabel(cert.status);

                  return (
                    <tr
                      key={`${cert.scan_id}-${cert.target_id}-${cert.name}`}
                      className="border-b border-zinc-900 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-cyan-400">
                          {formatRuleName(cert.name)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {cert.name}
                        </p>
                        <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
                          {cert.description || "No description available."}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-zinc-400">
                        {cert.scan_name || "Unnamed Scan"}
                      </td>

                      <td className="px-6 py-5">
                        <p className="break-all text-zinc-300">
                          {cert.cert_id || "N/A"}
                        </p>
                        <p className="mt-1 break-all text-xs text-zinc-600">
                          Target: {cert.target_id || "N/A"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-zinc-400">
                        {cert.source || "N/A"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-md border px-3 py-1 text-xs ${getStatusClass(
                            statusLabel
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}