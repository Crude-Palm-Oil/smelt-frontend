"use client"

import { useState, useEffect, useRef } from "react"
import { ReportsTable } from "@/components/reports/ReportsTable"
import { Report } from "@/types"
import { getReports, downloadReport, viewReport } from "@/services/api"
import { Filter, Download } from "lucide-react"

// Separate function that returns blob instead of triggering download
async function downloadReportBlob(scanId: string): Promise<Blob> {
  const REPORT_API = process.env.NEXT_PUBLIC_REPORT_API_URL ?? "http://localhost:8001"
  const res = await fetch(`${REPORT_API}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: scanId }),
  })
  if (!res.ok) throw new Error("Failed to generate report")
  return res.blob()
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reportBlobs = useRef<Record<string, Blob>>({})

  useEffect(() => {
    getReports()
      .then(async (data) => {
        setReports(data)

        // Auto-generate all PDFs in background
        data.forEach((report: Report) => {
          setReports(prev => prev.map(r =>
            r.id === report.id ? { ...r, pdf_status: "Generating" } : r
          ))

          downloadReportBlob(report.id)
            .then(blob => {
              reportBlobs.current[report.id] = blob
              setReports(prev => prev.map(r =>
                r.id === report.id ? { ...r, pdf_status: "Ready" } : r
              ))
            })
            .catch(() => {
              setReports(prev => prev.map(r =>
                r.id === report.id ? { ...r, pdf_status: "Pending" } : r
              ))
            })
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleView = async (report: Report) => {
    const blob = reportBlobs.current[report.id]
    if (!blob) return
    const url = window.URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  const handleDownload = async (report: Report) => {
    const blob = reportBlobs.current[report.id]
    if (!blob) return
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${report.domain}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="p-6 text-zinc-500 text-sm font-mono">Loading reports...</div>
  )

  if (error) return (
    <div className="p-6 text-red-400 text-sm font-mono">Error: {error}</div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-sm font-mono text-zinc-300 tracking-widest uppercase">
            Reports
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Generated compliance reports
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 transition-colors">
            <Filter size={13} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 transition-colors">
            <Download size={13} />
            Export All
          </button>
        </div>
      </div>

      <ReportsTable
        reports={reports}
        onView={handleView}
        onDownload={handleDownload}
      />
    </div>
  )
}