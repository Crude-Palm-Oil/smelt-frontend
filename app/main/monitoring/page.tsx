import MonitoringTable from "@/components/monitoring/MonitoringTable";
import AlertHistoryTable from "@/components/monitoring/AlertHistoryTable";

export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-10 p-8">
      <MonitoringTable />
      <AlertHistoryTable />
    </div>
  );
}
