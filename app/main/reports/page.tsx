import { ReportsClient } from "@/components/reports/ReportsClient"
import { getReports } from "@/services/api"

export default async function ReportsPage() {
  const reports = await getReports()
  return <ReportsClient initialReports={reports} />
}