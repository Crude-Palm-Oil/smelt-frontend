"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
} from "lucide-react";
import type { CertificateSummary, LintStatus } from "@/lib/mock-results-data";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "clean" | "issues";

function StatusBadge({ status }: { status: LintStatus }) {
  switch (status) {
    case "fatal":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-fuchsia-500/10 text-fuchsia-400">
          <AlertOctagon size={11} /> FATAL
        </span>
      );
    case "fail":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-red-500/10 text-red-400">
          <XCircle size={11} /> FAIL
        </span>
      );
    case "warn":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-amber-500/10 text-amber-400">
          <AlertTriangle size={11} /> WARN
        </span>
      );
    case "info":
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-sky-500/10 text-sky-400">
          <Info size={11} /> INFO
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={11} /> PASS
        </span>
      );
  }
}

function hasIssues(c: CertificateSummary): boolean {
  return c.lintsWarn > 0 || c.lintsFail > 0 || c.lintsFatal > 0;
}

export default function CertificatesTable({
  certificates,
}: {
  certificates: CertificateSummary[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Search is now CN/issuer only — fingerprint isn't a primary identity here.
  const filtered = certificates.filter((c) => {
    if (filter === "clean" && hasIssues(c)) return false;
    if (filter === "issues" && !hasIssues(c)) return false;
    if (query) {
      const q = query.toLowerCase();
      const inCn = c.commonName.toLowerCase().includes(q);
      const inIssuer = c.issuerCn?.toLowerCase().includes(q) ?? false;
      if (!inCn && !inIssuer) return false;
    }
    return true;
  });

  const filterBtn = (value: Filter, label: string) => (
    <button
      onClick={() => setFilter(value)}
      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
        filter === value
          ? "bg-zinc-700 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-zinc-100">
          Certificates
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Grouped by Subject CN · click for compliance history
        </p>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {filterBtn("all", "All")}
          {filterBtn("clean", "Clean")}
          {filterBtn("issues", "Issues")}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search CN or issuer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Common Name</th>
              <th className="px-5 py-3">Issuer</th>
              <th className="px-5 py-3">Earliest Expiry</th>
              <th className="px-5 py-3">Certs</th>
              <th className="px-5 py-3">Scans</th>
              <th className="px-5 py-3">Worst</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-zinc-600">
                  No certificates found
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.commonName}
                  onClick={() =>
                    router.push(
                      `/main/results/certificate/${encodeURIComponent(row.commonName)}`,
                    )
                  }
                  className="cursor-pointer border-b border-zinc-800/60 transition hover:bg-zinc-900/40 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-zinc-200">{row.commonName}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-400 truncate max-w-[180px]">
                    {row.issuerCn ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-zinc-400" title={row.notAfter ?? ""}>
                    {row.notAfter
                      ? new Date(row.notAfter).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-300">
                    {row.certCount}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-300">
                    {row.scanCount}
                    {row.lastScannedAt && (
                      <p
                        className="font-mono text-[10px] text-zinc-600"
                        title={row.lastScannedAt}
                      >
                        last · {timeAgo(row.lastScannedAt)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={(row.worstStatus as LintStatus) ?? "pass"} />
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
