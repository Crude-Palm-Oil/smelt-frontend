import StatsCards from "./StatsCards";
import RecentScansTable from "./RecentScansTable";
import AlertFeed from "./AlertFeed";
import ComplianceOverview from "./ComplianceOverview";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <StatsCards />

      <div className="grid grid-cols-2 gap-6">
        <RecentScansTable />
        <div className="space-y-6">
          <AlertFeed />
          <ComplianceOverview />
        </div>
      </div>
    </div>
  );
}