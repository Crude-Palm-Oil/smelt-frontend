import ResultsView from "@/components/results/ResultsView";
import ScanFinishedToast from "@/components/results/ScanFinishedToast";
import AutoRefresh from "@/components/ui/AutoRefresh";
import {
  getCertificates,
  getFinishedScans,
  getTargets,
} from "@/services/api";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  // Fetched in parallel. Failures degrade gracefully on each fetch path
  // (each adapter returns [] on 404 / non-ok), so a missing endpoint or
  // empty table renders an empty tab rather than crashing the page.
  const [scans, targets, certificates] = await Promise.all([
    getFinishedScans(),
    getTargets(),
    getCertificates(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <ScanFinishedToast />
      <AutoRefresh />

      <ResultsView scans={scans} targets={targets} certificates={certificates} />
    </div>
  );
}
