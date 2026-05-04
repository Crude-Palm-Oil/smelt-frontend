import { notFound } from "next/navigation";
import ScanResultDetail from "@/components/results/ScanResultDetail";
import { getFinishedScans, getLintsForScan } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [scans, lints] = await Promise.all([
    getFinishedScans(),
    getLintsForScan(id),
  ]);

  const scan = scans.find((s) => s.id === id);
  if (!scan) notFound();

  return <ScanResultDetail scan={scan} lints={lints} />;
}
