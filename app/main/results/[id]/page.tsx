import { notFound } from "next/navigation";
import ScanResultDetail from "@/components/results/ScanResultDetail";
import { getFinishedScans, getLintsForScan, getReports } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [scans, lints, reports] = await Promise.all([
    getFinishedScans(),
    getLintsForScan(id),
    getReports(),
  ]);

  const scan = scans.find((s) => s.id === id);
  if (!scan) notFound();

  const report = reports.find((r: any) => r.id === id)

  return <ScanResultDetail scan={scan} lints={lints} initialReportStatus={report?.pdf_status ?? "Pending"} />;
}