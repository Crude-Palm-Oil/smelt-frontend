export type ScanStatus = "pass" | "fail";

export interface OngoingScan {
  id: string;
  name: string;
  startedAt: string; // ISO timestamp
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

export const ongoingScans: OngoingScan[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "example.com",
    startedAt: new Date(Date.now() - 47_000).toISOString(),
    config: "Default",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "api.example.com",
    startedAt: new Date(Date.now() - 123_000).toISOString(),
    config: "Strict",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "mail.example.com",
    startedAt: new Date(Date.now() - 5_000).toISOString(),
    config: "Default",
  },
];

export const failedScans: FailedScan[] = [
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    name: "mail.example.com",
    scannedAt: "2026-04-19 08:45",
    issues: "Certificate expired — immediate renewal required",
    config: "Strict",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    name: "api.example.com",
    scannedAt: "2026-04-19 08:00",
    issues: "Weak signature algorithm detected (SHA-1)",
    config: "Default",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    name: "legacy.example.com",
    scannedAt: "2026-04-18 22:10",
    issues: "TLS 1.0 deprecated protocol in use",
    config: "Strict",
  },
];

export const allScans: ScanRecord[] = [
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    name: "mail.example.com",
    scannedAt: "2026-04-19 08:45",
    status: "fail",
    config: "Strict",
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    name: "api.example.com",
    scannedAt: "2026-04-19 08:00",
    status: "fail",
    config: "Default",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000001",
    name: "example.com",
    scannedAt: "2026-04-19 07:30",
    status: "pass",
    config: "Default",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000002",
    name: "cdn.example.com",
    scannedAt: "2026-04-18 22:00",
    status: "pass",
    config: "Default",
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    name: "legacy.example.com",
    scannedAt: "2026-04-18 22:10",
    status: "fail",
    config: "Strict",
  },
  {
    id: "a1b2c3d4-0000-0000-0000-000000000003",
    name: "dashboard.example.com",
    scannedAt: "2026-04-18 18:00",
    status: "pass",
    config: "Strict",
  },
];
