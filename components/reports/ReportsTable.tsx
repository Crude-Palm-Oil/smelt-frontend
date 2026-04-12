"use client"

import { Report } from "@/types"
import { Eye, Download } from "lucide-react"

const statusStyles: Record<Report["status"], string> = {
  pass: "bg-green-900/40 text-green-400 border border-green-700/50",
  fail: "bg-red-900/40 text-red-400 border border-red-700/50",
  warn: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50",
}

const formatStyles = "bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs px-2 py-0.5 rounded"

interface Props {
  reports: Report[]
  onView: (report: Report) => void
  onDownload: (report: Report) => void
}

export function ReportsTable({ reports, onView, onDownload}: Props) {
  return (
    <div className="rounded-md border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {["REPORT ID", "DOMAIN", "DATE", "CERTS", "STATUS", "FORMAT", "ACTIONS"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-mono text-zinc-500 tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report, i) => (
            <tr
              key={report.id}
              className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${
                i === reports.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="px-4 py-3 font-mono text-zinc-400 text-xs">{report.id}</td>
              <td className="px-4 py-3 font-mono text-emerald-400 text-xs">{report.domain}</td>
              <td className="px-4 py-3 text-zinc-400 text-xs">{report.date}</td>
              <td className="px-4 py-3 text-zinc-400 text-xs">{report.certs}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusStyles[report.status]}`}>
                  {report.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={formatStyles}>{report.format}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onView(report)}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onDownload(report)}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}