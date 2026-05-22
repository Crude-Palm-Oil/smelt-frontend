"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  ClockAlert,
  XCircle,
  ChevronRight,
} from "lucide-react";
import type { ExpiringFinding } from "@/lib/server/dashboard";

type FilterType = "expired" | "expiring-soon";

function normalizeStatus(status: string) {
  return String(status || "").toLowerCase().trim();
}

function isExpiredCertificate(cert: ExpiringFinding) {
  const status = normalizeStatus(cert.status);
  const name = String(cert.name || "").toLowerCase();
  const description = String(cert.description || "").toLowerCase();

  return (
    status === "fail" ||
    status === "failed" ||
    status === "fatal" ||
    status === "error" ||
    name === "smelt_certificate_expired" ||
    name.includes("certificate_expired") ||
    description.includes("certificate expired")
  );
}

function getStatusLabel(cert: ExpiringFinding) {
  if (isExpiredCertificate(cert)) {
    return "Expired";
  }

  return "Expiring Soon";
}

function StatusBadge({ cert }: { cert: ExpiringFinding }) {
  const label = getStatusLabel(cert);

  if (label === "Expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 font-mono text-xs font-medium text-red-400">
        <XCircle size={11} />
        EXPIRED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-medium text-amber-400">
      <AlertTriangle size={11} />
      EXPIRING SOON
    </span>
  );
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

function getFindingHref(cert: ExpiringFinding) {
  if (cert.detail_url) {
    return cert.detail_url;
  }

  const params = new URLSearchParams();

  if (cert.target_id) {
    params.set("targetId", cert.target_id);
  }

  if (cert.cert_id && cert.cert_id !== "None") {
    params.set("certId", cert.cert_id);
  }

  const query = params.toString();

  if (!query) {
    return `/main/results/${cert.scan_id}`;
  }

  return `/main/results/${cert.scan_id}?${query}`;
}

function ExpiryStatCard({
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

export default function ExpiryReviewClient({
  findings,
  initialTab,
}: {
  findings: ExpiringFinding[];
  initialTab: FilterType;
}) {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>(initialTab);

  const expiredCertificates = useMemo(
    () => findings.filter(isExpiredCertificate),
    [findings]
  );

  const expiringSoonCertificates = useMemo(
    () => findings.filter((cert) => !isExpiredCertificate(cert)),
    [findings]
  );

  const filteredFindings =
    selectedFilter === "expired"
      ? expiredCertificates
      : expiringSoonCertificates;

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

        <span className="text-zinc-300">Certificate Expiry Review</span>
      </nav>

      <header className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
            <ClockAlert size={18} />
          </div>

          <div>
            <h1 className="font-mono text-2xl font-semibold text-zinc-100">
              Certificate Expiry Review
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Review expired certificates and expiry warnings from recent scan
              results.
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <ExpiryStatCard
          label="Expired Certificates"
          value={expiredCertificates.length}
          icon={<XCircle size={16} />}
          color="text-red-400"
          bg="bg-red-500/10"
          active={selectedFilter === "expired"}
          onClick={() => setSelectedFilter("expired")}
        />

        <ExpiryStatCard
          label="Expiring Soon"
          value={expiringSoonCertificates.length}
          icon={<AlertTriangle size={16} />}
          color="text-amber-400"
          bg="bg-amber-500/10"
          active={selectedFilter === "expiring-soon"}
          onClick={() => setSelectedFilter("expiring-soon")}
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-zinc-100">
              {selectedFilter === "expired"
                ? "Expired Certificates"
                : "Expiring Soon"}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {filteredFindings.length} finding
              {filteredFindings.length !== 1 ? "s" : ""} · click to inspect
              scan result
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
                    {selectedFilter === "expired"
                      ? "No expired certificate findings found"
                      : "No expiring-soon findings found"}
                  </td>
                </tr>
              ) : (
                filteredFindings.map((cert) => {
                  const href = getFindingHref(cert);

                  return (
                    <tr
                      key={`${cert.scan_id}-${cert.target_id}-${cert.cert_id}-${cert.name}`}
                      className="border-b border-zinc-800/60 transition last:border-b-0 hover:bg-zinc-900/40"
                    >
                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="font-mono text-sm text-zinc-200">
                            {formatRuleName(cert.name)}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                            {cert.name}
                          </p>
                          <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                            {cert.description || "No description available."}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="font-mono text-sm text-zinc-300">
                            {cert.scan_name || "Unnamed Scan"}
                          </p>
                          <p className="mt-0.5 break-all font-mono text-[10px] text-zinc-600">
                            {cert.scan_id.slice(0, 8)}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <p className="break-all font-mono text-xs text-zinc-300">
                            {cert.cert_id && cert.cert_id !== "None"
                              ? cert.cert_id
                              : "No certificate ID"}
                          </p>
                          <p className="mt-1 break-all font-mono text-[10px] text-zinc-600">
                            Target: {cert.target_id || "N/A"}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-zinc-600">
                            Source: {cert.source || "N/A"}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link href={href} className="block">
                          <StatusBadge cert={cert} />
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