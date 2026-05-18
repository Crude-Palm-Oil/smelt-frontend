import ResultsStats from "@/components/results/ResultsStats";
import ResultsTable from "@/components/results/ResultsTable";
import ScanFinishedToast from "@/components/results/ScanFinishedToast";
import { getFinishedScans } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const scans = await getFinishedScans();

  return (
    <div className="flex flex-col gap-8 p-8">
      <ScanFinishedToast />

      <ResultsStats scans={scans} />
      <ResultsTable scans={scans} />
    </div>
  );
}