const ANALYSIS_API = process.env.NEXT_PUBLIC_ANALYSIS_API_URL ?? "http://localhost:8080";
const REPORT_API = process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001";
const CONFIG_API = process.env.NEXT_PUBLIC_CONFIG_API_URL ?? "http://localhost:8002";

// TODO: implement when backend is ready
// During scaffold phase, import from @/lib/mock-data instead

export async function scanDomain(target: string, port?: number) {
  throw new Error("Not implemented — use mock data");
}

export async function getResults(scanId: string) {
  throw new Error("Not implemented — use mock data");
}

export async function getReports() {
  const res = await fetch(`${REPORT_API}/reports/reports`)
  if (!res.ok) throw new Error("Failed to fetch reports")
  return res.json();
}

export async function downloadReport(scanId: string, filename: string) {
  const res = await fetch(`${REPORT_API}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: scanId }),
  })

  if (!res.ok) throw new Error("Failed to generate report")

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}

export async function viewReport(scanId: string) {
  const res = await fetch(`${REPORT_API}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: scanId }),
  })

  if (!res.ok) throw new Error("Failed to generate report")

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  window.open(url, "_blank")
}

export async function getPolicyProfiles() {
  throw new Error("Not implemented — use mock data");
}

export async function getMonitoredDomains() {
  throw new Error("Not implemented — use mock data");
}
