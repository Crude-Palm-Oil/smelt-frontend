// TODO: populate with mock data for each page
// Import types from @/types when ready
import type { Report } from "@/types"

export const mockReports: Report[] = [
  { id: "RPT-2847", domain: "api.example.com",     date: "2026-03-28", certs: 3, status: "pass", format: "PDF"  },
  { id: "RPT-2846", domain: "mail.corp.internal",  date: "2026-03-28", certs: 2, status: "fail", format: "PDF"  },
  { id: "RPT-2840", domain: "cdn.platform.io",     date: "2026-03-27", certs: 5, status: "warn", format: "JSON" },
  { id: "RPT-2835", domain: "auth.service.net",    date: "2026-03-26", certs: 1, status: "pass", format: "PDF"  },
  { id: "RPT-2821", domain: "legacy.internal.org", date: "2026-03-25", certs: 4, status: "fail", format: "PDF"  },
  { id: "RPT-2818", domain: "staging.app.dev",     date: "2026-03-24", certs: 2, status: "pass", format: "JSON" },
]
