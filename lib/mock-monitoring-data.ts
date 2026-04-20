export type ScanStatus = "pass" | "fail";

export interface OngoingScan {
  id: string;
  name: string;
  // Seconds before "now" (resolved client-side to avoid SSR hydration drift)
  startedAtOffsetSec: number;
  config: string;
}

export interface FailedScan {
  id: string;
  name: string;
  scannedAt: string;
  issues: string;
  config: string;
}

export interface ScanRecord {
  id: string;
  name: string;
  scannedAt: string;
  status: ScanStatus;
  config: string;
}

// Active scans are newly dispatched jobs — they haven't landed in `finishedScans`
// yet. Naming style matches the fleet/audit convention used elsewhere.
export const ongoingScans: OngoingScan[] = [
  {
    id: "c8f4a192-6d23-4b71-9e4a-5f1c3e8d7b2a",
    name: "Hourly Edge Health Check",
    startedAtOffsetSec: 47,
    config: "Default",
  },
  {
    id: "d9e5b203-7f34-4c82-af5b-6a2d4f9e8c3b",
    name: "Nightly Compliance Sweep",
    startedAtOffsetSec: 123,
    config: "Strict",
  },
  {
    id: "e0f6c314-8a45-4d93-b06c-7b3e5a0f9d4c",
    name: "New Customer Onboarding Batch",
    startedAtOffsetSec: 5,
    config: "Default",
  },
];

// Kept in sync with `finishedScans` in mock-results-data.ts so the monitoring
// and results views tell the same story to demo spectators.

export const failedScans: FailedScan[] = [
  {
    id: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
    name: "Legacy Services Audit",
    scannedAt: "2026-04-18 08:11",
    issues: "4 certificates failed lint — SHA-1 signatures, expired validity, oversized lifetime",
    config: "Strict",
  },
  {
    id: "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c",
    name: "Third-party Vendor Certs",
    scannedAt: "2026-04-16 13:08",
    issues: "1 fatal parse error + 2 lint failures across vendor certificates",
    config: "Default",
  },
  {
    id: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
    name: "Red Team Audit Snapshot",
    scannedAt: "2026-04-14 07:55",
    issues: "2 certificates failed to parse — malformed DER, invalid signatures",
    config: "Strict",
  },
];

export const allScans: ScanRecord[] = [
  {
    id: "a3f92e48-7c11-4d9a-9f02-1b2c4e5d6a7b",
    name: "Production Edge Fleet",
    scannedAt: "2026-04-19 09:34",
    status: "pass",
    config: "Default",
  },
  {
    id: "b6e23fab-2d44-4a18-bc82-9d0a3e4f5c1d",
    name: "API Gateway Certificates",
    scannedAt: "2026-04-18 14:22",
    status: "pass",
    config: "Default",
  },
  {
    id: "c1d78e92-83b4-4f76-a1c3-5e4d2a6b7c8f",
    name: "Legacy Services Audit",
    scannedAt: "2026-04-18 08:11",
    status: "fail",
    config: "Strict",
  },
  {
    id: "d4a56bc3-f192-4e8d-b7a2-3c9e1f4d2b6a",
    name: "Internal Kubernetes Ingress",
    scannedAt: "2026-04-17 16:45",
    status: "pass",
    config: "Default",
  },
  {
    id: "e8b34c71-6a29-4d5f-8e1c-2b7a9f3e4d5c",
    name: "Customer Subdomain Scan",
    scannedAt: "2026-04-17 11:20",
    status: "pass",
    config: "Default",
  },
  {
    id: "f2c78d45-9e31-4b6a-a52d-8c1f3e6b9a4c",
    name: "Third-party Vendor Certs",
    scannedAt: "2026-04-16 13:08",
    status: "fail",
    config: "Default",
  },
  {
    id: "a9e45b23-c687-4f12-b3d5-6a2e8f1c9d4b",
    name: "Staging Environment",
    scannedAt: "2026-04-15 10:02",
    status: "pass",
    config: "Default",
  },
  {
    id: "b7c12e34-5a89-4f6d-a2b3-9c4e5f1d2a6b",
    name: "Red Team Audit Snapshot",
    scannedAt: "2026-04-14 07:55",
    status: "fail",
    config: "Strict",
  },
];
