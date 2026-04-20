import StatsBar from "@/components/monitoring/StatsBar";
import OngoingScans from "@/components/monitoring/OngoingScans";
import AlertHistoryTable from "@/components/monitoring/AlertHistoryTable";
import MonitoringTable from "@/components/monitoring/MonitoringTable";

export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <StatsBar />
      <OngoingScans />
      <AlertHistoryTable />
      <MonitoringTable />
    </div>
  );
}
