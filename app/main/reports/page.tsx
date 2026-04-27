"use client"

import { useState, useEffect } from "react"
import { ReportsTable } from "@/components/reports/ReportsTable"
import { Report } from "@/types"
import { getReports, generateReport, getReportViewUrl, getReportDownloadUrl  } from "@/services/api"
import { Filter, Download } from "lucide-react"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getReports()
      .then(async (data) => {
        setReports(data)

        // Auto-generate for any non-ready reports
        data.forEach((report: Report) => {
          if (report.pdf_status !== "Ready") {
            setReports(prev => prev.map(r =>
              r.id === report.id ? { ...r, pdf_status: "Generating" } : r
            ))
            generateReport(report.id)
              .then(() => {
                setReports(prev => prev.map(r =>
                  r.id === report.id ? { ...r, pdf_status: "Ready" } : r
                ))
              })
              .catch(() => {
                setReports(prev => prev.map(r =>
                  r.id === report.id ? { ...r, pdf_status: "Failed" } : r
                ))
              })
          }
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleView = (report: Report) => {
    window.open(getReportViewUrl(report.id), "_blank")
  }

  const handleDownload = (report: Report) => {
    const a = document.createElement("a")
    a.href = getReportDownloadUrl(report.id)
    a.download = `report-${report.domain}.html`
    a.click()
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