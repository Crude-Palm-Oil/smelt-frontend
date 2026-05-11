import { Suspense } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentScansTable from "@/components/dashboard/RecentScansTable";
import AlertFeed from "@/components/dashboard/AlertFeed";

export default async function Page() {
  return (
    <div className="space-y-8 p-8">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<PanelSkeleton title="RECENT SCANS" />}>
          <RecentScansTable />
        </Suspense>

        <div className="space-y-6">
          <Suspense fallback={<PanelSkeleton title="ALERT FEED" />}>
            <AlertFeed />
          </Suspense>

        </div>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950"
        />
      ))}
    </div>
  );
}

function PanelSkeleton({ title }: { title: string }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl tracking-[0.2em] text-zinc-100">{title}</h2>
        <div className="mt-4 h-4 w-48 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950" />
    </section>
  );
}