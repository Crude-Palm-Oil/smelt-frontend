export type ComplianceStatus = "pass" | "fail" | "warn";
export type BadgeType = "pass" | "fail" | "warn" | "info" | "neutral";

export interface Certificate {
  cn: string;
  issuer: string;
  serial: string;
  notBefore: string;
  notAfter: string;
  keyAlg: string;
  sigAlg: string;
  status: ComplianceStatus;
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  name: string;
  rule: string;
  status: ComplianceStatus;
  detail: string;
}

export interface ScanResult {
  domain: string;
  status: ComplianceStatus;
  certs: number;
  date: string;
  issues: number;
}

export interface Alert {
  msg: string;
  time: string;
  type: ComplianceStatus;
  domain?: string;
  ack?: boolean;
}

export interface Report {
  id: string;
  domain: string;
  date: string;
  certs: number;
  status: ComplianceStatus;
  format: string;
  pdf_status: "Ready" | "Generating" | "Pending"
}

export interface PolicyProfile {
  id: string;
  name: string;
  desc: string;
  rules: number;
  active: boolean;
}

export interface PolicyRule {
  id: string;
  name: string;
  category: string;
  defaultVal: string;
  override: string;
  severity: ComplianceStatus;
}

export interface MonitoredDomain {
  domain: string;
  interval: string;
  lastCheck: string;
  nextCheck: string;
  status: "healthy" | "warn" | "alert";
  alerts: number;
}
