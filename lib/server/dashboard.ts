"use server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_SCAN_URL ||
  "http://localhost:8000";

async function fetchDashboardEndpoint<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to fetch ${path}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`Dashboard fetch failed for ${path}:`, error);
    return fallback;
  }
}

export type DashboardSummary = {
  certificates_checked: number;
  compliance_pass_rate: number;
  passed_checks: number;
  warning_checks: number;
  total_checks: number;
  critical_fatal_findings: number;
  expiring_soon: number;
};

export type RecentScan = {
  id: string;
  name: string;
  status: string;
  targets: number;
  issues: number;
  date: string;
  time: string;
};

export type DashboardAlert = {
  id: string;
  type: string;
  message: string;
  time_ago: string;
};

export type CriticalFinding = {
  id: string;
  scan_id: string;
  scan_name: string;
  target_id: string | null;
  cert_id: string | null;
  status: string;
  name: string;
  description: string;
  citation: string | null;
  source: string | null;
};

export type ExpiringFinding = {
  id?: string;
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

export type CompliancePassFinding = {
  id?: string;
  scan_id: string;
  scan_name: string;
  target_id: string | null;
  cert_id: string | null;
  name: string;
  status: "PASS" | "WARN";
  description: string;
  citation: string | null;
  source: string | null;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchDashboardEndpoint<DashboardSummary>("/api/dashboard/summary", {
    certificates_checked: 0,
    compliance_pass_rate: 0,
    passed_checks: 0,
    warning_checks: 0,
    total_checks: 0,
    critical_fatal_findings: 0,
    expiring_soon: 0,
  });
}

export async function getRecentScans(): Promise<RecentScan[]> {
  return fetchDashboardEndpoint<RecentScan[]>("/api/dashboard/recent-scans", []);
}

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  return fetchDashboardEndpoint<DashboardAlert[]>("/api/dashboard/alerts", []);
}

export async function getCriticalFindings(): Promise<CriticalFinding[]> {
  return fetchDashboardEndpoint<CriticalFinding[]>(
    "/api/dashboard/critical-findings",
    []
  );
}

export async function getExpiringSoon(): Promise<ExpiringFinding[]> {
  return fetchDashboardEndpoint<ExpiringFinding[]>(
    "/api/dashboard/expiring-soon",
    []
  );
}

export async function getCompliancePassFindings(): Promise<
  CompliancePassFinding[]
> {
  return fetchDashboardEndpoint<CompliancePassFinding[]>(
    "/api/dashboard/compliance-pass-rate",
    []
  );
}