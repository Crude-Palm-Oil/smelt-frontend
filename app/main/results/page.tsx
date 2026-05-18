import ResultsView from "@/components/results/ResultsView";
import ScanFinishedToast from "@/components/results/ScanFinishedToast";
import AutoRefresh from "@/components/ui/AutoRefresh";
import { getFinishedScans } from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const scans = await getFinishedScans();

  return (
    <div className="flex flex-col gap-8 p-8">
      <ScanFinishedToast />
      <AutoRefresh />

      <ResultsView scans={scans} />
    </div>
  );
}