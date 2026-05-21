"use server"

import type {
  CertificateSummary,
  FinishedScan,
  HistoryItem,
  Lint,
  LintFinding,
  LintResults,
  LintSeverity,
  LintStatus,
  TargetSummary,
} from "@/lib/mock-results-data";
import Cookies from "js-cookie";

const ANALYSIS_API = process.env.NEXT_PUBLIC_ANALYSIS_API_URL ?? "http://localhost:8080";
// Strip a trailing `/api` so callers can always write `${REPORT_API}/api/reports/...`
// regardless of whether the env var was set with or without the prefix.
const REPORT_API = (process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001").replace(/\/api\/?$/, "");
const CONFIG_API = process.env.NEXT_PUBLIC_CONFIG_API_URL ?? "http://localhost:8002";
const BASE_URL = process.env.NEXT_PUBLIC_API_SCAN_URL ?? "http://localhost:8000";

// --- Results feature ----------------------------------------------------

type RawFinding = {
  name?: string;
  source?: string;
  status?: string;
  citation?: string;
  description?: string;
};

// Shape returned by the Go analysis service (`GET /scan/:id`). Keys come
// straight from `cmd/api/dto.LintResult` and are snake_case.
type RawLintRow = {
  id: string;
  target_id: string | null;
  cert_id: string | null;
  target_name: string | null;
  cert_subject: string | null;
  cert_issuer: string | null;
  status: string;
  // The Go analysis service stores this as a JSONB array on Supabase but as
  // a serialised JSON string in the local dump (and sometimes empty). The
  // adapter below coerces all observed shapes into a flat finding list.
  results: unknown;
};

// The outer envelope returned by the Go analysis service. We pull
// scan-level metadata from here since the per-lint rows don't carry it.
type RawScanResult = {
  id: string;
  name?: string;
  scanned_at?: string;
  created_at?: string;
  status?: string;
  results?: RawLintRow[];
};

const SEVERITY_BUCKETS: Record<string, LintSeverity> = {
  pass: "pass",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "fatal",
  na: "na",
  ne: "na",
};

const LINT_STATUSES: LintStatus[] = ["pass", "info", "warn", "fail", "fatal"];

function toSeverity(raw: string | undefined): LintSeverity {
  return SEVERITY_BUCKETS[(raw ?? "").toLowerCase()] ?? "na";
}

function toLintStatus(raw: string): LintStatus {
  const lower = raw.toLowerCase();
  if (lower === "error") return "fail";
  return LINT_STATUSES.includes(lower as LintStatus) ? (lower as LintStatus) : "pass";
}

function coerceFindings(raw: unknown): RawFinding[] {
  if (Array.isArray(raw)) return raw as RawFinding[];

  if (typeof raw === "string") {
    if (raw.length === 0) return [];
    try {
      return coerceFindings(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  if (raw && typeof raw === "object") {
    const wrapped = (raw as { findings?: unknown }).findings;
    if (Array.isArray(wrapped)) return wrapped as RawFinding[];
  }

  return [];
}

function toLintResults(raw: unknown): LintResults {
  const summary = { pass: 0, info: 0, warn: 0, error: 0, fatal: 0, na: 0 };
  const findings: LintFinding[] = coerceFindings(raw).map((entry) => {
    const severity = toSeverity(entry.status);
    summary[severity] += 1;
    const detailsParts = [entry.source, entry.citation].filter(Boolean);
    return {
      rule: entry.name ?? "(unnamed)",
      severity,
      description: entry.description ?? "",
      details: detailsParts.length > 0 ? detailsParts.join(" · ") : undefined,
    };
  });
  return { summary, findings };
}

function adaptLint(row: RawLintRow, scanId: string, scannedAt: string): Lint {
  return {
    id: row.id,
    scanId,
    targetId: row.target_id,
    certId: row.cert_id ?? "",
    targetName: row.target_name ?? "(no target)",
    certSubject: row.cert_subject ? `CN=${row.cert_subject}` : "(no subject)",
    certIssuer: row.cert_issuer ?? "(no issuer)",
    scannedAt,
    status: toLintStatus(row.status),
    lintResults: toLintResults(row.results),
  };
}

export async function getFinishedScans(): Promise<FinishedScan[]> {
  const res = await fetch(`${BASE_URL}/results/scans`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch finished scans (${res.status})`);
  return res.json();
}

// --- Per-target history --------------------------------------------------

// The backend's `latestStatus` field can be "pass" | "info" | "warn" | "error"
// | "fatal" | "NA" | "NE". `toLintStatus` maps "error" → "fail" and falls
// back to "pass" for unknowns; that's fine for the table badge but loses
// the "never evaluated" signal. Targets returned by /results/targets always
// have at least one lint so "na" can never appear in practice.
function normaliseHistoryStatus(raw: string): LintStatus {
  return toLintStatus(raw);
}

export async function getTargets(): Promise<TargetSummary[]> {
  const res = await fetch(`${BASE_URL}/results/targets`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch targets (${res.status})`);
  const rows = (await res.json()) as TargetSummary[];
  return rows.map((row) => ({
    ...row,
    latestStatus: normaliseHistoryStatus(row.latestStatus as string),
  }));
}

export async function getTargetHistory(params: {
  hostname?: string | null;
  ipAddress?: string | null;
  port: number;
}): Promise<HistoryItem[]> {
  const qs = new URLSearchParams({ port: String(params.port) });
  if (params.hostname) qs.set("hostname", params.hostname);
  if (params.ipAddress) qs.set("ipAddress", params.ipAddress);

  const res = await fetch(`${BASE_URL}/results/targets/history?${qs.toString()}`, {
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch target history (${res.status})`);
  const rows = (await res.json()) as HistoryItem[];
  return rows.map((row) => ({
    ...row,
    status: normaliseHistoryStatus(row.status as string),
  }));
}

// --- Per-certificate history --------------------------------------------

export async function getCertificates(): Promise<CertificateSummary[]> {
  const res = await fetch(`${BASE_URL}/results/certificates`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch certificates (${res.status})`);
  const rows = (await res.json()) as CertificateSummary[];
  return rows.map((row) => ({
    ...row,
    latestStatus: normaliseHistoryStatus(row.latestStatus as string),
  }));
}

export async function getCertificateHistory(
  commonName: string,
): Promise<HistoryItem[]> {
  // Identity is Subject CN (encoded for URL safety — wildcard CNs contain "*",
  // some CNs contain ":" or "/" which must be percent-encoded).
  const res = await fetch(
    `${BASE_URL}/results/certificates/${encodeURIComponent(commonName)}/history`,
    { cache: "no-store" },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch certificate history (${res.status})`);
  const rows = (await res.json()) as HistoryItem[];
  return rows.map((row) => ({
    ...row,
    status: normaliseHistoryStatus(row.status as string),
  }));
}

export async function getLintsForScan(scanId: string): Promise<Lint[]> {
  // Two data sources, ordered by richness:
  //  1) Go analysis service `/scan/{id}` — full ScanResult with per-rule
  //     findings (loaded from S3). This is the preferred path because the
  //     detail page's expanded view needs the findings list.
  //  2) Backend `/results/scans/{scanId}/lints` — Postgres-only metadata
  //     (target name, cert subject/issuer, status). No findings, but the
  //     per-cert rows still render so the user sees who/what was scanned
  //     and the worst-status per row.
  //
  // Go currently swallows S3-read errors and returns 200 + empty body
  // when the bucket file is missing. We fall through to (2) on any of:
  // empty body, non-array results, network error, non-OK status.
  try {
    const res = await fetch(`${ANALYSIS_API}/scan/${scanId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const text = await res.text();
      if (text.trim()) {
        try {
          const payload: RawScanResult = JSON.parse(text);
          const rows = payload.results;
          if (Array.isArray(rows) && rows.length > 0) {
            const scannedAt = payload.scanned_at ?? new Date().toISOString();
            return rows.map((row) => adaptLint(row, scanId, scannedAt));
          }
        } catch {
          // Malformed JSON — fall through to backend fallback.
        }
      }
    }
  } catch (err) {
    console.warn(`getLintsForScan ${scanId} analysis fetch failed:`, err);
  }

  // Fallback: backend lint-metadata endpoint. Returns DB rows only; the
  // `lintResults` JSONB column is unused by the Go scanner (findings live
  // in S3), so we render with an empty findings list.
  try {
    const res = await fetch(`${BASE_URL}/results/scans/${scanId}/lints`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`getLintsForScan ${scanId} backend fallback failed (${res.status})`);
      return [];
    }
    const rows: BackendLintRow[] = await res.json();
    return rows.map(adaptBackendLint);
  } catch (err) {
    console.warn(`getLintsForScan ${scanId} backend fallback error:`, err);
    return [];
  }
}

type BackendLintRow = {
  id: string;
  scanId: string;
  targetId: string | null;
  certId: string | null;
  targetName: string | null;
  certSubject: string | null;
  certIssuer: string | null;
  scannedAt: string;
  status: string;
  lintResults: unknown;
};

const EMPTY_LINT_RESULTS: LintResults = {
  summary: { pass: 0, info: 0, warn: 0, error: 0, fatal: 0, na: 0 },
  findings: [],
};

function adaptBackendLint(row: BackendLintRow): Lint {
  // Backend already prefixes the subject with "CN=" in services._to_lint_row,
  // so don't re-prefix here. `lintResults` is populated by the backend
  // from per-lint S3 blobs; it'll be a findings array when retrievable,
  // or null/empty when the blob is missing.
  return {
    id: row.id,
    scanId: row.scanId,
    targetId: row.targetId,
    certId: row.certId ?? "",
    targetName: row.targetName ?? "(no target)",
    certSubject: row.certSubject ?? "(no subject)",
    certIssuer: row.certIssuer ?? "(no issuer)",
    scannedAt: row.scannedAt,
    status: toLintStatus(row.status),
    lintResults: row.lintResults ? toLintResults(row.lintResults) : EMPTY_LINT_RESULTS,
  };
}

// --- Scan kickoff (placeholder) ----------------------------------------

export async function scanDomain(target: string, port?: number) {
  throw new Error("Not implemented — use mock data");
}

/** Fetches all scans with their report generation status from the reports service.
 *  Called server-side in ScanResultPage to pre-populate ReportBox initial state.
 *  Defensive on every failure path so the scan-detail page renders even when
 *  the reports container is missing/broken. */
export async function getReports() {
  try {
    const res = await fetch(`${REPORT_API}/api/reports`, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`getReports failed (${res.status})`);
      return [];
    }
    const text = await res.text();
    if (!text.trim()) return [];
    return JSON.parse(text);
  } catch (err) {
    console.warn(`getReports error:`, err);
    return [];
  }
}

export async function getPolicyProfiles() {
  throw new Error("Not implemented — use mock data");
}

// --- Monitoring feature -------------------------------------------------
//
// Backend returns ScanSummary[] from /monitoring/{ongoing,alerts,scans};
// the frontend's monitoring components consume scan-centric types
// (OngoingScan / FailedScan / ScanRecord). The adapters below close that gap.

import type {
  OngoingScan,
  FailedScan,
  ScanRecord,
  ScanStatus as MonitoringScanStatus,
} from "@/lib/mock-monitoring-data";

type RawScanSummary = {
  id: string;
  name: string;
  status: string;
  target_count: number;
  processed_count: number;
  scanned_at: string;
  created_at: string;
};

const FAIL_STATUSES = new Set(["error", "fatal"]);

function toMonitoringStatus(raw: string): MonitoringScanStatus {
  return FAIL_STATUSES.has(raw.toLowerCase()) ? "fail" : "pass";
}

async function fetchScanSummaries(path: string): Promise<RawScanSummary[]> {
  // Monitoring endpoints live on smelt-backend (port 8000), not smelt-reports.
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    console.warn(`fetchScanSummaries ${path} failed (${res.status})`);
    return [];
  }
  return res.json();
}

export async function getOngoingScans(): Promise<OngoingScan[]> {
  const rows = await fetchScanSummaries("/monitoring/ongoing");
  const now = Date.now();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    startedAtOffsetSec: Math.max(
      0,
      Math.floor((now - new Date(row.scanned_at).getTime()) / 1000),
    ),
    config: "Default",
  }));
}

export async function getFailedScans(): Promise<FailedScan[]> {
  const rows = await fetchScanSummaries("/monitoring/alerts");
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    scannedAt: row.scanned_at,
    issues: `${row.target_count} target${row.target_count === 1 ? "" : "s"} flagged · status ${row.status.toUpperCase()}`,
    config: "Default",
  }));
}

export async function getMonitoringHistory(): Promise<ScanRecord[]> {
  const rows = await fetchScanSummaries("/monitoring/scans");
  return rows
    .filter((row) => !["running", "paused", "stopped"].includes(row.status))
    .map((row) => ({
      id: row.id,
      name: row.name,
      scannedAt: row.scanned_at,
      status: toMonitoringStatus(row.status),
      config: "Default",
    }));
}

export async function getMonitoredDomains() {
  throw new Error("Not implemented — use mock data");
}

export async function login(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  return res.json();
}

export async function getMe() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Not authenticated");

  return res.json();
}

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = Cookies.get("token");

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
