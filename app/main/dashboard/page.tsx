import StatsCards from "@/components/dashboard/StatsCards";
import RecentScansTable from "@/components/dashboard/RecentScansTable";
import AlertFeed from "@/components/dashboard/AlertFeed";
import ComplianceOverview from "@/components/dashboard/ComplianceOverview";

export default function Page() {
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