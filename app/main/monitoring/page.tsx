import StatsBar from "@/components/monitoring/StatsBar";
import OngoingScans from "@/components/monitoring/OngoingScans";
import AlertHistoryTable from "@/components/monitoring/AlertHistoryTable";
import MonitoringTable from "@/components/monitoring/MonitoringTable";
import ScanStartedToast from "@/components/monitoring/ScanStartedToast";
import AutoRefresh from "@/components/ui/AutoRefresh";
import {
  getOngoingScans,
  getFailedScans,
  getMonitoringHistory,
} from "@/services/api";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const [ongoing, failed, history] = await Promise.all([
    getOngoingScans(),
    getFailedScans(),
    getMonitoringHistory(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-8">
      <ScanStartedToast />
      <AutoRefresh />
      <StatsBar
        allScans={history}
        ongoingScans={ongoing}
        failedScans={failed}
      />
      <OngoingScans scans={ongoing} />
      <AlertHistoryTable failedScans={failed} />
      <MonitoringTable scans={history} />
    </div>
  );
}
