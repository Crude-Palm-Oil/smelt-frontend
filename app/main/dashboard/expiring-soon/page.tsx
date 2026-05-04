import Link from "next/link";
import { ArrowLeft, ClockAlert } from "lucide-react";

const expiringCertificates = [
  {
    domain: "api.legacy-service.internal",
    issuer: "DigiCert TLS RSA SHA256 2020 CA1",
    expiryDate: "2026-04-25",
    daysLeft: 6,
    status: "Critical",
  },
  {
    domain: "mail.corp.internal",
    issuer: "GlobalSign GCC R3 DV TLS CA 2020",
    expiryDate: "2026-04-28",
    daysLeft: 9,
    status: "Critical",
  },
  {
    domain: "vendor-certs.platform.io",
    issuer: "Sectigo RSA Domain Validation Secure Server CA",
    expiryDate: "2026-05-02",
    daysLeft: 13,
    status: "Warning",
  },
  {
    domain: "staging.smelt.dev",
    issuer: "Let’s Encrypt R3",
    expiryDate: "2026-05-07",
    daysLeft: 18,
    status: "Warning",
  },
  {
    domain: "auth.service.net",
    issuer: "Amazon RSA 2048 M02",
    expiryDate: "2026-05-14",
    daysLeft: 25,
    status: "Notice",
  },
];

function getStatusClass(status: string) {
  if (status === "Critical") {
    return "border-red-500/40 bg-red-500/10 text-red-400";
  }

  if (status === "Warning") {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  }

  return "border-zinc-600 bg-zinc-800 text-zinc-300";
}

export default function ExpiringSoonPage() {
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
              Certificates that will expire within the next 30 days.
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Total Expiring
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">10</p>
          <p className="mt-2 text-xs text-zinc-500">Within 30 days</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Critical Window
          </p>
          <p className="mt-4 text-3xl font-semibold text-yellow-400">2</p>
          <p className="mt-2 text-xs text-zinc-500">Expiring in 10 days</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Action Needed
          </p>
          <p className="mt-4 text-3xl font-semibold text-emerald-400">5</p>
          <p className="mt-2 text-xs text-zinc-500">Renewal review required</p>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-5">
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-300">
            Expiring Certificates
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Prioritise certificates with the shortest remaining validity period.
          </p>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/40 text-xs uppercase tracking-[0.25em] text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Domain</th>
                <th className="px-6 py-4 font-medium">Issuer</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Days Left</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {expiringCertificates.map((cert) => (
                <tr
                  key={cert.domain}
                  className="border-b border-zinc-900 last:border-0"
                >
                  <td className="px-6 py-5 text-cyan-400">{cert.domain}</td>
                  <td className="px-6 py-5 text-zinc-400">{cert.issuer}</td>
                  <td className="px-6 py-5 text-zinc-400">
                    {cert.expiryDate}
                  </td>
                  <td className="px-6 py-5 text-zinc-300">
                    {cert.daysLeft} days
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-md border px-3 py-1 text-xs ${getStatusClass(
                        cert.status
                      )}`}
                    >
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}