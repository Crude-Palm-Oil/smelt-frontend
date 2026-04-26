import { notFound } from "next/navigation";
import ScanResultDetail from "@/components/results/ScanResultDetail";
import { finishedScans } from "@/lib/mock-results-data";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scan = finishedScans.find((s) => s.id === id);

  if (!scan) notFound();

  return <ScanResultDetail scan={scan} />;
}
