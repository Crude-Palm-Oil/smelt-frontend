"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Info,
} from "lucide-react";

type ComplianceFinding = {
  scan_id: string;
  scan_name: string;
  target_id: string | null;
  cert_id: string | null;
  status: string;
  name: string;
  description: string;
};

type FilterType = "all" | "pass" | "info" | "warn";

type CompliancePassRateClientProps = {
  findings: ComplianceFinding[];
};

function getStatusLabel(status: string) {
  const normalizedStatus = status.toLowerCase().trim();

  if (normalizedStatus === "warn" || normalizedStatus === "warning") {
    return "WARN";
  }

  if (normalizedStatus === "info") {
    return "INFO";
  }

  return "PASS";
}

function StatusBadge({ status }: { status: string }) {
  const label = getStatusLabel(status);

  if (label === "WARN") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-medium text-amber-400">
        <AlertTriangle size={11} />
        WARN
      </span>
    );
  }

  if (label === "INFO") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-medium text-sky-400">
        <Info size={11} />
        INFO
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-emerald-400">
      <CheckCircle2 size={11} />
      PASS
    </span>
  );
}

function getFindingHref(
  scanId: string,
  certId: string | null,
  targetId: string | null
) {
  const params = new URLSearchParams();

  if (targetId) {
    params.set("targetId", targetId);
  }

  if (certId && certId !== "None") {
    params.set("certId", certId);
  }

  const query = params.toString();

  if (!query) {
    return `/main/results/${scanId}`;
  }

  return `/main/results/${scanId}?${query}`;
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

function ComplianceStatCard({
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

export default function CompliancePassRateClient({
  findings,
}: CompliancePassRateClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const passFindings = useMemo(
    () => findings.filter((finding) => getStatusLabel(finding.status) === "PASS"),
    [findings]
  );

  const infoFindings = useMemo(
    () => findings.filter((finding) => getStatusLabel(finding.status) === "INFO"),
    [findings]
  );

  const warnFindings = useMemo(
    () => findings.filter((finding) => getStatusLabel(finding.status) === "WARN"),
    [findings]
  );

  const filteredFindings = useMemo(() => {
    if (selectedFilter === "pass") {
      return passFindings;
    }

    if (selectedFilter === "info") {
      return infoFindings;
    }

    if (selectedFilter === "warn") {
      return warnFindings;
    }

    return findings;
  }, [
    findings,
    passFindings,
    infoFindings,
    warnFindings,
    selectedFilter,
  ]);

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

        <span className="text-zinc-300">Compliance Pass Rate</span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
            <ShieldCheck size={18} />
          </div>

          <div>
            <h1 className="font-mono text-2xl font-semibold text-zinc-100">
              Passed, Info, and Warning Certificate Checks
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Certificate checks counted in the compliance pass rate. PASS,
              INFO, and WARN statuses are included.
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-3">
        <ComplianceStatCard
          label="Total Counted"
          value={findings.length}
          icon={<ShieldCheck size={16} />}
          color="text-zinc-100"
          bg="bg-zinc-800/50"
          active={selectedFilter === "all"}
          onClick={() => setSelectedFilter("all")}
        />

        <ComplianceStatCard
          label="Passed"
          value={passFindings.length}
          icon={<CheckCircle2 size={16} />}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          active={selectedFilter === "pass"}
          onClick={() => setSelectedFilter("pass")}
        />

        <ComplianceStatCard
          label="Info"
          value={infoFindings.length}
          icon={<Info size={16} />}
          color="text-sky-400"
          bg="bg-sky-500/10"
          active={selectedFilter === "info"}
          onClick={() => setSelectedFilter("info")}
        />

        <ComplianceStatCard
          label="Warnings"
          value={warnFindings.length}
          icon={<AlertTriangle size={16} />}
          color="text-amber-400"
          bg="bg-amber-500/10"
          active={selectedFilter === "warn"}
          onClick={() => setSelectedFilter("warn")}
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
              {selectedFilter === "all"
                ? "Compliance Findings"
                : selectedFilter === "pass"
                  ? "Passed Findings"
                  : selectedFilter === "info"
                    ? "Info Findings"
                    : "Warning Findings"}
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
                <th className="px-5 py-3">Check</th>
                <th className="px-5 py-3">Scan</th>
                <th className="px-5 py-3">Certificate / Target</th>
                <th className="px-5 py-3">Status</th>
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
                    No findings found for this filter
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => {
                  const href = getFindingHref(
                    finding.scan_id,
                    finding.cert_id,
                    finding.target_id
                  );

                  return (
                    <tr
                      key={`${finding.scan_id}-${finding.target_id}-${finding.cert_id}-${finding.name}-${finding.status}`}
                      className="border-b border-zinc-800/60 transition last:border-b-0 hover:bg-zinc-900/40"
                    >
                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="font-mono text-sm text-zinc-200">
                            {formatRuleName(finding.name)}
                          </p>

                          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                            {finding.name}
                          </p>

                          <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                            {finding.description || "No description available."}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="font-mono text-sm text-zinc-300">
                            {finding.scan_name || "Untitled Scan"}
                          </p>

                          <p className="mt-0.5 break-all font-mono text-[10px] text-zinc-600">
                            {finding.scan_id.slice(0, 8)}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="break-all font-mono text-xs text-zinc-300">
                            {finding.cert_id && finding.cert_id !== "None"
                              ? `Cert ${finding.cert_id}`
                              : finding.target_id
                                ? `Target ${finding.target_id}`
                                : "Scan-level"}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <StatusBadge status={finding.status} />
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-zinc-600">
                        <Link href={href}>
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