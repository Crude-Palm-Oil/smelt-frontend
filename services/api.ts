"use server"

import type {
  FinishedScan,
  Lint,
  LintFinding,
  LintResults,
  LintSeverity,
  LintStatus,
} from "@/lib/mock-results-data";

const ANALYSIS_API = process.env.NEXT_PUBLIC_ANALYSIS_API_URL ?? "http://localhost:8080";
const REPORT_API = process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001";
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

type RawLintRow = {
  id: string;
  scan_id: string;
  target_id: string | null;
  cert_id: string;
  target_name: string | null;
  cert_subject: string | null;
  cert_issuer: string | null;
  scanned_at: string;
  status: string;
  // The Go analysis service stores this as a JSONB array on Supabase but as
  // a serialised JSON string in the local dump (and sometimes empty). The
  // adapter below coerces all observed shapes into a flat finding list.
  results: unknown;
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

function adaptLint(row: RawLintRow): Lint {
  return {
    id: row.id,
    scanId: row.scan_id,
    targetId: row.target_id,
    certId: row.cert_id,
    targetName: row.target_name ?? "(no target)",
    certSubject: row.cert_subject ?? "(no subject)",
    certIssuer: row.cert_issuer ?? "(no issuer)",
    scannedAt: row.scanned_at,
    status: toLintStatus(row.status),
    lintResults: toLintResults(row.results),
  };
}

export async function getFinishedScans(): Promise<FinishedScan[]> {
  const res = await fetch(`${BASE_URL}/results/scans`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch finished scans (${res.status})`);
  return res.json();
}

export async function getLintsForScan(scanId: string): Promise<Lint[]> {
  const res = await fetch(`${ANALYSIS_API}/scan/${scanId}`, {
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to fetch lints (${res.status})`);
  const rows: RawLintRow[] = (await res.json()).results;
  return rows.map(adaptLint);
}

// --- Scan kickoff (placeholder) ----------------------------------------

export async function scanDomain(target: string, port?: number) {
  throw new Error("Not implemented — use mock data");
}

export async function getReports() {
  const res = await fetch(`${REPORT_API}/reports`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch reports")
  return res.json()
}

export async function generateReport(scanId: string): Promise<void> {
  await fetch(`${REPORT_API}/api/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: scanId }),
  })
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
  const res = await fetch(`${REPORT_API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
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
