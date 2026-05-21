"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ClockAlert } from "lucide-react";
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

function getStatusClass(label: string) {
  if (label === "Expired") {
    return "border-red-500/40 bg-red-500/10 text-red-400";
  }

  return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
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

export default function ExpiryReviewClient({
  findings,
}: {
  findings: ExpiringFinding[];
}) {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("expired");

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
              Certificate Expiry Review
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Review expired certificates and validity-related warnings from
              recent scan results.
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Expired Certificates
          </p>
          <p className="mt-4 text-3xl font-semibold text-red-400">
            {expiredCertificates.length}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Already expired or failed expiry checks
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Expiring Soon
          </p>
          <p className="mt-4 text-3xl font-semibold text-yellow-400">
            {expiringSoonCertificates.length}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Validity warnings requiring review
          </p>
        </div>

      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-300">
              {selectedFilter === "expired"
                ? "Expired Certificates"
                : "Expiring Soon"}
            </h2>
            <p className="mt-2 text-xs text-zinc-500">
              Click a row to open the related scan result.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedFilter("expired")}
              className={`rounded-lg border px-4 py-2 text-sm ${getFilterClass(
                selectedFilter === "expired"
              )}`}
            >
              Expired
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter("expiring-soon")}
              className={`rounded-lg border px-4 py-2 text-sm ${getFilterClass(
                selectedFilter === "expiring-soon"
              )}`}
            >
              Expiring Soon
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1.5fr_1fr_1fr_130px] border-b border-zinc-800 bg-zinc-900/40 px-6 py-4 text-xs uppercase tracking-[0.25em] text-zinc-500">
          <p>Rule</p>
          <p>Scan</p>
          <p>Certificate / Target</p>
          <p>Status</p>
        </div>

        <div className="divide-y divide-zinc-900">
          {filteredFindings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">
                {selectedFilter === "expired"
                  ? "No expired certificate findings found."
                  : "No expiring-soon findings found."}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Findings will appear here after scan results are processed.
              </p>
            </div>
          ) : (
            filteredFindings.map((cert) => {
              const statusLabel = getStatusLabel(cert);
              const href = getFindingHref(cert);

              return (
                <Link
                  key={`${cert.scan_id}-${cert.target_id}-${cert.cert_id}-${cert.name}`}
                  href={href}
                  className="grid grid-cols-[1.5fr_1fr_1fr_130px] gap-6 px-6 py-5 transition hover:bg-zinc-900/60"
                >
                  <div>
                    <p className="font-medium text-cyan-400">
                      {formatRuleName(cert.name)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">{cert.name}</p>
                    <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                      {cert.description || "No description available."}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-300">
                      {cert.scan_name || "Unnamed Scan"}
                    </p>
                    <p className="mt-1 break-all text-xs text-zinc-600">
                      {cert.scan_id}
                    </p>
                  </div>

                  <div>
                    <p className="break-all text-sm text-zinc-300">
                      {cert.cert_id && cert.cert_id !== "None"
                        ? cert.cert_id
                        : "No certificate ID"}
                    </p>
                    <p className="mt-1 break-all text-xs text-zinc-600">
                      Target: {cert.target_id || "N/A"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Source: {cert.source || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`rounded-md border px-3 py-1 text-xs ${getStatusClass(
                        statusLabel
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}