export type LintSeverity = "pass" | "info" | "warn" | "error" | "fatal" | "na";
export type LintStatus = "pass" | "info" | "warn" | "fail" | "fatal";

export type LintFinding = {
  rule: string;
  severity: LintSeverity;
  description: string;
  details?: string;
};

export type LintResults = {
  summary: {
    pass: number;
    info: number;
    warn: number;
    error: number;
    fatal: number;
    na: number;
  };
  findings: LintFinding[];
};

export type Lint = {
  id: string;
  scanId: string;
  targetId: string | null;
  certId: string;
  targetName: string;
  certSubject: string;
  certIssuer: string;
  scannedAt: string;
  status: LintStatus;
  lintResults: LintResults;
};

export type FinishedScan = {
  id: string;
  name: string;
  scannedAt: string;
  targetCount: number;
  status: "completed" | "failed";
  // When non-null, this scan run was triggered by a recurring schedule
  // and the Results row should show a "Recurring" badge + jump-to-schedule link.
  // Optional on the type so legacy mock fixtures (which predate the column)
  // still type-check — the live API always emits `recurringId: null | "<uuid>"`.
  recurringId?: string | null;
  lintsPass: number;
  lintsInfo: number;
  lintsWarn: number;
  lintsFail: number;
  lintsFatal: number;
};

// --- Recurring scans ----------------------------------------------------

export type RecurringScanType = "target" | "file";

export type RecurringTarget = {
  hostname: string | null;
  ipAddress: string | null;
  port: number;
};

// Listing-view shape (one row per schedule). Backend joins past run
// counts from the scans table.
export type RecurringScanRow = {
  id: string;
  name: string;
  cron: string;
  lastRunAt: string | null;
  runCount: number;
};

// One past execution of a recurring schedule, shown in the detail
// timeline.
export type RecurringRunHistoryItem = {
  scanId: string;
  name: string;
  scannedAt: string;
  status: string;
  targetCount: number;
};

// Detail-view shape. `type`/`targets`/`certificateIds` come from the
// S3 payload — they're null when the payload is missing or unreadable
// (the row still renders with name + cron in that case).
export type RecurringScanDetail = {
  id: string;
  name: string;
  cron: string;
  type: RecurringScanType | null;
  targets: RecurringTarget[] | null;
  certificateIds: string[] | null;
  lastRunAt: string | null;
  runCount: number;
  history: RecurringRunHistoryItem[];
};

export type RecurringScanUpdate = {
  name?: string;
  cron?: string;
  targets?: RecurringTarget[];
};

// Per-target history view. Identity is (hostname, ipAddress, port) — multiple
// `targets` rows that share this tuple are merged at the API layer.
export type TargetSummary = {
  hostname: string | null;
  ipAddress: string | null;
  port: number;
  commonName: string | null;
  issuerCn: string | null;
  firstScannedAt: string | null;
  lastScannedAt: string | null;
  scanCount: number;
  latestStatus: LintStatus | "na";
  lintsPass: number;
  lintsInfo: number;
  lintsWarn: number;
  lintsFail: number;
  lintsFatal: number;
};

// Per-certificate history view. Identity is the Subject CN — multiple cert
// binaries (fingerprints) with the same CN aggregate into one row. `certCount`
// reports how many distinct certs share this CN; `notAfter` is the latest
// expiry across that set (so renewed certs read as still-valid).
export type CertificateSummary = {
  commonName: string;
  issuerCn: string | null;
  notAfter: string | null;
  certCount: number;
  firstScannedAt: string | null;
  lastScannedAt: string | null;
  scanCount: number;
  latestStatus: LintStatus | "na";
  lintsPass: number;
  lintsInfo: number;
  lintsWarn: number;
  lintsFail: number;
  lintsFatal: number;
};

// One row on a target or certificate history timeline.
export type HistoryItem = {
  lintId: string;
  scanId: string;
  scanName: string;
  scannedAt: string;
  status: LintStatus | "na";
  commonName: string | null;
  issuerCn: string | null;
};

const makeFinding = (
  rule: string,
  severity: LintSeverity,
  description: string,
  details?: string,
): LintFinding => ({ rule, severity, description, details });

const healthyLint: LintResults = {
  summary: { pass: 142, info: 2, warn: 0, error: 0, fatal: 0, na: 58 },
  findings: [
    makeFinding("e_basic_constraints_not_critical", "pass", "Basic Constraints extension marked critical"),
    makeFinding("e_rsa_mod_less_than_2048_bits", "pass", "RSA modulus is 2048 bits or greater"),
    makeFinding("e_subject_common_name_included", "pass", "Subject CN is included as in SAN"),
    makeFinding("w_ct_sct_policy_count_unsatisfied", "pass", "CT SCT policy count satisfied"),
    makeFinding(
      "n_subject_common_name_included",
      "info",
      "Subject CN present (deprecation notice)",
      "CA/Browser Forum SC-62 marks subject:commonName for TLS as deprecated; not an issue but worth tracking",
    ),
    makeFinding(
      "n_mp_modulus_is_divisible_by_small_prime",
      "info",
      "Modulus not divisible by small primes (good)",
    ),
    makeFinding("e_ev_serial_number_missing", "na", "Not an EV certificate"),
  ],
};

const infoLint: LintResults = {
  summary: { pass: 140, info: 4, warn: 0, error: 0, fatal: 0, na: 58 },
  findings: [
    makeFinding("e_basic_constraints_not_critical", "pass", "Basic Constraints extension marked critical"),
    makeFinding(
      "n_ca_digital_signature_not_set",
      "info",
      "CA certificate lacks digitalSignature key usage",
      "Not required, but some legacy validators expect this bit on CA certs",
    ),
    makeFinding(
      "n_subject_common_name_included",
      "info",
      "Subject CN present (deprecation notice)",
    ),
    makeFinding(
      "n_contains_redacted_dnsname",
      "info",
      "Contains a redacted DNS name (?.example.com)",
      "Used for private CT logging, informational only",
    ),
    makeFinding(
      "n_ct_sct_policy_exact_count",
      "info",
      "Contains exactly 2 SCTs (minimum for validity ≤ 180d)",
    ),
  ],
};

const warnLint: LintResults = {
  summary: { pass: 138, info: 3, warn: 3, error: 0, fatal: 0, na: 59 },
  findings: [
    makeFinding("e_basic_constraints_not_critical", "pass", "Basic Constraints extension marked critical"),
    makeFinding(
      "w_ct_sct_policy_count_unsatisfied",
      "warn",
      "Certificate has fewer than the recommended 3 SCTs",
      "Only 2 SCTs embedded, CA/B Forum recommends 3+ for certificates with validity > 180 days",
    ),
    makeFinding(
      "w_subject_common_name_included",
      "warn",
      "Subject CN included but deprecated",
      "CA/Browser Forum SC-62 deprecates subject:commonName for TLS server certs",
    ),
    makeFinding(
      "w_root_ca_contains_cert_policy",
      "warn",
      "Root CA contains certificate policies extension",
      "RFC 5280: Root CAs should not include certificatePolicies",
    ),
    makeFinding(
      "n_multiple_subject_rdn",
      "info",
      "Subject contains multiple RDNs",
    ),
  ],
};

const failLint: LintResults = {
  summary: { pass: 128, info: 2, warn: 2, error: 4, fatal: 0, na: 58 },
  findings: [
    makeFinding(
      "e_rsa_mod_less_than_2048_bits",
      "error",
      "RSA modulus is less than 2048 bits",
      "Found 1024-bit RSA modulus, violates CAB Forum BR 6.1.5",
    ),
    makeFinding(
      "e_sub_cert_not_is_ca",
      "error",
      "Subscriber certificate has CA:TRUE",
      "Leaf certificate incorrectly marked as CA, violates RFC 5280",
    ),
    makeFinding(
      "e_sub_cert_valid_time_longer_than_397_days",
      "error",
      "Certificate validity exceeds 397 days",
      "Valid for 730 days, max allowed is 397 per CAB Forum BR 6.3.2",
    ),
    makeFinding(
      "e_signature_algorithm_not_supported",
      "error",
      "Signature uses deprecated SHA-1 algorithm",
      "SHA-1 signatures are no longer trusted by major browsers",
    ),
    makeFinding(
      "w_ct_sct_policy_count_unsatisfied",
      "warn",
      "Insufficient SCT count",
    ),
    makeFinding("e_basic_constraints_not_critical", "pass", "Basic Constraints extension marked critical"),
    makeFinding(
      "n_contains_copy_of_other_extension",
      "info",
      "Certificate contains duplicate extension",
    ),
  ],
};

const fatalLint: LintResults = {
  summary: { pass: 96, info: 1, warn: 3, error: 2, fatal: 3, na: 55 },
  findings: [
    makeFinding(
      "f_cert_unable_to_parse",
      "fatal",
      "Certificate failed to parse cleanly",
      "DER decoding stopped at offset 0x142 — malformed AlgorithmIdentifier in TBSCertificate",
    ),
    makeFinding(
      "f_subject_empty",
      "fatal",
      "Subject DN is empty",
      "Neither SAN nor Subject contain any identifier — certificate is unusable",
    ),
    makeFinding(
      "f_signature_invalid",
      "fatal",
      "Signature verification failed against issuer public key",
      "Likely corrupted chain or replaced issuer cert",
    ),
    makeFinding(
      "e_rsa_mod_less_than_2048_bits",
      "error",
      "RSA modulus is less than 2048 bits",
      "512-bit modulus detected, grossly violates CAB Forum BR 6.1.5",
    ),
    makeFinding(
      "e_signature_algorithm_not_supported",
      "error",
      "Signature uses MD5",
    ),
    makeFinding("w_ct_sct_policy_count_unsatisfied", "warn", "No SCTs embedded"),
    makeFinding(
      "w_tls_server_cert_valid_time_too_long",
      "warn",
      "Validity longer than allowed",
    ),
    makeFinding(
      "w_root_ca_contains_cert_policy",
      "warn",
      "Root CA contains certificate policies extension",
    ),
    makeFinding(
      "n_ct_sct_policy_exact_count",
      "info",
      "No SCTs is informational in this test ring",
    ),
  ],
};

export const finishedScans: FinishedScan[] = [
  {
    id: "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b",
    name: "Production Edge Fleet",
    scannedAt: "2026-04-19T09:34:12Z",
    targetCount: 24,
    status: "completed",
    lintsPass: 21,
    lintsInfo: 1,
    lintsWarn: 2,
    lintsFail: 0,
    lintsFatal: 0,
  },
  {
    id: "b6e23fab-2d44-4a18-bc82-9d0a3e4f5c1d",
    name: "API Gateway Certificates",
    scannedAt: "2026-04-18T14:22:05Z",
    targetCount: 8,
    status: "completed",
    lintsPass: 8,
    lintsInfo: 0,
    lintsWarn: 0,
    lintsFail: 0,
    lintsFatal: 0,
  },
  {
    id: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
    name: "Legacy Services Audit",
    scannedAt: "2026-04-18T08:11:42Z",
    targetCount: 15,
    status: "failed",
    lintsPass: 9,
    lintsInfo: 1,
    lintsWarn: 1,
    lintsFail: 4,
    lintsFatal: 0,
  },
  {
    id: "d4a56bc3-f192-4e8d-b7a2-3c9e1f4d2b6a",
    name: "Internal Kubernetes Ingress",
    scannedAt: "2026-04-17T16:45:30Z",
    targetCount: 42,
    status: "completed",
    lintsPass: 38,
    lintsInfo: 2,
    lintsWarn: 2,
    lintsFail: 0,
    lintsFatal: 0,
  },
  {
    id: "e8b34c71-6a29-4d5f-8e1c-2b7a9f3e4d5c",
    name: "Customer Subdomain Scan",
    scannedAt: "2026-04-17T11:20:18Z",
    targetCount: 124,
    status: "completed",
    lintsPass: 116,
    lintsInfo: 4,
    lintsWarn: 3,
    lintsFail: 1,
    lintsFatal: 0,
  },
  {
    id: "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c",
    name: "Third-party Vendor Certs",
    scannedAt: "2026-04-16T13:08:55Z",
    targetCount: 6,
    status: "failed",
    lintsPass: 2,
    lintsInfo: 0,
    lintsWarn: 1,
    lintsFail: 2,
    lintsFatal: 1,
  },
  {
    id: "a9e45b23-c687-4f12-b3d5-6a2e8f1c9d4b",
    name: "Staging Environment",
    scannedAt: "2026-04-15T10:02:41Z",
    targetCount: 18,
    status: "completed",
    lintsPass: 16,
    lintsInfo: 1,
    lintsWarn: 1,
    lintsFail: 0,
    lintsFatal: 0,
  },
  {
    id: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
    name: "Red Team Audit Snapshot",
    scannedAt: "2026-04-14T07:55:21Z",
    targetCount: 3,
    status: "failed",
    lintsPass: 0,
    lintsInfo: 0,
    lintsWarn: 0,
    lintsFail: 1,
    lintsFatal: 2,
  },
];

export const lintsByScanId: Record<string, Lint[]> = {
  "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b": [
    {
      id: "l1",
      scanId: "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b",
      targetId: "t1",
      certId: "cert-001",
      targetName: "edge-01.smelt.io",
      certSubject: "CN=edge-01.smelt.io",
      certIssuer: "Let's Encrypt R3",
      scannedAt: "2026-04-19T09:34:12Z",
      status: "pass",
      lintResults: healthyLint,
    },
    {
      id: "l2",
      scanId: "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b",
      targetId: "t2",
      certId: "cert-002",
      targetName: "edge-02.smelt.io",
      certSubject: "CN=edge-02.smelt.io",
      certIssuer: "Let's Encrypt R3",
      scannedAt: "2026-04-19T09:34:14Z",
      status: "warn",
      lintResults: warnLint,
    },
    {
      id: "l3",
      scanId: "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b",
      targetId: "t3",
      certId: "cert-003",
      targetName: "edge-03.smelt.io",
      certSubject: "CN=edge-03.smelt.io",
      certIssuer: "DigiCert Global G2",
      scannedAt: "2026-04-19T09:34:15Z",
      status: "info",
      lintResults: infoLint,
    },
  ],
  "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f": [
    {
      id: "l4",
      scanId: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
      targetId: "t4",
      certId: "cert-004",
      targetName: "legacy-api.smelt.io",
      certSubject: "CN=legacy-api.smelt.io",
      certIssuer: "GlobalSign RSA OV SSL CA 2018",
      scannedAt: "2026-04-18T08:11:42Z",
      status: "fail",
      lintResults: failLint,
    },
    {
      id: "l5",
      scanId: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
      targetId: "t5",
      certId: "cert-005",
      targetName: "old-portal.smelt.io",
      certSubject: "CN=old-portal.smelt.io",
      certIssuer: "Sectigo RSA DV",
      scannedAt: "2026-04-18T08:11:44Z",
      status: "fail",
      lintResults: failLint,
    },
    {
      id: "l6",
      scanId: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
      targetId: "t6",
      certId: "cert-006",
      targetName: "internal-legacy.smelt.io",
      certSubject: "CN=internal-legacy.smelt.io",
      certIssuer: "Internal CA",
      scannedAt: "2026-04-18T08:11:45Z",
      status: "warn",
      lintResults: warnLint,
    },
  ],
  "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c": [
    {
      id: "l7",
      scanId: "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c",
      targetId: "t7",
      certId: "cert-007",
      targetName: "vendor-a.example.com",
      certSubject: "CN=vendor-a.example.com",
      certIssuer: "DigiCert TLS RSA SHA256",
      scannedAt: "2026-04-16T13:08:55Z",
      status: "fatal",
      lintResults: fatalLint,
    },
    {
      id: "l8",
      scanId: "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c",
      targetId: "t8",
      certId: "cert-008",
      targetName: "vendor-b.example.com",
      certSubject: "CN=vendor-b.example.com",
      certIssuer: "Sectigo ECC DV",
      scannedAt: "2026-04-16T13:08:57Z",
      status: "pass",
      lintResults: healthyLint,
    },
  ],
  "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b": [
    {
      id: "l9",
      scanId: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
      targetId: "t9",
      certId: "cert-009",
      targetName: "malformed-test.smelt.io",
      certSubject: "CN=malformed-test.smelt.io",
      certIssuer: "Unknown Issuer",
      scannedAt: "2026-04-14T07:55:21Z",
      status: "fatal",
      lintResults: fatalLint,
    },
    {
      id: "l10",
      scanId: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
      targetId: "t10",
      certId: "cert-010",
      targetName: "broken-chain.smelt.io",
      certSubject: "CN=broken-chain.smelt.io",
      certIssuer: "Corrupted CA",
      scannedAt: "2026-04-14T07:55:23Z",
      status: "fatal",
      lintResults: fatalLint,
    },
    {
      id: "l11",
      scanId: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
      targetId: "t11",
      certId: "cert-011",
      targetName: "expired-weak.smelt.io",
      certSubject: "CN=expired-weak.smelt.io",
      certIssuer: "Internal CA",
      scannedAt: "2026-04-14T07:55:24Z",
      status: "fail",
      lintResults: failLint,
    },
  ],
};

export function getLintsForScan(scanId: string): Lint[] {
  return lintsByScanId[scanId] ?? [];
}
